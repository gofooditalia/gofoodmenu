import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import type { Tenant } from '@/types/menu';
import AllergensPageClient from './AllergensPageClient';
import { isMenuPublic } from '@/lib/menu-visibility';
import MenuUnavailable, { menuUnavailableMetadata } from '../MenuUnavailable';

// Cached per slug (ISR). Purged on every menu change via revalidatePublicMenu
// (src/app/actions/revalidate-menu.ts); the time-based revalidate is only a safety net.
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Fetch tenant data dal database
async function getTenantData(slug: string) {
    const supabase = createPublicClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenant, error } = await (supabase.from('tenants') as any)
        .select('*, tenant_locations(*)')
        .eq('slug', slug)
        .single();

    if (error || !tenant) {
        return null;
    }

    // Prepare Footer Data with Locations from DB (Priority: DB Locations > Legacy Fields > JSON)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbLocations = (tenant as any).tenant_locations || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedLocations = dbLocations.map((l: any) => ({
        city: l.city,
        address: l.address,
        phone: l.phone || '',
        opening_hours: l.opening_hours || ''
    }));

    // Merge into footer_data
    const existingFooterData = tenant.footer_data || { links: [], socials: [], show_brand_column: true };
    const mergedFooterData = {
        ...existingFooterData,
        locations: mappedLocations.length > 0 ? mappedLocations : (existingFooterData.locations || [])
    };

    tenant.footer_data = mergedFooterData;

    // FIX: Sync tagline from footer_data if root tagline is empty (Design Studio saves to footer_data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!tenant.tagline && (mergedFooterData as any).tagline) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tenant as any).tagline = (mergedFooterData as any).tagline;
    }

    // FIX: Sync public_name from footer_data if present (Design Studio "Nome Visualizzato" overrides registration name)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mergedFooterData as any).public_name) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tenant as any).restaurant_name = (mergedFooterData as any).public_name;
    }

    // Fetch Design Settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: designData } = await (supabase.from('tenant_design_settings') as any)
        .select('theme_config')
        .eq('tenant_id', tenant.id)
        .single();

    return {
        tenant: tenant as Tenant,
        themeConfig: designData?.theme_config || null
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    const data = await getTenantData(slug);

    if (!data) {
        notFound();
    }

    const { tenant, themeConfig } = data;

    // Come il menu: senza abbonamento attivo (o fuori dalla tolleranza) si mostra la pagina neutra
    if (!isMenuPublic(tenant)) {
        return <MenuUnavailable name={tenant.restaurant_name} logoUrl={tenant.logo_url} />;
    }

    return <AllergensPageClient tenant={tenant} initialTheme={themeConfig} />;
}

// Metadata dinamici per SEO
export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const supabase = createPublicClient();

    // '*': grace_until (migrazione 040) non è ancora nei tipi generati
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenant } = await (supabase.from('tenants') as any)
        .select('*')
        .eq('slug', slug)
        .single();

    if (!tenant) {
        return {
            title: 'Ristorante non trovato',
        };
    }

    const tenantData = {
        restaurant_name: (tenant.footer_data?.public_name || tenant.restaurant_name) as string,
    };

    if (!isMenuPublic(tenant)) {
        return menuUnavailableMetadata(tenantData.restaurant_name);
    }

    return {
        title: `Allergeni - ${tenantData.restaurant_name}`,
        description: `Lista degli allergeni e informazioni legali per ${tenantData.restaurant_name}.`,
    };
}
