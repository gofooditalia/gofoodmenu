import { getTenantPwaData } from '@/lib/tenant-pwa';

// Manifest della PWA del singolo ristorante, collegato dalla pagina del menu:
// nome, icona e colori del locale, e l'app si apre sul suo menu.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pwa = await getTenantPwaData(slug);
  if (!pwa) return new Response('Not found', { status: 404 });

  const manifest = {
    name: pwa.name,
    short_name: pwa.name,
    description: `Il menu di ${pwa.name}`,
    id: `/${slug}`,
    start_url: `/${slug}`,
    scope: `/${slug}`,
    display: 'standalone',
    // background_color colora anche la barra di navigazione di Android (Android 15+) e ci
    // disegna sopra tasti chiari: pickAppColor sceglie un colore del tema abbastanza scuro
    background_color: pwa.appColor,
    theme_color: pwa.appColor,
    icons: [
      { src: `/${slug}/app-icon/192`, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: `/${slug}/app-icon/512`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
