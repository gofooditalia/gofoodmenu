/**
 * Pagina allergeni del menu pubblico: /{slug}/allergeni in italiano e /{slug}/{lingua}/allergeni per le lingue
 * del menu tradotto (tenants.menu_languages). Testi fissi in src/lib/allergens-i18n.ts. Stessi dati e stesse
 * regole del menu (getMenuData): lingua non attiva → 404, menu non pubblico → pagina neutra.
 */

import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import { SITE_URL } from '@/lib/site';
import { isMenuPublic } from '@/lib/menu-visibility';
import { ALLERGEN_PAGE } from '@/lib/allergens-i18n';
import { menuLangPath, menuLangTag, type MenuLang } from '@/lib/menu-languages';
import { getMenuData, tenantLanguages } from './menu-page';
import AllergensPageClient from './allergeni/AllergensPageClient';
import MenuUnavailable, { menuUnavailableMetadata } from './MenuUnavailable';

const ALLERGENS_SUFFIX = '/allergeni';

export async function AllergensPage({ slug, lang }: { slug: string; lang: MenuLang }) {
  const menuData = await getMenuData(slug, lang);
  if (!menuData) {
    notFound();
  }
  if (menuData.unavailable) {
    return <MenuUnavailable name={menuData.unavailable.name} logoUrl={menuData.unavailable.logoUrl} />;
  }
  const { tenant, themeConfig, languages } = menuData;

  return (
    <AllergensPageClient
      tenant={tenant}
      initialTheme={themeConfig}
      lang={lang}
      languages={languages}
    />
  );
}

export async function buildAllergensMetadata(slug: string, lang: MenuLang) {
  const supabase = createPublicClient();

  // '*': menu_languages (039) e grace_until (040) non sono ancora nei tipi generati
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant } = await (supabase.from('tenants') as any)
    .select('*')
    .eq('slug', slug)
    .single();

  const translated = tenant ? tenantLanguages(tenant) : [];
  if (!tenant || (lang !== 'it' && !translated.includes(lang))) {
    return { title: 'Ristorante non trovato' };
  }

  const name = (tenant.footer_data?.public_name || tenant.restaurant_name) as string;
  if (!isMenuPublic(tenant)) {
    return menuUnavailableMetadata(name);
  }

  const text = ALLERGEN_PAGE[lang];
  const url = (l: MenuLang) => `${SITE_URL}${menuLangPath(slug, l, ALLERGENS_SUFFIX)}`;

  return {
    title: `${text.allergens} - ${name}`,
    description: text.metaDescription(name),
    alternates: {
      canonical: url(lang),
      languages: translated.length
        ? {
          it: url('it'),
          ...Object.fromEntries(translated.map((l) => [menuLangTag(l), url(l)])),
          'x-default': url('it'),
        }
        : undefined,
    },
  };
}
