/**
 * Impaginazioni del menu pubblico fatte su misura per un singolo locale. Tutti gli altri locali restano
 * sul menu standard (MenuPageClient) con il tema del Design Studio: qui si entra solo per slug.
 * Nessuna import da React o da Supabase: usato sia dal server (menu-page.tsx) sia dal client.
 */

import type { Place } from './sun-times';

export interface SunsetLayout {
  kind: 'sunset';
  /** Coordinate del locale: il menu passa da chiaro a scuro al tramonto vero, lì */
  place: Place;
  /** Riga sotto il logo, uguale in tutte le lingue (nomi di luogo) */
  placeLabel: string;
}

export type MenuLayout = SunsetLayout;

const MENU_LAYOUTS: Record<string, MenuLayout> = {
  // Sunset Barcarello (Sferracavallo, Palermo): carta tipografica con lo skyline dell'Isola delle Femmine,
  // tema chiaro di giorno e scuro dopo il tramonto
  'sunset-barcarello': {
    kind: 'sunset',
    place: { lat: 38.2124, lng: 13.2785 },
    placeLabel: 'Barcarello · Sferracavallo',
  },
};

export function menuLayoutFor(slug: string): MenuLayout | null {
  return MENU_LAYOUTS[slug] ?? null;
}
