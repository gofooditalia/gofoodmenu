import { ImageResponse } from 'next/og';
import { getTenantPwaData } from '@/lib/tenant-pwa';
import { loadImageDataUrl, loadOgAssets } from '@/lib/og-image';
import { createPublicClient } from '@/lib/supabase/public';

// Anteprima per la condivisione del menu (WhatsApp, Facebook, Telegram...): 1200×630 con
// logo, nome e colori del locale. Il logo sta sullo sfondo dell'intestazione del menu,
// dove il ristoratore lo vede già leggibile (vale per loghi chiari e scuri).
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Menu digitale';
export const revalidate = 86400;

async function getCity(slug: string): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (createPublicClient().from('tenants') as any)
    .select('tenant_locations(city)')
    .eq('slug', slug)
    .single();
  return data?.tenant_locations?.[0]?.city ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [pwa, city, { brandLogo, fonts }] = await Promise.all([getTenantPwaData(slug), getCity(slug), loadOgAssets()]);

  const name = pwa?.name.trim() || 'Menu digitale';
  const colors = pwa?.theme.colors;
  const background = colors?.background || '#FFF8E7';
  const panel = colors?.headerBackground || colors?.surface || '#FFFFFF';
  const primary = colors?.primary || '#8B0000';
  const text = colors?.textSecondary || colors?.text || '#374151';
  const logo = pwa?.logoUrl ? await loadImageDataUrl(pwa.logoUrl) : null;
  const nameSize = name.length > 28 ? 56 : name.length > 18 ? 66 : 78;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', background, padding: '0 80px', fontFamily: 'Inter' }}>
        <div
          style={{
            width: 440,
            height: 440,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: panel,
            borderRadius: 48,
            // Bordo leggero: sui temi scuri il riquadro ha spesso il colore dello sfondo
            border: '2px solid rgba(128,128,128,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} width={360} height={360} style={{ objectFit: 'contain' }} alt="" />
          ) : (
            <div style={{ fontSize: 180, fontFamily: 'Playfair Display', fontWeight: 700, color: primary }}>{name.charAt(0).toUpperCase()}</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 64, flex: 1, height: 440, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 26, letterSpacing: 6, color: text, textTransform: 'uppercase' }}>Menu digitale</div>
            <div style={{ fontSize: nameSize, fontFamily: 'Playfair Display', fontWeight: 700, color: primary, lineHeight: 1.1, marginTop: 18 }}>
              {name}
            </div>
            {city && <div style={{ fontSize: 34, color: text, marginTop: 18 }}>{city}</div>}
            <div style={{ fontSize: 28, color: text, marginTop: 28 }}>Piatti, prezzi e allergeni sempre aggiornati</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brandLogo} width={72} height={72} alt="" />
            <div style={{ fontSize: 26, color: text, marginLeft: 16 }}>gofoodmenu.it</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
