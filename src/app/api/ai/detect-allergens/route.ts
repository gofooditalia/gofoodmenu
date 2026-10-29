import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site';
import { AI_MODELS, reasoningFor } from '@/lib/ai-models';

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

interface DishInput {
    id: string;
    name: string;
    description?: string | null;
}

type GlutenFlag = boolean | 'unknown';
type Confidence = 'high' | 'medium' | 'low';

interface RawResult {
    dishId?: unknown;
    dishName?: unknown;
    allergens_certain?: unknown;
    allergens_possible?: unknown;
    contains_gluten?: unknown;
    confidence?: unknown;
    rationale?: unknown;
}

// Parole che il modello potrebbe usare al posto dell'ID → frammento presente nell'ID o nel nome dell'allergene
const ALLERGEN_KEYWORDS: [string[], string][] = [
    [['glutine', 'gluten', 'cereali', 'grano', 'frumento'], 'glutin'],
    [['latte', 'lattosio', 'milk', 'lactose', 'formaggio', 'latticini'], 'latt'],
    [['uova', 'uovo', 'egg', 'eggs'], 'uova'],
    [['pesce', 'fish'], 'pesce'],
    [['crostacei', 'crustaceans', 'gamberi'], 'crostac'],
    [['molluschi', 'molluscs', 'mollusks'], 'mollusc'],
    [['frutta a guscio', 'frutta secca', 'frutta-a-guscio', 'frutta_a_guscio', 'nuts', 'tree nuts'], 'frutta'],
    [['arachidi', 'peanuts', 'peanut'], 'arachid'],
    [['soia', 'soy', 'soya'], 'soia'],
    [['sedano', 'celery'], 'sedano'],
    [['senape', 'mustard'], 'senape'],
    [['sesamo', 'sesame'], 'sesamo'],
    [['solfiti', 'anidride solforosa', 'sulphites', 'sulfites'], 'solf'],
    [['lupini', 'lupin', 'lupino'], 'lupin'],
];

type AllergenRow = { id: string; name: string };

// Converte un valore restituito dal modello (ID, nome o sinonimo) nell'ID dell'allergene; undefined se sconosciuto
function resolveAllergen(value: string, allergens: AllergenRow[]): string | undefined {
    const v = value.trim().toLowerCase();
    if (!v) return undefined;
    const byId = allergens.find((a) => a.id.toLowerCase() === v);
    if (byId) return byId.id.toLowerCase();
    const byName = allergens.find((a) => a.name.toLowerCase() === v || a.name.toLowerCase().startsWith(v));
    if (byName) return byName.id.toLowerCase();
    const keyword = ALLERGEN_KEYWORDS.find(([words]) => words.some((w) => v === w || v.startsWith(w)))?.[1];
    if (!keyword) return undefined;
    return allergens
        .find((a) => a.id.toLowerCase().includes(keyword) || a.name.toLowerCase().includes(keyword))
        ?.id.toLowerCase();
}

function toIdList(value: unknown, allergens: AllergenRow[]): string[] {
    if (!Array.isArray(value)) return [];
    const ids: string[] = [];
    for (const raw of value) {
        if (typeof raw !== 'string') continue;
        const id = resolveAllergen(raw, allergens);
        if (id) ids.push(id);
        else console.warn('[detect-allergens] Allergene non riconosciuto, scartato:', raw);
    }
    return Array.from(new Set(ids));
}

const DEFAULT_MODEL = AI_MODELS.allergens;

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const dishes: DishInput[] = Array.isArray(body?.dishes) ? body.dishes : [];

        if (dishes.length === 0) {
            return NextResponse.json(
                { error: 'Nessun piatto fornito per l\'analisi' },
                { status: 400 }
            );
        }

        // Elenco ufficiale degli allergeni dal database: il modello deve rispondere con questi ID
        const { data: allergenRows, error: allergenError } = await (supabase.from('allergens') as any)
            .select('id, name')
            .order('number');

        if (allergenError || !allergenRows?.length) {
            throw new Error('Impossibile caricare l\'elenco degli allergeni');
        }

        const allergenList = allergenRows as AllergenRow[];
        const glutenId = allergenList.find((a) =>
            a.id.toLowerCase().includes('glutine') || a.name.toLowerCase().includes('glutine')
        )?.id.toLowerCase();

        const dishesForPrompt = dishes.map((d) => ({
            dishId: d.id,
            name: d.name,
            description: d.description || '',
        }));

        const prompt = `
Sei un tecnologo alimentare. Per ogni piatto indica gli allergeni (Reg. UE 1169/2011) separando
ciò che è CERTO da ciò che è solo POSSIBILE. Il ristoratore conosce le proprie ricette meglio di te:
non trasformare mai un'ipotesi in una certezza.

Allergeni ammessi (usa SOLO questi ID, esattamente come scritti):
${allergenList.map((a) => `- ${a.id}: ${a.name}`).join('\n')}

Piatti da analizzare:
${JSON.stringify(dishesForPrompt, null, 2)}

REGOLE
1. allergens_certain: SOLO allergeni contenuti in un ingrediente scritto esplicitamente nel nome o
   nella descrizione, oppure che quell'ingrediente contiene per definizione.
   Esempi: qualsiasi formaggio ("pecorino", "primosale", "ricotta", "mozzarella", "caciocavallo",
   "mascarpone", "philadelphia", "formaggio"), "burro", "panna", "latte" → latte; "gamberi" → crostacei; "spaghetti", "pane",
   "farina", "pangrattato", "pinsa" → glutine; "uovo", "maionese" → uova; "vongole", "cozze" → molluschi.
2. allergens_possible: allergeni che dipendono da una ricetta NON scritta nel menu.
   - Ricette tradizionali con varianti: NON metterli in certain, mettili in possible.
     Esempio: "Tonnarelli cacio e pepe" → certain: glutine, latte; possible: uova
     (alcune paste fresche contengono uova, altre sono solo acqua e farina).
     Esempio: "Carbonara" senza ingredienti → certain: glutine (pasta), uova, latte (sono la
     definizione stessa del piatto); nient'altro.
   - Rischi generici (contaminazione, fritture, salse non descritte): possible, mai certain.
   - Non dedurre allergeni da parole generiche: "verdure" non implica sedano, "salsa" non implica senape.
   - Bevande: vino, spumante e cocktail con vino → solfiti certi; birra → glutine certo (salvo "senza glutine");
     bibite analcoliche (cola, aranciata, chinotto, acqua, caffè) → nessun allergene, salvo ingredienti scritti.
3. Un allergene non può stare sia in certain sia in possible.
4. contains_gluten: true se "${glutenId ?? 'glutine'}" è in certain; "unknown" se è solo in possible;
   false solo se il piatto è chiaramente privo di glutine (es. "Bistecca ai ferri", "Insalata mista").
5. confidence: "high" se gli ingredienti sono espliciti e possible è vuoto; "medium" se c'è almeno
   un possibile; "low" se il nome è generico (es. "Pasta del giorno") e mancano ingredienti.
6. rationale: una frase breve in italiano che spiega certi e possibili.
7. dishId: copia esattamente il valore ricevuto.

Rispondi SOLO con JSON in questo formato:
{
  "results": [
    {
      "dishId": "...",
      "dishName": "...",
      "allergens_certain": ["id"],
      "allergens_possible": ["id"],
      "contains_gluten": true,
      "confidence": "medium",
      "rationale": "..."
    }
  ]
}
`;

        // Modello configurabile da Vercel (OPENROUTER_ALLERGEN_MODEL); predefinito in src/lib/ai-models.ts
        const model = process.env.OPENROUTER_ALLERGEN_MODEL || DEFAULT_MODEL;
        const completion = await getOpenAI().chat.completions.create({
            model,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0, // risposte il più possibile stabili tra una scansione e l'altra
            response_format: { type: 'json_object' },
            reasoning: reasoningFor(model),
        } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming & { reasoning: ReturnType<typeof reasoningFor> });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Nessuna risposta dall\'AI');
        }

        // Estrazione robusta del JSON: dalla prima '{' all'ultima '}'
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error('Risposta AI non valida: JSON non trovato');
        }

        let parsed: { results?: RawResult[] };
        try {
            parsed = JSON.parse(content.substring(firstBrace, lastBrace + 1));
        } catch {
            console.error('Error parsing AI response:', content);
            throw new Error('Errore nel parsing della risposta AI');
        }

        const knownDishIds = new Set(dishes.map((d) => d.id));

        // Validazione: solo ID allergene noti, piatti esistenti, campi coerenti tra loro
        const results = (parsed.results ?? [])
            .filter((r) => typeof r.dishId === 'string' && knownDishIds.has(r.dishId))
            .map((r) => {
                const certain = toIdList(r.allergens_certain, allergenList);
                let possible = toIdList(r.allergens_possible, allergenList).filter((id) => !certain.includes(id));

                let containsGluten: GlutenFlag =
                    r.contains_gluten === true || r.contains_gluten === false ? r.contains_gluten : 'unknown';

                if (glutenId) {
                    // "contiene glutine: sì" vale come glutine certo anche se il modello non l'ha messo nell'elenco
                    if (containsGluten === true && !certain.includes(glutenId)) certain.push(glutenId);
                    if (certain.includes(glutenId)) {
                        containsGluten = true;
                        possible = possible.filter((id) => id !== glutenId);
                    } else if (possible.includes(glutenId)) {
                        containsGluten = 'unknown';
                    }
                }

                const confidence: Confidence =
                    r.confidence === 'high' || r.confidence === 'medium' || r.confidence === 'low'
                        ? r.confidence
                        : 'medium';

                const needsReview = confidence !== 'high' || possible.length > 0 || containsGluten === 'unknown';

                return {
                    dishId: r.dishId as string,
                    dishName: typeof r.dishName === 'string' ? r.dishName : '',
                    allergens: certain,
                    possible_allergens: possible,
                    contains_gluten: containsGluten,
                    confidence: needsReview && confidence === 'high' ? 'medium' : confidence,
                    rationale: typeof r.rationale === 'string' ? r.rationale : '',
                    needs_review: needsReview,
                };
            });

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error('Error detecting allergens:', error);
        return NextResponse.json(
            { error: error.message || 'Errore durante l\'analisi degli allergeni' },
            { status: 500 }
        );
    }
}
