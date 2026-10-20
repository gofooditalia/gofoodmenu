// Formati che il renderer di next/og sa disegnare (niente WebP/AVIF)
const SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];

/**
 * Scarica un'immagine (es. il logo del locale) e la restituisce come data URL per next/og.
 * null se non raggiungibile o in un formato che next/og non sa disegnare.
 */
export async function loadImageDataUrl(url: string): Promise<string | null> {
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

/**
 * Logo GO!Food Menù e caratteri per le anteprime di condivisione: Inter (testi, come il sito) e
 * Playfair Display Bold (titoli, come nei menu). Il carattere di base di next/og non ha il grassetto.
 */
export async function loadOgAssets() {
  const { readFile } = await import('fs/promises');
  const { join } = await import('path');
  const [logo, inter, playfairBold] = await Promise.all([
    readFile(join(process.cwd(), 'src/assets/gofood-menu-logo.png')),
    readFile(join(process.cwd(), 'src/assets/Inter-Regular.ttf')),
    readFile(join(process.cwd(), 'src/assets/PlayfairDisplay-Bold.ttf')),
  ]);
  return {
    brandLogo: `data:image/png;base64,${logo.toString('base64')}`,
    fonts: [
      { name: 'Inter', data: inter, weight: 400 as const, style: 'normal' as const },
      { name: 'Playfair Display', data: playfairBold, weight: 700 as const, style: 'normal' as const },
    ],
  };
}
