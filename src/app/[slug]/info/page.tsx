/**
 * Scheda contatti del locale: /{slug}/info. Logo, nome, pulsante al menu, sedi (indicazioni, telefono,
 * orari) e social. Solo link e contatti: non è un sito del locale. Il QR del tavolo resta sul menu.
 * In prova solo per i locali in INFO_PAGE_SLUGS (src/lib/tenant-info.ts).
 */

import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import { getPublicTenant } from '@/lib/public-tenant';
import { SITE_URL } from '@/lib/site';
import { hasInfoPage } from '@/lib/tenant-info';
import MenuUnavailable, { menuUnavailableMetadata } from '../MenuUnavailable';
import type { FooterSocial, TenantLocationDB } from '@/types/menu';
import InfoPageClient, { type InfoLocation } from './InfoPageClient';

// Cached per slug (ISR). Purged on every menu change via revalidatePublicMenu
// (src/app/actions/revalidate-menu.ts); the time-based revalidate is only a safety net.
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getInfoData(slug: string) {
  if (!hasInfoPage(slug)) return null;
  const supabase = createPublicClient();

  const tenant = await getPublicTenant(slug, 'tenant_locations(*)');
  if (!tenant) {
    return null;
  }

  const footer = tenant.footer_data || {};
  // Come il menu: senza abbonamento attivo (o fuori dalla tolleranza) si mostra la pagina neutra
  if (!tenant.menu_public) {
    return {
      unavailable: true as const,
      name: (footer.public_name || tenant.restaurant_name) as string,
      logoUrl: (tenant.logo_url || null) as string | null,
    };
  }
  const locations: InfoLocation[] = ((tenant.tenant_locations || []) as TenantLocationDB[])
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.created_at.localeCompare(b.created_at))
    .map((l) => ({ city: l.city, address: l.address, phone: l.phone, openingHours: l.opening_hours }));
  const socials = ((footer.socials || []) as FooterSocial[]).filter((s) => s.url?.trim());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: design } = await (supabase.from('tenant_design_settings') as any)
    .select('theme_config')
    .eq('tenant_id', tenant.id)
    .single();

  return {
    // "Nome visualizzato" e sottotitolo del Design Studio, come nel menu
    name: (footer.public_name || tenant.restaurant_name) as string,
    tagline: (tenant.tagline || footer.tagline || '') as string,
    logoUrl: (tenant.logo_url || null) as string | null,
    locations,
    socials,
    themeConfig: design?.theme_config || null,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const data = await getInfoData(slug);
  if (!data) notFound();
  if ('unavailable' in data) return <MenuUnavailable name={data.name} logoUrl={data.logoUrl} />;

  return (
    <InfoPageClient
      slug={slug}
      name={data.name}
      tagline={data.tagline}
      logoUrl={data.logoUrl}
      locations={data.locations}
      socials={data.socials}
      initialTheme={data.themeConfig}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await getInfoData(slug);
  if (!data) return { title: 'Ristorante non trovato' };
  if ('unavailable' in data) return menuUnavailableMetadata(data.name);

  const cities = [...new Set(data.locations.map((l) => l.city).filter(Boolean))];
  const title = `${data.name} - Contatti e menu`;
  const description = `Menu, indirizzi, telefoni, orari e social di ${data.name}${cities.length ? ` (${cities.join(', ')})` : ''}.`;
  const url = `${SITE_URL}/${slug}/info`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: data.name, description, url, type: 'website', locale: 'it_IT' },
    // Stessa icona del menu e dell'app del locale
    icons: data.logoUrl ? { icon: data.logoUrl, apple: `/${slug}/app-icon/any/512` } : undefined,
  };
}
