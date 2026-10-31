/**
 * Logo del locale ricolorato col colore del tema Sunset (chiaro o scuro): il file è un logo bianco su fondo
 * trasparente, usato come maschera (classe sm-logo in sunset-menu.css). Le proporzioni del ritaglio
 * (1920 / 800) sono quelle del logo di Sunset: se il locale lo cambia vanno riviste.
 */

import type React from 'react';

export const SUNSET_LOGO_ASPECT = '1920 / 800';

export function SunsetLogo({ url, className, style }: { url: string; className?: string; style?: React.CSSProperties }) {
  const mask = `url("${url.replace(/"/g, '%22')}")`;
  return (
    <div
      aria-hidden="true"
      className={`sm-logo ${className ?? ''}`}
      style={{ WebkitMaskImage: mask, maskImage: mask, aspectRatio: SUNSET_LOGO_ASPECT, ...style }}
    />
  );
}
