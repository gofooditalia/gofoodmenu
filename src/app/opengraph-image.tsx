import { ImageResponse } from 'next/og';
import { loadOgAssets } from '@/lib/og-image';

// Anteprima per la condivisione di gofoodmenu.it e delle pagine senza un'anteprima propria
// (i menu dei locali hanno /[slug]/opengraph-image). Generata una volta in fase di build.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Go!Food Menù – Il menu digitale per ristoranti';

const ORANGE = '#E9580C';

export default async function Image() {
  const { brandLogo, fonts } = await loadOgAssets();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 80px',
          fontFamily: 'Inter',
          background: 'linear-gradient(135deg, #FFF8E7 0%, #FFEDD5 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandLogo} width={400} height={400} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 64, flex: 1 }}>
          <div style={{ fontSize: 68, fontFamily: 'Playfair Display', fontWeight: 700, color: '#1F2937', lineHeight: 1.1 }}>
            Il menu digitale per il tuo ristorante
          </div>
          <div style={{ fontSize: 32, color: '#4B5563', marginTop: 28, lineHeight: 1.3 }}>
            QR code, multilingua e allergeni. Carica la foto del menu, al resto pensa l’AI.
          </div>
          <div style={{ display: 'flex', marginTop: 40 }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: '#FFFFFF',
                background: ORANGE,
                padding: '14px 32px',
                borderRadius: 999,
              }}
            >
              gofoodmenu.it
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
