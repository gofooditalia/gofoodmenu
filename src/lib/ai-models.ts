/**
 * Modelli AI (OpenRouter) predefiniti per ogni funzione. Ognuno si può cambiare da Vercel con la sua variabile
 * (OPENROUTER_ALLERGEN_MODEL, OPENROUTER_IMPORT_MODEL, OPENROUTER_TRANSLATE_MODEL, OPENROUTER_REVIEW_MODEL).
 * Scelti con prove su menu e piatti veri (29/10/2026):
 * - allergeni su Gemini 3.8 Flash: segna come certo ciò che è scritto e risponde in modo stabile (temperature 0);
 *   un allergene mancato è l'errore più grave del prodotto. Claude Haiku 5.5 non accetta temperature e metteva
 *   tra i "possibili" allergeni quasi certi (uova del tiramisù, glutine della pastella).
 * - importazione, traduzioni e recensioni su Claude Haiku 5.5 con ragionamento minimo: il più preciso
 *   nell'importazione e il più economico tra quelli senza errori nelle traduzioni. Gemini 3.5 Flash-Lite, con
 *   blocchi grandi, traduceva "mandorle" e "noci" con il generico "nuts".
 */
export const AI_MODELS = {
    allergens: 'google/gemini-3.8-flash',
    import: 'anthropic/claude-haiku-5.5',
    translate: 'anthropic/claude-haiku-5.5',
    review: 'anthropic/claude-haiku-5.5',
} as const;

/**
 * Ragionamento interno del modello (OpenRouter `reasoning`), fatturato come token di risposta. Sui Gemini 2.5 si
 * spegne; per gli altri si tiene al minimo (dai Gemini 3.5 è obbligatorio: spegnerlo dà errore 400; con Claude
 * Haiku 5.5 corregge errori come ingredienti inventati nelle traduzioni).
 */
export function reasoningFor(model: string): { enabled: false } | { effort: 'low' } {
    return /gemini-2\.5/.test(model) ? { enabled: false } : { effort: 'low' };
}
