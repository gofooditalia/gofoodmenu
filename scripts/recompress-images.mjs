#!/usr/bin/env node

/**
 * Ricompressione delle immagini già caricate su Supabase Storage, con le stesse regole
 * di src/lib/image-upload.ts (foto piatti max 1600 px / 500 KB in WebP, loghi max
 * 600 px / 200 KB in PNG), e pulizia dei file orfani.
 *
 * Due fasi, per non mostrare mai foto mancanti nei menu (la pagina /[slug] resta in
 * cache fino a 24 ore con gli indirizzi vecchi):
 *   1. `--tenant <slug>`: carica le versioni nuove con nomi NUOVI (cache a 31 giorni,
 *      vedi CLAUDE.md), aggiorna dishes.image_url / tenants.logo_url e scrive un
 *      manifest in scripts/recompress-manifests/ con i file vecchi.
 *   2. `--cleanup <manifest>`: dopo almeno 25 ore cancella i file vecchi del manifest.
 * `--orphans`: cancella i file nelle cartelle vecchie (non intestate a un tenant)
 * che nessun piatto, logo, tema o footer usa.
 *
 * Senza `--apply` non modifica nulla: mostra solo cosa farebbe.
 *
 * USAGE:
 *   node scripts/recompress-images.mjs --tenant scjavuru            # prova
 *   node scripts/recompress-images.mjs --tenant scjavuru --apply
 *   node scripts/recompress-images.mjs --orphans --apply
 *   node scripts/recompress-images.mjs --cleanup scripts/recompress-manifests/<file>.json --apply
 *
 * Variabili: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (anche da .env.local).
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: join(rootDir, '.env.local') });

const RULES = {
  dishes: { maxSide: 1600, targetBytes: 300 * 1024, maxBytes: 500 * 1024, types: ['image/webp', 'image/jpeg'] },
  logos: { maxSide: 600, targetBytes: 100 * 1024, maxBytes: 200 * 1024, types: ['image/png'] },
};
const CLEANUP_DELAY_MS = 25 * 60 * 60 * 1000;
const MANIFEST_DIR = join(rootDir, 'scripts', 'recompress-manifests');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const APPLY = flag('--apply');

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

/** Ricomprime un'immagine per il bucket indicato. Restituisce { buffer, type, ext }. */
export async function recompress(input, bucket) {
  const rule = RULES[bucket];
  let side = rule.maxSide;
  let last;
  // Prima si abbassa la qualità, poi (se serve) il lato: come browser-image-compression
  for (let attempt = 0; attempt < 8; attempt++) {
    const base = sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width: side, height: side, fit: 'inside', withoutEnlargement: true });
    let buffer;
    if (bucket === 'logos') {
      buffer = await base.png({ compressionLevel: 9, palette: attempt > 0, quality: 90 }).toBuffer();
    } else {
      buffer = await base.webp({ quality: Math.max(50, 80 - attempt * 6), effort: 5 }).toBuffer();
    }
    last = buffer;
    if (buffer.length <= rule.targetBytes) break;
    if (attempt >= 2) side = Math.round(side * 0.85);
  }
  if (last.length > rule.maxBytes) throw new Error(`ancora ${kb(last.length)} dopo la ricompressione`);
  return bucket === 'logos'
    ? { buffer: last, type: 'image/png', ext: 'png' }
    : { buffer: last, type: 'image/webp', ext: 'webp' };
}

function needsRecompression(bucket, size, mime) {
  const rule = RULES[bucket];
  return size > rule.maxBytes || !rule.types.includes(mime);
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Mancano NEXT_PUBLIC_SUPABASE_URL (o SUPABASE_URL) e/o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Elenca ricorsivamente i file di un bucket sotto `prefix`. */
async function listFiles(supabase, bucket, prefix = '') {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...(await listFiles(supabase, bucket, path)));
      else if (item.name !== '.emptyFolderPlaceholder') files.push({ path, size: item.metadata?.size ?? 0, mime: item.metadata?.mimetype ?? '' });
    }
    if (data.length < 1000) break;
  }
  return files;
}

const publicPrefix = (supabase, bucket) => supabase.storage.from(bucket).getPublicUrl('').data.publicUrl;

async function download(supabase, bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

async function upload(supabase, bucket, path, { buffer, type }) {
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType: type, upsert: false });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

const newName = (ext) => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

async function processTenant(supabase, slug) {
  const { data: tenant, error } = await supabase.from('tenants').select('id, slug, restaurant_name, logo_url').eq('slug', slug).single();
  if (error || !tenant) throw new Error(`Locale "${slug}" non trovato`);
  console.log(`\n${tenant.restaurant_name} (${tenant.slug})${APPLY ? '' : ' — PROVA, nessuna modifica'}`);

  const manifest = { tenant: tenant.slug, createdAt: new Date().toISOString(), oldFiles: [] };
  let before = 0;
  let after = 0;

  // Foto dei piatti: anche quelle dell'archivio non assegnate, che il ristoratore vede in dashboard
  const dishPrefix = publicPrefix(supabase, 'dishes');
  const photos = await listFiles(supabase, 'dishes', `${tenant.id}/dishes`);
  const todo = photos.filter((f) => needsRecompression('dishes', f.size, f.mime));
  console.log(`Foto: ${photos.length}, da ricomprimere: ${todo.length}`);

  for (const file of todo) {
    try {
      const result = await recompress(await download(supabase, 'dishes', file.path), 'dishes');
      const targetPath = `${tenant.id}/dishes/${newName(result.ext)}`;
      before += file.size;
      after += result.buffer.length;
      const oldUrl = dishPrefix + file.path;
      console.log(`  ${file.path}: ${kb(file.size)} -> ${kb(result.buffer.length)}`);
      if (!APPLY) continue;

      const newUrl = await upload(supabase, 'dishes', targetPath, result);
      const { data: updated, error: updError } = await supabase.from('dishes').update({ image_url: newUrl }).eq('image_url', oldUrl).select('id');
      if (updError) throw updError;
      manifest.oldFiles.push({ bucket: 'dishes', path: file.path, replacedBy: targetPath, dishes: updated.length });
    } catch (err) {
      console.error(`  ERRORE ${file.path}: ${err.message}`);
    }
  }

  // Logo del locale
  const logoPrefix = publicPrefix(supabase, 'logos');
  if (tenant.logo_url?.startsWith(logoPrefix)) {
    const logoPath = decodeURIComponent(tenant.logo_url.slice(logoPrefix.length));
    const folder = logoPath.split('/').slice(0, -1).join('/');
    const logos = await listFiles(supabase, 'logos', folder);
    const logo = logos.find((f) => f.path === logoPath);
    if (logo && needsRecompression('logos', logo.size, logo.mime)) {
      try {
        const result = await recompress(await download(supabase, 'logos', logo.path), 'logos');
        const targetPath = `${tenant.id}/logo-${Date.now()}.png`;
        before += logo.size;
        after += result.buffer.length;
        console.log(`  logo ${logo.path}: ${kb(logo.size)} -> ${kb(result.buffer.length)}`);
        if (APPLY) {
          const newUrl = await upload(supabase, 'logos', targetPath, result);
          const { error: updError } = await supabase.from('tenants').update({ logo_url: newUrl }).eq('id', tenant.id);
          if (updError) throw updError;
          manifest.oldFiles.push({ bucket: 'logos', path: logo.path, replacedBy: targetPath });
        }
      } catch (err) {
        console.error(`  ERRORE logo ${logo.path}: ${err.message}`);
      }
    }
  }

  console.log(`Totale: ${kb(before)} -> ${kb(after)}`);
  if (APPLY && manifest.oldFiles.length > 0) {
    mkdirSync(MANIFEST_DIR, { recursive: true });
    const file = join(MANIFEST_DIR, `${tenant.slug}-${Date.now()}.json`);
    writeFileSync(file, JSON.stringify(manifest, null, 2));
    console.log(`Manifest: ${file}\nI file vecchi restano finché la cache dei menu non si rinnova: tra 25 ore lancia --cleanup ${file} --apply`);
  }
}

async function cleanup(supabase, manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const age = Date.now() - statSync(manifestPath).mtimeMs;
  if (age < CLEANUP_DELAY_MS && !flag('--force')) {
    console.error(`Manifest creato da ${Math.round(age / 3600000)} ore: aspetta almeno 25 ore (cache dei menu), oppure --force`);
    process.exit(1);
  }
  for (const bucket of ['dishes', 'logos']) {
    const paths = manifest.oldFiles.filter((f) => f.bucket === bucket).map((f) => f.path);
    if (paths.length === 0) continue;
    console.log(`${bucket}: ${paths.length} file vecchi da cancellare`);
    if (APPLY) {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) throw error;
    }
  }
}

async function orphans(supabase) {
  const { data: tenants } = await supabase.from('tenants').select('id, logo_url, footer_data');
  const { data: dishes } = await supabase.from('dishes').select('image_url').not('image_url', 'is', null);
  const { data: designs } = await supabase.from('tenant_design_settings').select('theme_config');
  const refs = [
    ...dishes.map((d) => d.image_url),
    ...tenants.map((t) => t.logo_url ?? ''),
    ...tenants.map((t) => JSON.stringify(t.footer_data ?? '')),
    ...designs.map((d) => JSON.stringify(d.theme_config ?? '')),
  ].map((u) => decodeURIComponent(u));
  const tenantIds = new Set(tenants.map((t) => t.id));

  for (const bucket of ['dishes', 'logos']) {
    const files = await listFiles(supabase, bucket);
    const found = files.filter((f) => !tenantIds.has(f.path.split('/')[0]) && !refs.some((r) => r.includes(`${bucket}/${f.path}`)));
    console.log(`${bucket}: ${found.length} orfani (${kb(found.reduce((s, f) => s + f.size, 0))})`);
    found.forEach((f) => console.log(`  ${f.path} (${kb(f.size)})`));
    if (APPLY && found.length > 0) {
      const { error } = await supabase.storage.from(bucket).remove(found.map((f) => f.path));
      if (error) throw error;
      console.log('  cancellati');
    }
  }
}

async function main() {
  const supabase = getClient();
  if (option('--tenant')) await processTenant(supabase, option('--tenant'));
  else if (option('--cleanup')) await cleanup(supabase, option('--cleanup'));
  else if (flag('--orphans')) await orphans(supabase);
  else console.log('Uso: --tenant <slug> | --orphans | --cleanup <manifest>  [--apply]');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
