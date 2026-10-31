/**
 * Filtro "senza glutine" del menu pubblico: cosa mostrare per ogni piatto quando il cliente lo attiva.
 *
 * - 'contains': il piatto ha il glutine tra gli allergeni → spento, "Contiene glutine".
 * - 'unknown': il locale non ha inserito nessun allergene e non l'ha segnato come senza glutine → attenuato con
 *   "Allergeni non indicati: chiedi al personale". Senza questo un piatto mai compilato (es. una pizza) sembrerebbe
 *   adatto a un celiaco solo perché nessuno ha scritto "glutine".
 * - 'ok': piatto con allergeni compilati senza glutine, o segnato come senza glutine dal locale.
 * A filtro spento è sempre 'ok'. Usato da DishCard e dal menu Sunset.
 */

export type GlutenStatus = 'ok' | 'contains' | 'unknown';

export function glutenStatus(
  dish: { allergens?: string[] | null; is_gluten_free?: boolean },
  filterOn: boolean,
): GlutenStatus {
  if (!filterOn) return 'ok';
  const allergens = dish.allergens ?? [];
  if (allergens.includes('glutine')) return 'contains';
  if (allergens.length === 0 && !dish.is_gluten_free) return 'unknown';
  return 'ok';
}
