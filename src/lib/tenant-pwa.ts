/**
 * Dati per la PWA di ogni ristorante: chi apre il menu può installarlo come app
 * con nome, logo e colori del locale, che si apre direttamente sul suo menu.
 * Usati da /[slug]/manifest.webmanifest, /[slug]/app-icon/[size] e /[slug]/opengraph-image.
 */

import { createPublicClient } from '@/lib/supabase/public';
import { DEFAULT_THEME } from '@/lib/theme-engine/presets';
import type { ThemeConfig } from '@/lib/theme-engine/types';

// Colore di ripiego per barre e splash quando nessun colore del tema è abbastanza scuro
const FALLBACK_APP_COLOR = '#1F1F1F';

export interface TenantPwaData {
  slug: string;
  name: string;
  logoUrl: string | null;
  // Colore di barra di stato, barra di navigazione (Android 15+), splash e fondo icona
  appColor: string;
  // Tema completo del menu (colori per l'anteprima di condivisione, /[slug]/opengraph-image)
  theme: ThemeConfig;
}

function parseHex(color: string | undefined): [number, number, number] | null {
  const hex = color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())?.[1];
  if (!hex) return null;
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

// Android disegna icone e tasti di sistema chiari sopra questo colore: serve un tono
// abbastanza scuro (contrasto col bianco almeno 3:1). Si prova primario, sfondo, testo.
export function pickAppColor(theme: ThemeConfig): string {
  const { primary, background, text } = theme.colors;
  for (const candidate of [primary, background, text]) {
    const rgb = parseHex(candidate);
    if (rgb && relativeLuminance(rgb) <= 0.3) return candidate.trim();
  }
  return FALLBACK_APP_COLOR;
}

export async function getTenantPwaData(slug: string): Promise<TenantPwaData | null> {
  const supabase = createPublicClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant } = await (supabase.from('tenants') as any)
    .select('id, restaurant_name, logo_url')
    .eq('slug', slug)
    .single();
  if (!tenant) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: designSettings } = await (supabase.from('tenant_design_settings') as any)
    .select('theme_config')
    .eq('tenant_id', tenant.id)
    .single();

  const saved = designSettings?.theme_config as Partial<ThemeConfig> | null;
  const theme: ThemeConfig = {
    ...DEFAULT_THEME,
    ...(saved || {}),
    colors: { ...DEFAULT_THEME.colors, ...(saved?.colors || {}) },
  };

  return {
    slug,
    name: tenant.restaurant_name,
    logoUrl: tenant.logo_url || null,
    appColor: pickAppColor(theme),
    theme,
  };
}
