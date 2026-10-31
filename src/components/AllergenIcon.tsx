/**
 * Icone al tratto dei 14 allergeni del Reg. UE 1169/2011, una diversa per ogni allergene (le emoji di
 * ALLERGEN_LIST avevano soia e lupini uguali e il sesamo come semplice cerchio).
 *
 * Griglia 24×24, tratto 1.5 arrotondato in `currentColor`: prendono il colore del testo intorno, quindi
 * funzionano su temi chiari e scuri. Sono decorative (aria-hidden): accanto va sempre scritto il nome
 * dell'allergene, l'icona da sola non basta a chi ha un'allergia.
 * Chiavi = id degli allergeni salvati nei piatti (`dishes.allergens`), come in ALLERGEN_LIST.
 */

import type { ReactNode } from 'react';

const DOT = 'h.01'; // segmento minimo: con le estremità arrotondate diventa un puntino

const ICONS = {
  // Spiga di grano
  glutine: (
    <>
      <path d="M12 22V7.5" />
      <path d="M12 7.5c-1.3-1.1-1.3-3.7 0-5.2 1.3 1.5 1.3 4.1 0 5.2z" />
      <path d="M12 11.5c-2.6 0-4.2-1.4-4.4-3.9 2.6 0 4.2 1.4 4.4 3.9z" />
      <path d="M12 11.5c2.6 0 4.2-1.4 4.4-3.9-2.6 0-4.2 1.4-4.4 3.9z" />
      <path d="M12 15.5c-2.6 0-4.2-1.4-4.4-3.9 2.6 0 4.2 1.4 4.4 3.9z" />
      <path d="M12 15.5c2.6 0 4.2-1.4 4.4-3.9-2.6 0-4.2 1.4-4.4 3.9z" />
      <path d="M12 19.5c-2.6 0-4.2-1.4-4.4-3.9 2.6 0 4.2 1.4 4.4 3.9z" />
      <path d="M12 19.5c2.6 0 4.2-1.4 4.4-3.9-2.6 0-4.2 1.4-4.4 3.9z" />
    </>
  ),
  // Gambero
  crostacei: (
    <>
      <path d="M20 7.5C13 6 6 9.5 6 15.5c0 1.5 1 2.5 2.25 2.5" />
      <path d="M20 11c-5-1-9.5 1-9.5 4.5 0 1.5-1 2.5-2.25 2.5" />
      <path d="M20 7.5V11" />
      <path d="M8.25 18 6.5 21.5h3.5z" />
      <path d="m13.9 7.4 1.8 3.5" />
      <path d="m9.6 9.1 3.2 2.7" />
      <path d="M20 7.5c1-2.5-.5-4.5-4.5-4.5" />
      <path d="M14.5 11.4 14 13.5" />
      <path d="M17 11v2" />
      <path d={`M18.4 8.8${DOT}`} />
    </>
  ),
  // Uovo
  uova: (
    <>
      <path d="M12 3C8 3 5.5 9 5.5 13.5 5.5 18 8.5 21 12 21s6.5-3 6.5-7.5C18.5 9 16 3 12 3z" />
      <path d="M8.6 14.5c0-2.2.6-4.3 1.8-6" />
    </>
  ),
  // Pesce
  pesce: (
    <>
      <path d="M18 12c-3-4.6-9-5-12.5 0 3.5 5 9.5 4.6 12.5 0z" />
      <path d="M18 12l3.5-3.5v7z" />
      <path d="M10.5 9.3c.8 1.6.8 3.8 0 5.4" />
      <path d={`M8 11.4${DOT}`} />
    </>
  ),
  // Arachide nel guscio
  arachidi: (
    <>
      <path d="M12 2.5c-3 0-4.5 2-4.5 4.5 0 2 1.3 3.2 1.5 5 .2 1.8-1.5 3-1.5 5 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-2-1.7-3.2-1.5-5 .2-1.8 1.5-3 1.5-5 0-2.5-1.5-4.5-4.5-4.5z" />
      <path d={`M10.4 5.8${DOT}M13.4 7.3${DOT}M11 9.2${DOT}M10.6 16.2${DOT}M13.4 15.6${DOT}M12 18.8${DOT}`} />
    </>
  ),
  // Baccello di soia con tre semi
  soia: (
    <g transform="rotate(-35 12 12)">
      <path d="M2.5 12c0-3 2.4-3.6 4.5-3 1.4-1.1 3.6-1.1 5 0 1.4-1.1 3.6-1.1 5 0 2.1-.6 4.5 0 4.5 3s-2.4 3.6-4.5 3c-1.4 1.1-3.6 1.1-5 0-1.4 1.1-3.6 1.1-5 0-2.1.6-4.5 0-4.5-3z" />
      <circle cx="7" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="17" cy="12" r="1.6" />
    </g>
  ),
  // Cartone del latte
  lattosio: (
    <>
      <path d="M7 21V9l2.5-4h5L17 9v12z" />
      <path d="M9.5 5V3h5v2" />
      <path d="M7 9h10" />
      <path d="M12 12.5c-1.3 1.6-2 2.7-2 3.6a2 2 0 0 0 4 0c0-.9-.7-2-2-3.6z" />
    </>
  ),
  // Frutto a guscio con cappello (ghianda-nocciola, simbolo comune della frutta a guscio)
  'frutta-secca': (
    <>
      <path d="M8 10.5c-1.6 1-2.5 2.4-2.5 4.2C5.5 18.2 8.5 21 12 21s6.5-2.8 6.5-6.3c0-1.8-.9-3.2-2.5-4.2" />
      <path d="M6.5 10.5c-.8-3 1.4-5 5.5-5s6.3 2 5.5 5z" />
      <path d="M12 5.5V3.2c0-.5.4-.9 1.4-1" />
      <path d="m8.5 9.5 2-2.5" />
      <path d="m11.5 9.5 2-2.5" />
      <path d="m14.5 9.5 1.5-1.8" />
    </>
  ),
  // Mazzo di sedano con foglie
  sedano: (
    <>
      <path d="M10 21c-.4-4.5-.9-8.5-2-11.5" />
      <path d="M12 21V9.5" />
      <path d="M14 21c.4-4.5.9-8.5 2-11.5" />
      <path d="M9.5 21h5" />
      <path d="M8 9.5c-2-.5-3-2.5-2.5-4.5 2 0 3 1.5 2.5 4.5z" />
      <path d="M12 9.5c-1.2-1.3-1.2-3.7 0-5.5 1.2 1.8 1.2 4.2 0 5.5z" />
      <path d="M16 9.5c2-.5 3-2.5 2.5-4.5-2 0-3 1.5-2.5 4.5z" />
    </>
  ),
  // Vasetto di senape con paletta
  senape: (
    <>
      <path d="M7 10h10v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
      <path d="M6.5 7.5h11V10h-11z" />
      <path d="m14 7.5 2.5-5" />
      <path d="M7 13.5h10" />
      <path d="M7 17h10" />
    </>
  ),
  // Tre semi di sesamo
  sesamo: (
    <>
      <path transform="translate(12 7.5)" d="M0-4C-1.6-2-2.2-.6-2.2.8a2.2 2.2 0 0 0 4.4 0C2.2-.6 1.6-2 0-4z" />
      <path transform="translate(7.5 16) rotate(-35)" d="M0-4C-1.6-2-2.2-.6-2.2.8a2.2 2.2 0 0 0 4.4 0C2.2-.6 1.6-2 0-4z" />
      <path transform="translate(16.5 16) rotate(35)" d="M0-4C-1.6-2-2.2-.6-2.2.8a2.2 2.2 0 0 0 4.4 0C2.2-.6 1.6-2 0-4z" />
    </>
  ),
  // Calice di vino (i solfiti si trovano soprattutto nel vino)
  solfiti: (
    <>
      <path d="M7.5 3h9l.5 5c0 3.5-2.2 5.5-5 5.5S7 11.5 7 8z" />
      <path d="M7.2 7.5h9.6" />
      <path d="M12 13.5V20" />
      <path d="M8.5 20.5h7" />
    </>
  ),
  // Tre semi di lupino, piatti e tondi con l'ilo
  lupini: (
    <>
      <circle cx="7.5" cy="8.5" r="3.5" />
      <circle cx="16.5" cy="8.5" r="3.5" />
      <circle cx="12" cy="16" r="3.5" />
      <path d="M7.5 5v1.4" />
      <path d="M16.5 5v1.4" />
      <path d="M12 12.5v1.4" />
    </>
  ),
  // Conchiglia (capasanta)
  molluschi: (
    <>
      <path d="M12 19 4.5 10.5C4.5 6 8 3.5 12 3.5s7.5 2.5 7.5 7z" />
      <path d="M12 19 8.2 4.4" />
      <path d="M12 19V3.5" />
      <path d="m12 19 3.8-14.6" />
      <path d="M12 19 5.3 7.6" />
      <path d="m12 19 6.7-11.4" />
      <path d="M9.5 19 8.5 21h7l-1-2z" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type AllergenIconId = keyof typeof ICONS;

export const ALLERGEN_ICON_IDS = Object.keys(ICONS) as AllergenIconId[];

export function hasAllergenIcon(id: string): id is AllergenIconId {
  return id in ICONS;
}

export function AllergenIcon({ id, className }: { id: string; className?: string }) {
  if (!hasAllergenIcon(id)) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ?? 'w-5 h-5'}
    >
      {ICONS[id]}
    </svg>
  );
}
