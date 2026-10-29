import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site';

// Client OpenAI (via OpenRouter) creato alla richiesta e non al caricamento del modulo:
// durante la build la chiave può mancare (es. deploy di anteprima) e il build non deve fallire.
function getOpenAI() {
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Go!Food Menu', // header HTTP: solo ASCII
        },
    });
}

const DEFAULT_MODEL = 'google/gemini-2.5-flash';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { images, categories } = body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json(
                { error: 'Nessuna immagine fornita' },
                { status: 400 }
            );
        }

        const existing = Array.isArray(categories) ? categories : [];
        const categoryContext = existing.length > 0
            ? `Categorie già create dal ristoratore:
${existing.map((c: any) => `- ${c.name} (ID: ${c.id})`).join('\n')}`
            : 'Il ristoratore non ha ancora creato categorie.';

        // Le categorie del menu digitale nascono dalle intestazioni del menu (campo "section"): il ristoratore le
        // rivede prima dell'importazione. Mai inventarle: senza un'intestazione visibile "section" resta vuoto.
        const prompt = `
      Sei un esperto ristoratore digitale. Il tuo compito è digitalizzare un menu fisico (foto) in dati strutturati.

      ${categoryContext}

      Istruzioni per l'estrazione:
      1. **Sezioni**: individua le SEZIONI o INTESTAZIONI scritte nel menu (es. "Antipasti", "Le nostre paste", "Vini rossi").
         - Per ogni piatto scrivi in "section" l'intestazione sotto cui compare, copiata esattamente come è scritta
           (stesse parole, iniziale maiuscola e resto minuscolo se nel menu è tutto in maiuscolo).
         - NON inventare sezioni, NON tradurle, NON unirle, NON dedurle dagli ingredienti: se un piatto non ha
           un'intestazione visibile sopra di sé, lascia "section" vuoto ("").
         - Se l'intestazione corrisponde chiaramente a una categoria già creata (stesso significato, es. "Le nostre paste"
           e "Primi"), metti anche il suo ID in "categoryId"; altrimenti lascia "categoryId" vuoto ("").
      2. **Piatto**:
         - **Nome**: esatto come sul menu.
         - **Ingredienti**: tutto il testo descrittivo. NON includere il prezzo. Se c'è solo il prezzo, lascia vuoto.
         - **Prezzo**: numero (usa 0 se manca).
      3. Restituisci i piatti nello stesso ordine in cui compaiono nel menu.

      Restituisci SOLO un oggetto JSON valido con questa struttura esatta:
        {
            "dishes": [
                {
                    "name": "Nome Piatto",
                    "description": "Ingredienti o descrizione trovata (SENZA PREZZO)",
                    "price": 12.50,
                    "section": "Intestazione del menu",
                    "categoryId": "ID di una categoria già creata oppure stringa vuota"
                }
            ]
        }

      Regole di Validazione:
      - **CRUCIALE**: in "categoryId" usa SOLO gli ID dell'elenco sopra. Non inventare ID.
      - **CRUCIALE**: la descrizione NON deve contenere cifre di prezzo (es. "€12" o "12.00"). Solo ingredienti.
    `;

        const contentParts = [
            { type: 'text', text: prompt } as const,
            ...images.map((base64Image: string) => ({
                type: 'image_url' as const,
                image_url: {
                    url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
                },
            })),
        ];

        const completion = await getOpenAI().chat.completions.create({
            // Modello configurabile da Vercel (OPENROUTER_IMPORT_MODEL); predefinito Gemini 2.5 Flash
            model: process.env.OPENROUTER_IMPORT_MODEL || DEFAULT_MODEL,
            messages: [
                {
                    role: 'user',
                    content: contentParts,
                },
            ],
            response_format: { type: 'json_object' },
            // OpenRouter: disattiva il ragionamento interno, fatturato come token di output
            reasoning: { enabled: false },
        } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming & { reasoning: { enabled: boolean } });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Nessuna risposta dall\'AI');
        }

        // Robust JSON extraction: Find the first '{' and the last '}'
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error('Risposta AI non valida: JSON non trovato');
        }

        const jsonString = content.substring(firstBrace, lastBrace + 1);

        try {
            const data = JSON.parse(jsonString);
            return NextResponse.json(data);
        } catch (_parseError) {
            console.error('Error parsing AI response:', content);
            return NextResponse.json(
                { error: 'Errore nel parsing della risposta AI' },
                { status: 500 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error analyzing menu:', error);
        // Log detailed error from OpenAI/OpenRouter if available
        if (error.response) {
            console.error('OpenAI API Error Data:', error.response.data);
            console.error('OpenAI API Error Status:', error.response.status);
        }
        return NextResponse.json(
            { error: error.message || 'Errore durante l\'analisi del menu' },
            { status: error.status || 500 }
        );
    }
}
