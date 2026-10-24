
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://gofoodmenu.it';
    const supabase = await createClient();

    // 1. Static Pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/en`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    // 2. Dynamic Tenant Pages
    // Fetch all active tenants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenants } = await (supabase.from('tenants') as any)
        // '*' e non l'elenco delle colonne: prima della migrazione 039 menu_languages non esiste
        .select('*')
        .eq('subscription_status', 'active')
        .not('slug', 'is', null);

    // Menu dei locali, più le versioni tradotte (/{slug}/{lingua}) per chi le ha attive
    const tenantPages: MetadataRoute.Sitemap = (tenants || [])
        .filter((tenant: { slug: string | null }) => tenant.slug)
        .flatMap((tenant: { slug: string; updated_at: string; menu_languages?: string[] | null }) =>
            ['', ...(tenant.menu_languages || []).map((lang) => `/${lang}`)].map((suffix) => ({
                url: `${baseUrl}/${tenant.slug}${suffix}`,
                lastModified: new Date(tenant.updated_at),
                changeFrequency: 'daily' as const,
                priority: suffix ? 0.8 : 0.9,
            }))
        );

    return [...staticPages, ...tenantPages];
}
