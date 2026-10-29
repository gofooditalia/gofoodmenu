/**
 * Traduce il menu di un locale nelle sue lingue con l'AI (OpenRouter) e salva le traduzioni nel database
 * (migrazione 039). Solo lato server, con la service role. Le lingue sono quelle attive del locale
 * (tenants.menu_languages); il pulsante in /admin passa quelle scelte e poi le attiva.
 *
 * Traduce solo ciò che manca o è cambiato: un piatto si ritraduce in tutte le lingue se il testo italiano non
 * coincide più con `translations.source`; altrimenti solo nelle lingue mancanti (es. una lingua appena aggiunta),
 * senza toccare quelle già fatte. Gli allergeni non passano di qui (nomi fissi in src/lib/menu-i18n.ts).
 * La chiamano il pulsante "Traduci menu" in /admin e la traduzione automatica (src/lib/menu-translation-jobs.ts).
 * Le lingue corrette a mano dal ristoratore (`translations.manual`, /dashboard/translations) non si ritraducono
 * finché il testo italiano resta lo stesso.
 */

import OpenAI from 'openai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/site';
import { AI_MODELS, reasoningFor } from '@/lib/ai-models';
import { isTranslatedLang, type TranslatedLang } from '@/lib/menu-languages';

const DEFAULT_MODEL = AI_MODELS.translate;
// Voci × lingue per chiamata: abbastanza poche da non superare la risposta massima del modello
// (25 voci con 4 lingue, 16 con 6)
const MAX_PAIRS_PER_CALL = 100;
const PARALLEL_CALLS = 3;
// Una chiamata bloccata non deve consumare tutta la durata della funzione Vercel
const CALL_TIMEOUT_MS = 90_000;

export interface TextPair {
    name: string;
    description: string;
}

// manual: lingue corrette a mano dal ristoratore (src/lib/translation-edits.ts), da non ritradurre
export type Translations = Partial<Record<TranslatedLang, TextPair>> & { source?: TextPair; manual?: TranslatedLang[] };

interface Item {
    key: string; // "d:<id>", "c:<id>", "t:tagline"
    name: string;
    description: string;
    langs: TranslatedLang[]; // lingue da tradurre
    current: Translations | null; // traduzioni già valide da tenere (stesso testo italiano)
}

const LANG_NAMES: Record<TranslatedLang, string> = {
    en: 'inglese',
    fr: 'francese',
    de: 'tedesco',
    es: 'spagnolo',
    pl: 'polacco',
    pt: 'portoghese europeo (Portogallo)',
    zh: 'cinese semplificato',
    ar: 'arabo standard moderno',
};

/**
 * Lunghezza della descrizione tradotta rispetto all'italiana (minimo, massimo). Il cinese è molto più corto
 * (un carattere per parola o quasi, ma i nomi lasciati in italiano restano lunghi), l'arabo un po' più corto:
 * con la stessa soglia delle lingue europee si scarterebbero traduzioni giuste.
 */
const LENGTH_RATIO: Record<TranslatedLang, [number, number]> = {
    en: [0.5, 1.8],
    fr: [0.5, 1.8],
    de: [0.5, 1.8],
    es: [0.5, 1.8],
    pl: [0.5, 1.8],
    pt: [0.5, 1.8],
    zh: [0.12, 1.2],
    ar: [0.4, 1.6],
};

export interface TranslateMenuResult {
    translated: number;
    upToDate: number;
    failed: number;
    skipped: number; // voci non tentate perché è arrivata la scadenza (deadline): le riprende il giro successivo
}

export interface TranslateMenuOptions {
    // Attiva le lingue del menu (tenants.menu_languages): solo il pulsante in /admin, mai la traduzione automatica
    activate?: boolean;
    // Lingue da tradurre (e da attivare con `activate`). Senza: le lingue già attive del locale
    langs?: TranslatedLang[];
    // Ora (ms) dopo la quale non si avviano altri blocchi: quanto è già tradotto viene salvato
    deadline?: number;
}

function getOpenAI() {
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        timeout: CALL_TIMEOUT_MS,
        maxRetries: 0, // un blocco non riuscito lo riprende il giro successivo
        defaultHeaders: {
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Go!Food Menu', // header HTTP: solo ASCII
        },
    });
}

function systemPrompt(langs: TranslatedLang[]) {
    const list = langs.map((l) => `${LANG_NAMES[l]} (${l})`).join(', ');
    const example = langs.map((l) => `"${l}": {"name": "...", "description": "..."}`).join(', ');
    return `Sei un traduttore professionista di menu di ristoranti italiani.
Traduci ogni voce dall'italiano in queste lingue: ${list}.

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
- "Frutta secca" nei menu italiani è la frutta a guscio (noci, mandorle, nocciole, pistacchi), non la frutta
  essiccata: inglese "nuts", francese "fruits à coque", tedesco "Nüsse", spagnolo "frutos secos", polacco
  "orzechy", portoghese "frutos de casca rija". Vale anche per "granella di frutta secca" e simili.
- "Noccioline" sono le arachidi, mai le nocciole (allergeni diversi): inglese "peanuts", francese "cacahuètes",
  tedesco "Erdnüsse", spagnolo "cacahuetes", polacco "orzeszki ziemne", portoghese "amendoins".
  "Nocciole" invece sono le nocciole (hazelnuts).
- Lascia invariati simboli, numeri, asterischi (*), unità di misura, prezzi e marchi.
- Le categorie (es. "Antipasti", "I Primi della Tradizione") si traducono in modo naturale.
- Inglese britannico e termini coerenti in tutto il menu: aubergine, courgette, draught beer, spirits;
  "all'etto" → "per 100 g" (e l'equivalente nelle altre lingue).
- Portoghese: quello del Portogallo, non del Brasile.
- Cinese: caratteri semplificati, cinese standard. Arabo: arabo standard moderno, senza vocali brevi (harakat).
  In cinese e arabo i nomi dei piatti tipici e degli ingredienti che restano in italiano si scrivono in caratteri
  latini, come in italiano (es. "Carbonara", "guanciale"), dentro il testo tradotto. Numeri in cifre arabe
  occidentali (0-9). "Frutta secca" (a guscio): cinese "坚果", arabo "المكسرات". "Noccioline" (arachidi): cinese
  "花生", arabo "الفول السوداني" (anche "granella di noccioline": arabo "فول سوداني مجروش", mai "مكسرات").
- Cinese e arabo, nomi dei piatti: un nome di fantasia (nome proprio, aggettivo o parola che non descrive il piatto,
  es. "GOLOSO", "SFIZIOSO", "MAX", "IL SAPORITO", nomi di cocktail o di marchi) resta IDENTICO, in caratteri latini
  e con le stesse maiuscole: non tradurlo, non traslitterarlo, anche se ha un significato in italiano. Il cliente
  deve poter leggere al cameriere lo stesso nome del menu italiano. Si traducono solo i nomi che descrivono il
  piatto ("Spaghetti cozze e vongole", "Filetti di orata grigliati"); se il nome mescola le due cose, la parte di
  fantasia resta in latino (es. "Tagliatelle Goloso" → cinese "Goloso 宽面").
- Testo breve e naturale, come in un menu stampato. Niente virgolette in più, niente note.

Rispondi SOLO con JSON: {"items": {"<key>": {${example}}}}
con esattamente le stesse key ricevute e tutte le lingue richieste.`;
}

function sameSource(a: TextPair | undefined, b: TextPair): boolean {
    return !!a && a.name === b.name && a.description === b.description;
}

/**
 * Una descrizione tradotta deve corrispondere a quella italiana: vuota se l'italiana è vuota, e di lunghezza
 * simile se è un elenco di ingredienti. Scarta i casi in cui il modello ha sostituito gli ingredienti con una
 * frase generica (es. carbonara → "Traditional Roman pasta dish") o ha aggiunto spiegazioni.
 */
function plausibleDescription(source: string, translated: string, lang: TranslatedLang): boolean {
    if (!source) return translated === '';
    if (!translated) return false;
    if (source.length < 25) return true;
    const ratio = translated.length / source.length;
    const [min, max] = LENGTH_RATIO[lang];
    return ratio >= min && ratio <= max;
}

/**
 * Lingue ancora da tradurre per una voce: tutte se il testo italiano è cambiato, altrimenti quelle mancanti.
 * Anche le traduzioni già salvate si ricontrollano: quelle non plausibili si rifanno.
 */
function missingLangs(t: Translations | null | undefined, source: TextPair, langs: TranslatedLang[]): TranslatedLang[] {
    if (!t || !sameSource(t.source, source)) return [...langs];
    const manual = Array.isArray(t.manual) ? t.manual : [];
    return langs.filter((lang) => {
        const pair = t[lang];
        if (!pair?.name) return true;
        // Una correzione del ristoratore vale così com'è, anche se più corta o più lunga del previsto
        return !manual.includes(lang) && !plausibleDescription(source.description, pair.description, lang);
    });
}

function readPair(value: unknown): TextPair | null {
    if (!value || typeof value !== 'object') return null;
    const v = value as Record<string, unknown>;
    if (typeof v.name !== 'string') return null;
    return { name: v.name.trim(), description: typeof v.description === 'string' ? v.description.trim() : '' };
}

// Tutte le voci di un blocco chiedono le stesse lingue
async function translateBatch(items: Item[]): Promise<Map<string, Translations>> {
    const langs = items[0].langs;
    const payload = Object.fromEntries(items.map((i) => [i.key, { name: i.name, description: i.description }]));
    const model = process.env.OPENROUTER_TRANSLATE_MODEL || DEFAULT_MODEL;
    const completion = await getOpenAI().chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt(langs) },
            { role: 'user', content: JSON.stringify({ items: payload }) },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
        reasoning: reasoningFor(model),
    } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming & { reasoning: ReturnType<typeof reasoningFor> });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(raw) as { items?: Record<string, Record<string, unknown>> };
    const out = new Map<string, Translations>();
    for (const item of items) {
        const entry = parsed.items?.[item.key];
        if (!entry) continue;
        // Le lingue già valide restano come sono, si aggiungono quelle appena tradotte
        const t: Translations = { ...(item.current ?? {}), source: { name: item.name, description: item.description } };
        let ok = true;
        for (const lang of langs) {
            const pair = readPair(entry[lang]);
            // Senza nome tradotto o con una descrizione che non corrisponde all'italiano la voce resta da
            // tradurre: nel menu si vedrà l'italiano, e il prossimo "Traduci menu" ci riprova
            if (!pair || !pair.name || !plausibleDescription(item.description, pair.description, lang)) {
                ok = false;
                break;
            }
            t[lang] = pair;
        }
        if (ok) out.set(item.key, t);
    }
    return out;
}

interface PendingItems {
    todo: Item[];
    upToDate: number;
    tenantTranslations: Record<string, Translations>;
}

/**
 * Voci del locale da tradurre (nuove, cambiate o con lingue mancanti). Solo letture, nessuna chiamata AI.
 * Senza `langs` valgono le lingue già attive del locale (nessuna: niente da tradurre).
 */
async function collectPendingItems(admin: SupabaseClient, tenantId: string, langs?: TranslatedLang[]): Promise<PendingItems> {
    const [{ data: tenant, error: tenantError }, { data: categories, error: catError }, { data: dishes, error: dishError }] =
        await Promise.all([
            admin.from('tenants').select('id, footer_data, translations, menu_languages').eq('id', tenantId).single(),
            admin.from('categories').select('id, name, description, translations').eq('tenant_id', tenantId),
            admin.from('dishes').select('id, name, description, translations').eq('tenant_id', tenantId),
        ]);
    if (tenantError || !tenant) throw new Error(`Locale non trovato: ${tenantError?.message ?? tenantId}`);
    if (catError) throw new Error(`Lettura categorie: ${catError.message}`);
    if (dishError) throw new Error(`Lettura piatti: ${dishError.message}`);

    const targetLangs = langs ?? ((tenant.menu_languages as string[] | null) ?? []).filter(isTranslatedLang);
    const todo: Item[] = [];
    let upToDate = 0;
    const consider = (key: string, name: string | null, description: string | null, current: Translations | null) => {
        const source = { name: (name ?? '').trim(), description: (description ?? '').trim() };
        if (!source.name || !targetLangs.length) return;
        const missing = missingLangs(current, source, targetLangs);
        if (!missing.length) upToDate += 1;
        else todo.push({ key, ...source, langs: missing, current: sameSource(current?.source, source) ? current : null });
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

    return { todo, upToDate, tenantTranslations };
}

/** Quante voci del locale aspettano una traduzione nelle sue lingue attive (per il cron: nessuna chiamata AI se è tutto aggiornato). */
export async function countPendingTranslations(admin: SupabaseClient, tenantId: string): Promise<number> {
    return (await collectPendingItems(admin, tenantId)).todo.length;
}

/**
 * Traduce e salva piatti, categorie e sottotitolo del locale; con `activate` attiva poi le lingue del menu
 * (esattamente quelle di `langs`: una lingua tolta dalla scelta si disattiva, le sue traduzioni restano salvate).
 */
export async function translateTenantMenu(
    admin: SupabaseClient,
    tenantId: string,
    { activate = false, langs, deadline }: TranslateMenuOptions = {},
): Promise<TranslateMenuResult> {
    if (activate && !langs?.length) throw new Error('Nessuna lingua scelta');
    const { todo, upToDate, tenantTranslations } = await collectPendingItems(admin, tenantId, langs);

    // Blocchi di voci che chiedono le stesse lingue, più grandi quando le lingue sono poche
    const groups = new Map<string, Item[]>();
    for (const item of todo) {
        const key = item.langs.join(',');
        groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    const batches: Item[][] = [];
    for (const items of groups.values()) {
        const size = Math.max(1, Math.floor(MAX_PAIRS_PER_CALL / items[0].langs.length));
        for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
    }

    const results = new Map<string, Translations>();
    let failedBatches = 0;
    let skipped = 0;
    for (let i = 0; i < batches.length; i += PARALLEL_CALLS) {
        if (deadline && Date.now() > deadline) {
            skipped = batches.slice(i).reduce((n, b) => n + b.length, 0);
            break;
        }
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

    const failed = todo.length - translated - skipped;
    // Le lingue si attivano anche se qualche voce manca: quelle voci restano in italiano nel menu tradotto
    if (activate && langs && translated + upToDate > 0) {
        const { error } = await admin.from('tenants').update({ menu_languages: [...langs] }).eq('id', tenantId);
        if (error) throw new Error(`Attivazione lingue: ${error.message}`);
    }
    if (failedBatches || failedWrites) {
        console.warn(`[translate-menu] ${tenantId}: ${failedBatches} blocchi e ${failedWrites} salvataggi non riusciti`);
    }

    return { translated, upToDate, failed, skipped };
}
