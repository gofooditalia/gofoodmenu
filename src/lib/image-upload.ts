import imageCompression from 'browser-image-compression';
import type { SupabaseClient } from '@supabase/supabase-js';
import { dishThumbPath } from '@/lib/dish-thumbs';

// Regole uniche per le immagini caricate dai ristoratori: il menu pubblico non deve mai
// ricevere file sovradimensionati. `maxBytes` e `types` coincidono con `file_size_limit` e
// `allowed_mime_types` dei bucket Supabase (supabase/migrations/038_storage_upload_limits.sql):
// se il browser non riesce a rispettarli il caricamento si blocca, Supabase rifiuterebbe il file.
export type UploadImageKind = 'dish' | 'dishThumb' | 'logo';

interface Rule {
  maxSide: number;
  targetMB: number;
  maxBytes: number;
  // Formati in ordine di preferenza: il secondo serve ai browser che non sanno scrivere il primo
  types: string[];
}

const RULES: Record<UploadImageKind, Rule> = {
  // Foto dei piatti: card larghe al massimo ~500 px (1200 px su schermi 3x)
  dish: { maxSide: 1600, targetMB: 0.3, maxBytes: 500 * 1024, types: ['image/webp', 'image/jpeg'] },
  // Miniatura servita al menu pubblico direttamente da Supabase (src/lib/dish-thumbs.ts):
  // card larghe ~400 px sui telefoni e ~600 px sugli schermi grandi
  dishThumb: { maxSide: 960, targetMB: 0.08, maxBytes: 150 * 1024, types: ['image/webp', 'image/jpeg'] },
  // Logo: mostrato a 56-64 px di altezza. PNG e non WebP: le icone dell'app del locale
  // (src/app/[slug]/app-icon) sono disegnate da next/og, che non legge il WebP
  logo: { maxSide: 600, targetMB: 0.1, maxBytes: 200 * 1024, types: ['image/png'] },
};

// Oltre questa soglia il file non viene nemmeno aperto (foto RAW, video rinominati...)
const MAX_INPUT_BYTES = 20 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };

async function compress(file: File, rule: Rule, fileType: string) {
  return imageCompression(file, {
    maxSizeMB: rule.targetMB,
    maxWidthOrHeight: rule.maxSide,
    fileType,
    initialQuality: 0.8,
    useWebWorker: true,
  });
}

/**
 * Ridimensiona e converte (WebP per le foto, PNG per i loghi) un'immagine prima del caricamento su Supabase.
 * Lancia un Error con un messaggio da mostrare all'utente se il file non è accettabile.
 * Il file restituito ha già l'estensione giusta in `name`.
 */
export async function prepareImageForUpload(file: File, kind: UploadImageKind): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    throw new Error('Formato non supportato: carica una foto JPG, PNG o WebP.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("L'immagine supera i 20 MB: scegline una più leggera.");
  }

  const rule = RULES[kind];
  const isValid = (f: File) => rule.types.includes(f.type) && f.size <= rule.maxBytes;
  let result: File | undefined;
  try {
    // Un browser che non sa scrivere un formato (es. WebP su vecchi Safari) produce un PNG
    // pesante: si passa al formato successivo
    for (const type of rule.types) {
      result = await compress(file, rule, type);
      if (isValid(result)) break;
    }
  } catch (error) {
    console.error('[image-upload] Compressione non riuscita:', error);
    throw new Error("Non è stato possibile elaborare l'immagine: prova con un'altra foto.");
  }

  if (!result || !isValid(result)) {
    throw new Error(
      `L'immagine è ancora troppo pesante (${Math.round((result?.size ?? 0) / 1024)} KB, massimo ${rule.maxBytes / 1024} KB): prova con un'altra immagine.`
    );
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'immagine';
  return new File([result], `${baseName}.${EXTENSIONS[result.type]}`, { type: result.type, lastModified: Date.now() });
}

// Estensione del file preparato da prepareImageForUpload, per costruire il percorso su Supabase
export function uploadExtension(file: File) {
  return EXTENSIONS[file.type] ?? 'webp';
}

// I nomi dei file non si riusano mai (vedi CLAUDE.md): la cache del CDN di Supabase può durare un anno
const UPLOAD_CACHE_CONTROL = '31536000';

/**
 * Carica una foto di un piatto nel bucket `dishes` (`<folder>/<baseName>.<ext>`) insieme alla sua
 * miniatura in `thumbs/`. Prima la miniatura: una foto senza miniatura nel menu pubblico non deve
 * esistere, quindi se la foto non si carica la miniatura viene tolta. Restituisce il percorso della foto.
 */
export async function uploadDishPhoto(supabase: SupabaseClient, folder: string, baseName: string, source: File) {
  const [photo, thumb] = await Promise.all([
    prepareImageForUpload(source, 'dish'),
    prepareImageForUpload(source, 'dishThumb'),
  ]);
  const photoPath = `${folder}/${baseName}.${uploadExtension(photo)}`;
  const thumbPath = dishThumbPath(photoPath);
  if (!thumbPath) throw new Error(`Percorso foto non valido: ${photoPath}`);

  const bucket = supabase.storage.from('dishes');
  const { error: thumbError } = await bucket.upload(thumbPath, thumb, {
    contentType: thumb.type,
    cacheControl: UPLOAD_CACHE_CONTROL,
  });
  if (thumbError) throw thumbError;

  const { error: photoError } = await bucket.upload(photoPath, photo, {
    contentType: photo.type,
    cacheControl: UPLOAD_CACHE_CONTROL,
  });
  if (photoError) {
    await bucket.remove([thumbPath]);
    throw photoError;
  }
  return photoPath;
}
