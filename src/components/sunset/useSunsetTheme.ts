'use client';

import { useEffect } from 'react';
import { dayPhase, type Place } from '@/lib/sun-times';
import { SUNSET_ATTR, type SunsetMode } from '@/lib/sunset-theme';

/**
 * Tema del menu Sunset: chiaro di giorno, scuro dal tramonto all'alba nel luogo del locale.
 *
 * Il tema sta nell'attributo data-sunset di <html> (il root layout ha suppressHydrationWarning): lo imposta
 * già lo script inline di menu-page.tsx prima che la pagina si veda, così di sera non c'è il lampo del tema
 * chiaro. Qui lo si tiene aggiornato: se il tramonto arriva mentre il cliente sfoglia il menu (o quando
 * torna sulla pagina dopo il tramonto) i colori passano da chiaro a scuro in qualche secondo e il sole
 * dello skyline scende sotto l'orizzonte (classe sunset-fade, vedi sunset-menu.css).
 *
 * Per le prove e per mostrarlo al locale: ?tema=chiaro, ?tema=scuro, ?tema=tramonto (parte chiaro e dopo
 * un attimo fa il passaggio allo scuro).
 */

const FADE_CLASS = 'sunset-fade';
// Deve coprire la transizione più lunga in sunset-menu.css
const FADE_MS = 4500;
// Colore della barra del browser e dello stato del telefono, uguale allo sfondo del menu
const THEME_COLOR: Record<SunsetMode, string> = { light: '#FBF4EA', dark: '#0F1B2D' };

function applyMode(mode: SunsetMode, fade: boolean) {
  const root = document.documentElement;
  if (root.getAttribute(SUNSET_ATTR) === mode) return;
  const set = () => {
    root.setAttribute(SUNSET_ATTR, mode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[mode]);
  };
  if (!fade) {
    set();
    return;
  }
  root.classList.add(FADE_CLASS);
  // Prima la classe con le transizioni, al fotogramma dopo i colori nuovi: così il browser le anima
  requestAnimationFrame(() => requestAnimationFrame(set));
  window.setTimeout(() => root.classList.remove(FADE_CLASS), FADE_MS);
}

export function useSunsetTheme(place: Place) {
  useEffect(() => {
    const root = document.documentElement;
    const timers: number[] = [];
    const forced = new URLSearchParams(window.location.search).get('tema');

    if (forced === 'chiaro' || forced === 'scuro') {
      applyMode(forced === 'scuro' ? 'dark' : 'light', false);
    } else if (forced === 'tramonto') {
      applyMode('light', false);
      timers.push(window.setTimeout(() => applyMode('dark', true), 1500));
    }

    let changeTimer = 0;
    // Tema dell'ora attuale; `fade` quando cambia sotto gli occhi del cliente
    const sync = (fade: boolean) => {
      if (forced === 'chiaro' || forced === 'scuro' || forced === 'tramonto') return;
      const { phase, nextChange } = dayPhase(new Date(), place);
      applyMode(phase === 'night' ? 'dark' : 'light', fade);
      window.clearTimeout(changeTimer);
      if (nextChange) {
        // I telefoni sospendono i timer in background: al ritorno sulla pagina ci pensa visibilitychange
        changeTimer = window.setTimeout(() => sync(true), Math.max(1000, nextChange.getTime() - Date.now() + 1000));
      }
    };
    sync(false);

    const onVisible = () => {
      if (document.visibilityState === 'visible') sync(true);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearTimeout(changeTimer);
      timers.forEach((t) => window.clearTimeout(t));
      // Uscendo dal menu (es. verso la pagina allergeni) i colori Sunset non devono restare sul sito
      root.removeAttribute(SUNSET_ATTR);
      root.classList.remove(FADE_CLASS);
    };
  }, [place]);
}

