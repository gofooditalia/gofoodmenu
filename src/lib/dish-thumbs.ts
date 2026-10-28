// Miniature delle foto dei piatti: il menu pubblico le scarica direttamente da Supabase invece di
// passare da /_next/image (che conta come richiesta CDN su Vercel per ogni foto vista).
// Ogni foto `<tenant>/dishes/<file>` del bucket `dishes` ha la sua miniatura in `<tenant>/thumbs/<file>`
// (stesso nome, anche se il formato è diverso): cartella separata, così la libreria foto
// (/dashboard/media, che elenca `<tenant>/dishes`) non le mostra.
// Nessuna dipendenza: questo file finisce nel bundle del menu pubblico.

export const DISH_THUMB_FOLDER = 'thumbs';

const PUBLIC_DISHES_PREFIX = '/storage/v1/object/public/dishes/';

/** Percorso nel bucket della miniatura di una foto (`<tenant>/dishes/x.webp` → `<tenant>/thumbs/x.webp`). */
export function dishThumbPath(photoPath: string): string | null {
  const parts = photoPath.split('/');
  const index = parts.lastIndexOf('dishes');
  if (index < 0 || index === parts.length - 1) return null;
  parts[index] = DISH_THUMB_FOLDER;
  return parts.join('/');
}

/**
 * Indirizzo pubblico della miniatura di una foto caricata su Supabase, oppure null per le foto che
 * stanno altrove (es. siti dei locali): quelle restano ottimizzate da next/image.
 */
export function dishThumbUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  try {
    const url = new URL(photoUrl);
    if (!url.hostname.endsWith('.supabase.co') || !url.pathname.startsWith(PUBLIC_DISHES_PREFIX)) return null;
    const thumbPath = dishThumbPath(url.pathname.slice(PUBLIC_DISHES_PREFIX.length));
    if (!thumbPath) return null;
    url.pathname = PUBLIC_DISHES_PREFIX + thumbPath;
    url.search = '';
    return url.toString();
  } catch {
    return null;
  }
}
