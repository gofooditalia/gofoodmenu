/**
 * Pagina allergeni del menu pubblico: /{slug}/allergeni in italiano e /{slug}/{lingua}/allergeni per le lingue
 * del menu tradotto (tenants.menu_languages). Testi fissi in src/lib/allergens-i18n.ts. Stessi dati e stesse
 * regole del menu (getMenuData): lingua non attiva → 404, menu non pubblico → pagina neutra.
 */

import { notFound } from 'next/navigation';
import { getPublicTenant } from '@/lib/public-tenant';
import { SITE_URL } from '@/lib/site';
import { ALLERGEN_PAGE } from '@/lib/allergens-i18n';
import { menuLangPath, menuLangTag, type MenuLang } from '@/lib/menu-languages';
import { getMenuData, tenantLanguages } from './menu-page';
import AllergensPageClient from './allergeni/AllergensPageClient';
import MenuUnavailable, { menuUnavailableMetadata } from './MenuUnavailable';
import { menuLayoutFor } from '@/lib/menu-layouts';
import { nightIntervals } from '@/lib/sun-times';
import { sunsetThemeScript } from '@/lib/sunset-theme';
import SunsetAllergensPage from '@/components/sunset/SunsetAllergensPage';

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

  // Menu su misura (src/lib/menu-layouts.ts): anche la pagina allergeni prende il suo aspetto e il suo tema
  const layout = menuLayoutFor(slug);
  if (layout?.kind === 'sunset') {
    return (
      <>
        <script dangerouslySetInnerHTML={{ __html: sunsetThemeScript(nightIntervals(new Date(), 15, layout.place)) }} />
        <SunsetAllergensPage tenant={tenant} lang={lang} languages={languages} layout={layout} />
      </>
    );
  }

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
  const tenant = await getPublicTenant(slug);

  const translated = tenant ? tenantLanguages(tenant) : [];
  if (!tenant || (lang !== 'it' && !translated.includes(lang))) {
    return { title: 'Ristorante non trovato' };
  }

  const name = (tenant.footer_data?.public_name || tenant.restaurant_name) as string;
  if (!tenant.menu_public) {
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
