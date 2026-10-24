/**
 * Traduce il menu di un locale in inglese, francese, tedesco e spagnolo con l'AI (OpenRouter) e salva
 * le traduzioni nel database (migrazione 039). Solo lato server, con la service role.
 *
 * Traduce solo ciò che manca o è cambiato: un piatto si ritraduce se il testo italiano non coincide più
 * con `translations.source`. Gli allergeni non passano di qui (nomi fissi in src/lib/menu-i18n.ts).
 */

import OpenAI from 'openai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/site';
import { TRANSLATED_LANGS, type TranslatedLang } from '@/lib/menu-languages';

const DEFAULT_MODEL = 'google/gemini-2.5-flash';
// Voci per chiamata: abbastanza poche da non superare la risposta massima del modello con 4 lingue
const BATCH_SIZE = 25;
const PARALLEL_CALLS = 3;

export interface TextPair {
    name: string;
    description: string;
}

export type Translations = Partial<Record<TranslatedLang, TextPair>> & { source?: TextPair };

interface Item {
    key: string; // "d:<id>", "c:<id>", "t:tagline"
    name: string;
    description: string;
}

export interface TranslateMenuResult {
    translated: number;
    upToDate: number;
    failed: number;
}

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

const SYSTEM_PROMPT = `Sei un traduttore professionista di menu di ristoranti italiani.
Traduci ogni voce dall'italiano in inglese (en), francese (fr), tedesco (de) e spagnolo (es).

Regole:
- La descrizione tradotta è SOLO la traduzione della descrizione italiana, voce per voce: stessi ingredienti,
  stesso ordine, nessuna spiegazione, nessuna frase aggiunta. Non riassumere mai un elenco di ingredienti con una
  frase generica. Se la descrizione italiana è vuota, la descrizione tradotta è una stringa vuota.
- I nomi dei piatti tipici italiani e regionali (es. carbonara, amatriciana, cacio e pepe, gricia, supplì,
  arancina, saltimbocca, tiramisù, pinsa) NON si traducono: restano in italiano, con le stesse maiuscole.
  Anche i nomi di fantasia del locale (es. "Der Pupone", "Bruciaculo", "Giulio Cesare") restano invariati.
- I nomi generici si traducono ("Tagliere di salumi" → "Cured meat platter", "Patate al forno" → "Baked potatoes").
- Nelle descrizioni traduci gli ingredienti in modo fedele: non aggiungere, togliere o cambiare ingredienti.
  Usa i termini di cucina corretti nella lingua di arrivo. Ingredienti italiani senza equivalente (guanciale,
  pecorino, stracciatella, fiordilatte, porchetta, mortadella) restano in italiano.
- Lascia invariati simboli, numeri, asterischi (*), unità di misura, prezzi e marchi.
- Le categorie (es. "Antipasti", "I Primi della Tradizione") si traducono in modo naturale.
- Inglese britannico e termini coerenti in tutto il menu: aubergine, courgette, draught beer, spirits;
  "all'etto" → "per 100 g".
- Testo breve e naturale, come in un menu stampato. Niente virgolette in più, niente note.

Rispondi SOLO con JSON: {"items": {"<key>": {"en": {"name": "...", "description": "..."}, "fr": {...}, "de": {...}, "es": {...}}}}
con esattamente le stesse key ricevute.`;

function sameSource(a: TextPair | undefined, b: TextPair): boolean {
    return !!a && a.name === b.name && a.description === b.description;
}

/**
 * Una descrizione tradotta deve corrispondere a quella italiana: vuota se l'italiana è vuota, e di lunghezza
 * simile se è un elenco di ingredienti. Scarta i casi in cui il modello ha sostituito gli ingredienti con una
 * frase generica (es. carbonara → "Traditional Roman pasta dish") o ha aggiunto spiegazioni.
 */
function plausibleDescription(source: string, translated: string): boolean {
    if (!source) return translated === '';
    if (!translated) return false;
    if (source.length < 25) return true;
    const ratio = translated.length / source.length;
    return ratio >= 0.5 && ratio <= 1.8;
}

function isComplete(t: Translations | null | undefined, source: TextPair): boolean {
    if (!t || !sameSource(t.source, source)) return false;
    // Anche le traduzioni già salvate si ricontrollano: quelle non plausibili si rifanno
    return TRANSLATED_LANGS.every((lang) => {
        const pair = t[lang];
        return !!pair?.name && plausibleDescription(source.description, pair.description);
    });
}

function readPair(value: unknown): TextPair | null {
    if (!value || typeof value !== 'object') return null;
    const v = value as Record<string, unknown>;
    if (typeof v.name !== 'string') return null;
    return { name: v.name.trim(), description: typeof v.description === 'string' ? v.description.trim() : '' };
}

async function translateBatch(items: Item[]): Promise<Map<string, Translations>> {
    const payload = Object.fromEntries(items.map((i) => [i.key, { name: i.name, description: i.description }]));
    const completion = await getOpenAI().chat.completions.create({
        model: process.env.OPENROUTER_TRANSLATE_MODEL || DEFAULT_MODEL,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify({ items: payload }) },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(raw) as { items?: Record<string, Record<string, unknown>> };
    const out = new Map<string, Translations>();
    for (const item of items) {
        const entry = parsed.items?.[item.key];
        if (!entry) continue;
        const t: Translations = { source: { name: item.name, description: item.description } };
        let ok = true;
        for (const lang of TRANSLATED_LANGS) {
            const pair = readPair(entry[lang]);
            // Senza nome tradotto o con una descrizione che non corrisponde all'italiano la voce resta da
            // tradurre: nel menu si vedrà l'italiano, e il prossimo "Traduci menu" ci riprova
            if (!pair || !pair.name || !plausibleDescription(item.description, pair.description)) {
                ok = false;
                break;
            }
            t[lang] = pair;
        }
        if (ok) out.set(item.key, t);
    }
    return out;
}

/** Traduce e salva piatti, categorie e sottotitolo del locale; poi attiva le lingue del menu. */
export async function translateTenantMenu(admin: SupabaseClient, tenantId: string): Promise<TranslateMenuResult> {
    const [{ data: tenant, error: tenantError }, { data: categories, error: catError }, { data: dishes, error: dishError }] =
        await Promise.all([
            admin.from('tenants').select('id, footer_data, translations').eq('id', tenantId).single(),
            admin.from('categories').select('id, name, description, translations').eq('tenant_id', tenantId),
            admin.from('dishes').select('id, name, description, translations').eq('tenant_id', tenantId),
        ]);
    if (tenantError || !tenant) throw new Error(`Locale non trovato: ${tenantError?.message ?? tenantId}`);
    if (catError) throw new Error(`Lettura categorie: ${catError.message}`);
    if (dishError) throw new Error(`Lettura piatti: ${dishError.message}`);

    const todo: Item[] = [];
    let upToDate = 0;
    const consider = (key: string, name: string | null, description: string | null, current: Translations | null) => {
        const source = { name: (name ?? '').trim(), description: (description ?? '').trim() };
        if (!source.name) return;
        if (isComplete(current, source)) upToDate += 1;
        else todo.push({ key, ...source });
    };

    for (const c of categories ?? []) consider(`c:${c.id}`, c.name, c.description, c.translations as Translations);
    for (const d of dishes ?? []) consider(`d:${d.id}`, d.name, d.description, d.translations as Translations);
    // Il sottotitolo sta in footer_data.tagline (Design Studio): tenants non ha una colonna tagline
    const tagline = (tenant.footer_data as { tagline?: string } | null)?.tagline ?? '';
    const tenantTranslations = (tenant.translations as Record<string, Translations> | null) ?? {};
    if (tagline.trim()) consider('t:tagline', tagline, '', tenantTranslations.tagline ?? null);
    // Descrizione del locale nel piè di pagina del menu (Design Studio: footer_data.brand_description.it)
    const brand = (tenant.footer_data as { brand_description?: { it?: string } } | null)?.brand_description?.it ?? '';
    if (brand.trim()) consider('t:brand', brand, '', tenantTranslations.brand ?? null);

    const batches: Item[][] = [];
    for (let i = 0; i < todo.length; i += BATCH_SIZE) batches.push(todo.slice(i, i + BATCH_SIZE));

    const results = new Map<string, Translations>();
    let failedBatches = 0;
    for (let i = 0; i < batches.length; i += PARALLEL_CALLS) {
        const chunk = batches.slice(i, i + PARALLEL_CALLS);
        const settled = await Promise.allSettled(chunk.map(translateBatch));
        settled.forEach((r) => {
            if (r.status === 'fulfilled') r.value.forEach((v, k) => results.set(k, v));
            else {
                failedBatches += 1;
                console.error('[translate-menu] Blocco non tradotto:', r.reason);
            }
        });
    }

    let translated = 0;
    let failedWrites = 0;
    const tenantTexts: Record<string, unknown> = { ...tenantTranslations };
    for (const [key, t] of results) {
        const [kind, id] = [key.slice(0, 1), key.slice(2)];
        let error: { message: string } | null = null;
        if (kind === 'd') ({ error } = await admin.from('dishes').update({ translations: t }).eq('id', id));
        else if (kind === 'c') ({ error } = await admin.from('categories').update({ translations: t }).eq('id', id));
        else if (kind === 't') {
            // Testi del locale (sottotitolo, descrizione): un solo oggetto, aggiornato voce per voce
            tenantTexts[key.slice(2)] = t;
            ({ error } = await admin.from('tenants').update({ translations: tenantTexts }).eq('id', tenantId));
        }
        if (error) {
            failedWrites += 1;
            console.error('[translate-menu] Salvataggio non riuscito:', key, error.message);
        } else translated += 1;
    }

    const failed = todo.length - translated;
    // Le lingue si attivano anche se qualche voce manca: quelle voci restano in italiano nel menu tradotto
    if (translated + upToDate > 0) {
        const { error } = await admin.from('tenants').update({ menu_languages: [...TRANSLATED_LANGS] }).eq('id', tenantId);
        if (error) throw new Error(`Attivazione lingue: ${error.message}`);
    }
    if (failedBatches || failedWrites) {
        console.warn(`[translate-menu] ${tenantId}: ${failedBatches} blocchi e ${failedWrites} salvataggi non riusciti`);
    }

    return { translated, upToDate, failed };
}
