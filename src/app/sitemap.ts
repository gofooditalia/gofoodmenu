
import { MetadataRoute } from 'next';
import { getPublicMenuTenants } from '@/lib/public-tenant';

// Rigenerata ogni ora: senza cookie Next la renderebbe statica al deploy (nuovi locali, lingue attivate e
// menu sospesi non comparirebbero fino al deploy successivo)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://gofoodmenu.it';

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
    // Solo i menu pubblici (funzione public_menu_tenants, stessa regola di isMenuPublic)
    const tenants = await getPublicMenuTenants();

    // Menu dei locali, più le versioni tradotte (/{slug}/{lingua}) per chi le ha attive
    const tenantPages: MetadataRoute.Sitemap = (tenants || [])
        .flatMap((tenant) =>
            ['', ...(tenant.menu_languages || []).map((lang) => `/${lang}`)].map((suffix) => ({
                url: `${baseUrl}/${tenant.slug}${suffix}`,
                lastModified: new Date(tenant.updated_at),
                changeFrequency: 'daily' as const,
                priority: suffix ? 0.8 : 0.9,
            }))
        );

    return [...staticPages, ...tenantPages];
}
