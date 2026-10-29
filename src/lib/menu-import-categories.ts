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

/** "PRIMI PIATTI" → "Primi piatti"; i nomi già scritti in minuscolo/maiuscolo misto restano come sono. */
export function cleanSectionName(raw: string): string {
    const name = raw.replace(/\s+/g, ' ').trim();
    if (name && name === name.toUpperCase() && /[A-ZÀ-Ý]/.test(name)) {
        return name.charAt(0) + name.slice(1).toLowerCase();
    }
    return name;
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
