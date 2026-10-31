/**
 * Tema chiaro/scuro del menu Sunset (src/lib/menu-layouts.ts): attributo data-sunset su <html>.
 * File senza 'use client': lo script inline lo genera il server (menu-page.tsx), l'hook lo usa nel browser
 * (src/components/sunset/useSunsetTheme.ts).
 */

export type SunsetMode = 'light' | 'dark';

export const SUNSET_ATTR = 'data-sunset';

// Colore della barra del browser e dello stato del telefono, uguale allo sfondo del menu (sunset-menu.css)
export const SUNSET_THEME_COLOR: Record<SunsetMode, string> = { light: '#FBF4EA', dark: '#0F1B2D' };

/**
 * Script inline (menu-page.tsx) che sceglie il tema prima che la pagina si veda. Riceve dal server gli
 * intervalli di notte già calcolati (sun-times.ts, nightIntervals): niente calcoli astronomici da duplicare.
 * Se la pagina in cache è più vecchia degli intervalli resta il chiaro e poi corregge useSunsetTheme.
 * Imposta anche il theme-color (barra del browser): altrimenti resterebbe quello del tema salvato del locale.
 */
export function sunsetThemeScript(nights: [number, number][]): string {
  return `(function(n){try{var q=new URLSearchParams(location.search).get('tema'),m='light',t=Date.now();if(q==='scuro'){m='dark'}else if(q!=='chiaro'&&q!=='tramonto'){for(var i=0;i<n.length;i++){if(t>=n[i][0]&&t<n[i][1]){m='dark';break}}}document.documentElement.setAttribute('${SUNSET_ATTR}',m);var c=document.querySelectorAll('meta[name="theme-color"]');for(var j=0;j<c.length;j++)c[j].setAttribute('content',${JSON.stringify(SUNSET_THEME_COLOR)}[m])}catch(e){}})(${JSON.stringify(nights)})`;
}
