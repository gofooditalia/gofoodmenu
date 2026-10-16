import { ImageResponse } from 'next/og';
import { getTenantPwaData } from '@/lib/tenant-pwa';

const SIZES = [192, 512];
// Formati che il renderer di next/og sa disegnare (niente WebP/AVIF)
const SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
// Icona "maskable": Android la ritaglia (cerchio, squircle...) e garantisce visibile solo
// il cerchio centrale dell'80%. Un logo quadrato ci sta se il lato è ≤ 80%/√2 ≈ 56%.
const LOGO_RATIO = 0.56;

async function loadLogo(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = (res.headers.get('content-type') || '').split(';')[0].trim();
    if (!SUPPORTED_TYPES.includes(type)) return null;
    const data = Buffer.from(await res.arrayBuffer()).toString('base64');
    return `data:${type};base64,${data}`;
  } catch {
    return null;
  }
}

// Icona quadrata dell'app del ristorante: il suo logo al centro, sul colore dell'app
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; size: string }> }
) {
  const { slug, size: sizeParam } = await params;
  const size = Number(sizeParam);
  if (!SIZES.includes(size)) return new Response('Not found', { status: 404 });

  const pwa = await getTenantPwaData(slug);
  if (!pwa) return new Response('Not found', { status: 404 });

  const logo = pwa.logoUrl ? await loadLogo(pwa.logoUrl) : null;
  // Senza un logo utilizzabile si usa l'icona Go!Food
  if (!logo) {
    return Response.redirect(new URL(`/web-app-manifest-${size}x${size}.png`, _request.url), 302);
  }

  const logoSize = Math.round(size * LOGO_RATIO);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: pwa.appColor,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={logoSize} height={logoSize} style={{ objectFit: 'contain' }} alt="" />
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    }
  );
}
