/**
 * Skyline al tratto del menu Sunset: il sole sull'orizzonte e l'Isola delle Femmine con la torre, come si
 * vedono da Barcarello. I colori vengono dalle variabili di sunset-menu.css: di sera l'isola diventa una
 * sagoma in controluce, compaiono le stelle e il sole scende sotto l'orizzonte (--sm-sun-shift).
 * Solo decorazione: nascosto ai lettori di schermo.
 */

import { useId } from 'react';

const HORIZON = 74;

export function SunsetSkyline({ className = '' }: { className?: string }) {
  // Id unico: lo skyline compare due volte nella pagina
  const clipId = `sm-sky-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg
      viewBox="0 0 360 100"
      className={`sm-skyline ${className}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        {/* Il sole si vede solo sopra l'orizzonte: tramontando ci scompare dietro */}
        <clipPath id={clipId}>
          <rect x="0" y="0" width="360" height={HORIZON} />
        </clipPath>
      </defs>

      <g className="sm-stars">
        <circle cx="214" cy="14" r="0.9" />
        <circle cx="280" cy="24" r="0.7" />
        <circle cx="326" cy="11" r="0.9" />
        <circle cx="24" cy="20" r="0.7" />
        <circle cx="160" cy="8" r="0.6" />
      </g>

      <g clipPath={`url(#${clipId})`}>
        <g className="sm-sun">
          <circle className="sm-sun-glow" cx="112" cy={HORIZON} r="48" />
          <path className="sm-sun-ray" d={`M62 ${HORIZON} A50 50 0 0 1 162 ${HORIZON}`} strokeDasharray="2 4" />
          <path className="sm-sun-ray" d={`M75 ${HORIZON} A37 37 0 0 1 149 ${HORIZON}`} />
          <path className="sm-sun-disc" d={`M86 ${HORIZON} A26 26 0 0 1 138 ${HORIZON} Z`} />
        </g>
      </g>

      {/* Isola delle Femmine: profilo allungato con la gobba verso est e la torre in cima */}
      <path
        className="sm-island"
        d={`M160 ${HORIZON} C175 ${HORIZON - 3} 188 ${HORIZON - 7} 203 ${HORIZON - 9} C218 ${HORIZON - 11} 226 ${HORIZON - 20} 236 ${HORIZON - 24} C246 ${HORIZON - 28} 257 ${HORIZON - 27} 265 ${HORIZON - 21} C276 ${HORIZON - 14} 291 ${HORIZON - 9} 322 ${HORIZON} Z`}
      />
      <g className="sm-island">
        <rect x="246" y={HORIZON - 41} width="10" height="14" />
        <path d={`M246 ${HORIZON - 41} v-3 h2 v3 h2 v-3 h2 v3 h2 v-3 h2 v3`} fill="none" />
      </g>

      <g className="sm-sea">
        <line x1="0" y1={HORIZON} x2="360" y2={HORIZON} />
        <path d="M22 83 q6 -3 12 0 t12 0" />
        <path d="M168 85 q6 -3 12 0 t12 0 t12 0" />
        <path d="M250 82 q6 -3 12 0 t12 0" />
        <path d="M306 90 q6 -3 12 0 t12 0" />
        <path d="M40 94 q6 -3 12 0 t12 0" />
        {/* Barca a vela */}
        <path d="M46 70 L46 49 L59 70 Z M44 70 L44 53 L35 70 Z" />
        <path d="M33 72 L61 72 L57 76 L37 76 Z" />
      </g>

      {/* Riflesso del sole sull'acqua */}
      <g className="sm-sun-reflex">
        <path d="M90 80 h44 M96 85 h32 M102 90 h20 M108 95 h8" />
      </g>
    </svg>
  );
}

/** Onda sotto il titolo della categoria. */
export function SunsetWave() {
  return (
    <svg viewBox="0 0 140 10" className="sm-wave" aria-hidden="true" focusable="false">
      <line x1="0" y1="5" x2="50" y2="5" />
      <line x1="90" y1="5" x2="140" y2="5" />
      <path d="M56 6 q4 -4 8 0 t8 0 t8 0 t8 0" />
    </svg>
  );
}
