/**
 * Categorie proposte dall'importazione AI del menu (MenuImportModal): nascono dalle intestazioni del menu che l'AI
 * copia in `section`. Si usano quelle già create quando il nome coincide; le altre restano proposte (id `new:<slug>`)
 * finché il ristoratore non conferma l'importazione, e solo allora vengono create.
 */

export const NEW_CATEGORY_PREFIX = 'new:';

export interface ImportedDish {
    name: string;
    description: string;
    price: number;
    section?: string;
    categoryId?: string;
    selected?: boolean;
}

export interface ProposedCategory {
    key: string; // `new:<slug>`
    name: string;
}

export function categorySlug(name: string): string {
    return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * "PRIMI PIATTI" → "Primi piatti", anche con una nota in minuscolo ("PANINI SEMPLICI (pane tipo francesina)");
 * i nomi scritti in maiuscolo e minuscolo normali restano come sono.
 */
export function cleanSectionName(raw: string): string {
    const name = raw.replace(/\s+/g, ' ').trim();
    const isCaps = (w: string) => /[A-ZÀ-Ý]{2,}/.test(w) && w === w.toUpperCase();
    // Intestazione in maiuscolo: si abbassano le parole in maiuscolo, la nota in minuscolo resta com'è
    if (!isCaps(name.split(' ')[0] ?? '')) return name;
    const lowered = name.split(' ').map((w) => (isCaps(w) ? w.toLowerCase() : w)).join(' ');
    return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}

/**
 * Assegna a ogni piatto una categoria esistente o una proposta nuova (nell'ordine in cui compare nel menu).
 * Piatti senza intestazione e senza categoria riconosciuta restano senza categoria: li sceglie il ristoratore.
 */
export function proposeCategories(
    dishes: ImportedDish[],
    existing: { id: string; name: string }[],
    alreadyProposed: ProposedCategory[] = [],
): { dishes: ImportedDish[]; proposed: ProposedCategory[] } {
    const existingIds = new Set(existing.map((c) => c.id));
    const existingBySlug = new Map(existing.map((c) => [categorySlug(String(c.name)), c.id]));
    const proposed = [...alreadyProposed];
    const proposedKeys = new Set(proposed.map((p) => p.key));

    const out = dishes.map((dish) => {
        if (dish.categoryId && existingIds.has(dish.categoryId)) return dish;
        const name = cleanSectionName(dish.section ?? '');
        const slug = categorySlug(name);
        if (!slug) return { ...dish, categoryId: '' };
        const existingId = existingBySlug.get(slug);
        if (existingId) return { ...dish, categoryId: existingId };
        const key = NEW_CATEGORY_PREFIX + slug;
        if (!proposedKeys.has(key)) {
            proposedKeys.add(key);
            proposed.push({ key, name });
        }
        return { ...dish, categoryId: key };
    });

    return { dishes: out, proposed };
}
