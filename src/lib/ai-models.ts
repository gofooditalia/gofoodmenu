/**
 * Modelli AI (OpenRouter) predefiniti per ogni funzione. Ognuno si può cambiare da Vercel con la sua variabile
 * (OPENROUTER_ALLERGEN_MODEL, OPENROUTER_IMPORT_MODEL, OPENROUTER_TRANSLATE_MODEL, OPENROUTER_REVIEW_MODEL).
 * Allergeni sul modello più preciso: un allergene mancato è l'errore più grave del prodotto.
 * Traduzioni ancora su 2.5 Flash: provato il 29/10/2026, 3.5 Flash-Lite con blocchi grandi (16 voci × 6 lingue)
 * traduceva "mandorle" e "noci" con il generico "nuts", e il cliente allergico perde l'ingrediente preciso.
 */
export const AI_MODELS = {
    allergens: 'google/gemini-3.8-flash',
    import: 'google/gemini-3.5-flash-lite',
    translate: 'google/gemini-2.5-flash',
    review: 'google/gemini-3.5-flash-lite',
} as const;

/**
 * Ragionamento interno del modello (OpenRouter `reasoning`), fatturato come token di risposta. Sui Gemini 2.5 si
 * spegne; dai Gemini 3.5 in poi è obbligatorio (spegnerlo dà errore 400) e si tiene al minimo.
 */
export function reasoningFor(model: string): { enabled: false } | { effort: 'low' } {
    return /gemini-2\.5/.test(model) ? { enabled: false } : { effort: 'low' };
}
