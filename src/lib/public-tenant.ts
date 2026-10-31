/**
 * Dati del locale per le pagine pubbliche (menu, allergeni, /info, anteprime, sitemap, prenotazioni).
 *
 * Chi non ha fatto il login legge da `tenants` solo le colonne di PUBLIC_TENANT_COLUMNS
 * (migrazione 044): email, proprietario, piano, stato dell'abbonamento e date restano riservati.
 * Se il menu è pubblico lo dice la funzione is_menu_public del database (migrazione 043), che
 * risponde solo sì o no con la stessa regola di isMenuPublic.
 */

import { createClient } from '@supabase/supabase-js';
import { createPublicClient } from '@/lib/supabase/public';

// Da tenere allineato con le colonne concesse ad anon nella migrazione 044
export const PUBLIC_TENANT_COLUMNS =
  'id, restaurant_name, slug, country, currency, cover_charge, footer_data, logo_url, translations, menu_languages';

/**
 * Nome del locale come va mostrato: spazi doppi, a capo e spazi in testa o in coda tolti. Nel pannello il nome
 * si scrive a mano e spesso resta "Nome  Locale " (si vedeva nel titolo della scheda e nelle anteprime dei link).
 */
export function cleanTenantName<T extends string | null | undefined>(name: T): T {
  return (typeof name === 'string' ? name.replace(/\s+/g, ' ').trim() : name) as T;
}

/**
 * Locale per slug con le colonne pubbliche (più `embed`, es. 'tenant_locations(*)') e `menu_public`.
 * null se il locale non esiste.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPublicTenant(slug: string, embed?: string): Promise<any | null> {
  const supabase = createPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant } = await (supabase.from('tenants') as any)
    .select(embed ? `${PUBLIC_TENANT_COLUMNS}, ${embed}` : PUBLIC_TENANT_COLUMNS)
    .eq('slug', slug)
    .maybeSingle();
  if (!tenant) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: menuPublic } = await (supabase as any).rpc('is_menu_public', { p_tenant_id: tenant.id });
  // Senza risposta il menu non si mostra: meglio la pagina neutra che un menu sospeso
  return {
    ...tenant,
    restaurant_name: cleanTenantName(tenant.restaurant_name),
    footer_data: tenant.footer_data
      ? { ...tenant.footer_data, public_name: cleanTenantName(tenant.footer_data.public_name) }
      : tenant.footer_data,
    menu_public: menuPublic === true,
  };
}

/** Locali con il menu pubblico, per la sitemap. */
export async function getPublicMenuTenants(): Promise<
  { slug: string; menu_languages: string[] | null; updated_at: string }[]
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (createPublicClient() as any).rpc('public_menu_tenants');
  return data ?? [];
}

/**
 * Email del locale per le notifiche (prenotazioni): riservata, letta sul server con la chiave
 * service role (SUPABASE_SERVICE_ROLE_KEY non esiste nel browser).
 */
export async function getTenantContactEmail(tenantId: string): Promise<string | null> {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data } = await admin.from('tenants').select('contact_email').eq('id', tenantId).maybeSingle();
  return (data?.contact_email as string | undefined) ?? null;
}
