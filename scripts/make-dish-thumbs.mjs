#!/usr/bin/env node

/**
 * Crea le miniature mancanti delle foto dei piatti già caricate su Supabase Storage.
 * Il menu pubblico scarica `<tenant>/thumbs/<file>` direttamente da Supabase (src/lib/dish-thumbs.ts);
 * le foto nuove ricevono la miniatura al caricamento (uploadDishPhoto in src/lib/image-upload.ts),
 * questo script serve per quelle caricate prima e dopo ogni ricompressione (scripts/recompress-images.mjs).
 * Stesse regole del browser: lato massimo 960 px, WebP, obiettivo 80 KB, massimo 150 KB.
 *
 * Foto considerate: tutti i file di `<cartella>/dishes/` (anche la libreria foto non assegnata)
 * più ogni dishes.image_url che punta al bucket `dishes`. Non tocca mai le foto originali.
 * Senza `--apply` non modifica nulla: mostra solo cosa farebbe.
 *
 * USAGE:
 *   node scripts/make-dish-thumbs.mjs                     # prova su tutti i locali
 *   node scripts/make-dish-thumbs.mjs --tenant scjavuru   # prova su un locale
 *   node scripts/make-dish-thumbs.mjs --apply
 *
 * Variabili: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (anche da .env.local).
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: join(rootDir, '.env.local') });

const RULE = { maxSide: 960, targetBytes: 80 * 1024, maxBytes: 150 * 1024 };
const BUCKET = 'dishes';
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;
const CACHE_CONTROL = '31536000';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const TENANT = args.includes('--tenant') ? args[args.indexOf('--tenant') + 1] : undefined;

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// Come dishThumbPath in src/lib/dish-thumbs.ts: `<tenant>/dishes/x.webp` → `<tenant>/thumbs/x.webp`
function thumbPath(photoPath) {
  const parts = photoPath.split('/');
  const index = parts.lastIndexOf('dishes');
  if (index < 0 || index === parts.length - 1) return null;
  parts[index] = 'thumbs';
  return parts.join('/');
}

async function makeThumb(input) {
  let side = RULE.maxSide;
  let last;
  for (let attempt = 0; attempt < 8; attempt++) {
    last = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width: side, height: side, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: Math.max(50, 75 - attempt * 6), effort: 5 })
      .toBuffer();
    if (last.length <= RULE.targetBytes) break;
    if (attempt >= 2) side = Math.round(side * 0.85);
  }
  if (last.length > RULE.maxBytes) throw new Error(`miniatura ancora di ${kb(last.length)}`);
  return last;
}

async function listFiles(supabase, folder) {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000, offset });
    if (error) throw new Error(`elenco di ${folder}: ${error.message}`);
    files.push(...data.filter((f) => f.id !== null && f.name !== '.emptyFolderPlaceholder').map((f) => f.name));
    if (data.length < 1000) return files;
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Servono NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let tenantId;
  if (TENANT) {
    const { data, error } = await supabase.from('tenants').select('id').eq('slug', TENANT).single();
    if (error || !data) throw new Error(`Locale ${TENANT} non trovato`);
    tenantId = data.id;
  }

  // 1. Foto da coprire: cartelle `<x>/dishes/` del bucket e indirizzi usati dai piatti
  const photos = new Set();
  const { data: roots, error: rootsError } = await supabase.storage.from(BUCKET).list('', { limit: 1000 });
  if (rootsError) throw new Error(rootsError.message);
  for (const root of roots.filter((r) => r.id === null)) {
    if (tenantId && root.name !== tenantId) continue;
    for (const name of await listFiles(supabase, `${root.name}/dishes`)) photos.add(`${root.name}/dishes/${name}`);
  }

  // A pagine: PostgREST restituisce al massimo 1000 righe per richiesta
  const dishes = [];
  for (let from = 0; ; from += 1000) {
    let query = supabase.from('dishes').select('image_url').not('image_url', 'is', null).order('id').range(from, from + 999);
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    dishes.push(...data);
    if (data.length < 1000) break;
  }
  const skipped = [];
  for (const { image_url } of dishes) {
    try {
      const u = new URL(image_url);
      if (!u.pathname.startsWith(PUBLIC_PREFIX)) continue; // fuori da Supabase: resta su next/image
      const path = decodeURIComponent(u.pathname.slice(PUBLIC_PREFIX.length));
      if (thumbPath(path)) photos.add(path);
      else skipped.push(path);
    } catch {
      // indirizzi relativi (/icon.svg...): niente miniatura
    }
  }

  // 2. Miniature già presenti, per cartella
  const existing = new Map();
  const missing = [];
  for (const photo of photos) {
    const thumb = thumbPath(photo);
    const folder = thumb.slice(0, thumb.lastIndexOf('/'));
    if (!existing.has(folder)) existing.set(folder, new Set(await listFiles(supabase, folder).catch(() => [])));
    if (!existing.get(folder).has(thumb.slice(folder.length + 1))) missing.push(photo);
  }

  console.log(`Foto: ${photos.size} · miniature mancanti: ${missing.length}${APPLY ? '' : ' (prova: nessuna modifica)'}`);
  for (const path of skipped) console.log(`  saltata (percorso senza cartella dishes): ${path}`);

  // 3. Creazione
  let done = 0;
  let failed = 0;
  let bytes = 0;
  for (const photo of missing) {
    const thumb = thumbPath(photo);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(photo);
      if (error) throw new Error(`download: ${error.message}`);
      const buffer = await makeThumb(Buffer.from(await data.arrayBuffer()));
      bytes += buffer.length;
      if (APPLY) {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(thumb, buffer, { contentType: 'image/webp', cacheControl: CACHE_CONTROL, upsert: false });
        if (uploadError) throw new Error(`caricamento: ${uploadError.message}`);
      }
      done++;
      console.log(`  ${APPLY ? 'creata' : 'da creare'} ${thumb} (${kb(buffer.length)})`);
    } catch (err) {
      failed++;
      console.error(`  ERRORE ${photo}: ${err.message}`);
    }
  }
  const avg = done ? kb(bytes / done) : '-';
  console.log(`\n${APPLY ? 'Create' : 'Da creare'}: ${done} · errori: ${failed} · media ${avg} · totale ${kb(bytes)}`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
