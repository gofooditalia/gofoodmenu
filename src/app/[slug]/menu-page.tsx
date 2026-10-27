/**
 * Menu Pubblico: dati, pagina e metadati condivisi da /{slug} (italiano) e /{slug}/{lingua}
 * (inglese, francese, tedesco, spagnolo, polacco, portoghese: traduzioni salvate nel database, migrazione 039).
 *
 * Esempio: /magnaromatrattoria, /magnaromatrattoria/en
 */

import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import type { Tenant } from '@/types/menu';
import MenuPageClient from './MenuPageClient';
import { SITE_URL } from '@/lib/site';
import { getTenantPwaData } from '@/lib/tenant-pwa';
import { isTranslatedLang, TRANSLATED_LANGS, type MenuLang, type TranslatedLang } from '@/lib/menu-languages';
import { isMenuPublic } from '@/lib/menu-visibility';
import MenuUnavailable, { menuUnavailableMetadata } from './MenuUnavailable';

type TextPair = { name: string; description: string };
type StoredTranslations = Partial<Record<TranslatedLang, TextPair>> & { source?: TextPair };

/**
 * Testo da mostrare nella lingua richiesta. La traduzione vale solo se è stata fatta sul testo italiano
 * attuale: se il ristoratore ha cambiato nome o descrizione dopo, si mostra l'italiano (mai ingredienti vecchi).
 */
function localize(original: { name: string; description?: string | null }, translations: unknown, lang: MenuLang): TextPair {
  const it = { name: original.name, description: original.description ?? '' };
  if (lang === 'it' || !translations || typeof translations !== 'object') return it;
  const t = translations as StoredTranslations;
  const target = t[lang];
  const sameSource = t.source?.name === it.name.trim() && t.source?.description === it.description.trim();
  if (!target?.name || !sameSource) return it;
  return { name: target.name, description: target.description ?? '' };
}

/** Lingue tradotte e pubblicate per il locale (colonna menu_languages; vuota prima della migrazione 039). */
export function tenantLanguages(tenant: { menu_languages?: unknown }): TranslatedLang[] {
  const value = Array.isArray(tenant.menu_languages) ? tenant.menu_languages : [];
  return TRANSLATED_LANGS.filter((lang) => value.includes(lang));
}

interface DbCategory {
  slug: string;
  name: string;
  description?: string;
  translations?: unknown;
  dishes?: DbDish[];
}

interface DbDish {
  slug: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_visible: boolean;
  is_seasonal: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  display_order: number;
  is_homemade: boolean;
  is_frozen: boolean;
  allergen_ids?: string[];
  translations?: unknown;
}

interface DbDishAllergen {
  allergen: { id: string };
}

// Fetch menu data dal database, nella lingua richiesta (null = menu inesistente o lingua non attiva;
// `unavailable` = il locale esiste ma il menu non è pubblico: si mostra la pagina neutra)
export async function getMenuData(slug: string, lang: MenuLang = 'it') {
  const supabase = createPublicClient();

  // 1. Fetch tenant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant, error: tenantError } = await (supabase.from('tenants') as any)
    .select('*, tenant_locations(*)')
    .eq('slug', slug)
    .single();

  if (tenantError || !tenant) {
    return null;
  }

  const languages = tenantLanguages(tenant);
  if (lang !== 'it' && !languages.includes(lang)) {
    return null;
  }

  // Piano free, abbonamento sospeso o disdetto: niente menu (con pagamento non riuscito resta visibile
  // durante la tolleranza, src/lib/menu-visibility.ts)
  if (!isMenuPublic(tenant)) {
    return {
      unavailable: {
        name: (tenant.footer_data?.public_name || tenant.restaurant_name) as string,
        logoUrl: (tenant.logo_url || null) as string | null,
      },
    };
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

  // Legacy fallback removed as requested

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

  // Sottotitolo e descrizione del locale nella lingua del menu (tradotti insieme ai piatti)
  if (lang !== 'it') {
    if (tenant.tagline) {
      tenant.tagline = localize({ name: tenant.tagline }, tenant.translations?.tagline, lang).name;
    }
    const brandIt = tenant.footer_data?.brand_description?.it;
    if (brandIt) {
      const brand = localize({ name: brandIt }, tenant.translations?.brand, lang).name;
      tenant.footer_data = {
        ...tenant.footer_data,
        // Senza traduzione valida resta l'italiano (anche per 'en', dove il Design Studio copia l'italiano)
        brand_description: { ...tenant.footer_data.brand_description, [lang]: brand },
      };
    }
  }

  const tenantData = tenant as Tenant;

  // 2. Fetch categories con piatti
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories, error: categoriesError } = await (supabase.from('categories') as any)
    .select(`
      *,
      dishes:dishes(*)
    `)
    .eq('tenant_id', tenantData.id)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return null;
  }

  // Transform data per compatibilità con componenti esistenti
  const transformedCategories = (categories as DbCategory[])?.map((cat) => ({
    id: cat.slug,
    ...localize(cat, cat.translations, lang),
    dishes: cat.dishes
      ?.filter((dish) => dish.is_visible)
      .sort((a, b) => a.display_order - b.display_order)
      .map((dish) => ({
        id: dish.slug,
        ...localize(dish, dish.translations, lang),
        price: dish.price.toFixed(2),
        image: dish.image_url || '/icon.svg',
        allergens: dish.allergen_ids || [],
        is_seasonal: dish.is_seasonal,
        is_vegetarian: dish.is_vegetarian,
        is_vegan: dish.is_vegan,
        is_gluten_free: dish.is_gluten_free,
        is_homemade: dish.is_homemade,
        is_frozen: dish.is_frozen,
      })) || []
  })) || [];

  // 3. Fetch Design Settings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: designSettings } = await (supabase.from('tenant_design_settings') as any)
    .select('theme_config')
    .eq('tenant_id', tenantData.id)
    .single();

  return {
    tenant: tenantData,
    categories: transformedCategories,
    themeConfig: designSettings?.theme_config || null,
    languages: ['it', ...languages] as MenuLang[],
  };
}

export function menuPath(slug: string, lang: MenuLang) {
  return lang === 'it' ? `/${slug}` : `/${slug}/${lang}`;
}

export async function MenuPage({ slug, lang }: { slug: string; lang: MenuLang }) {
  const menuData = await getMenuData(slug, lang);
  if (!menuData) {
    notFound();
  }
  if (menuData.unavailable) {
    return <MenuUnavailable name={menuData.unavailable.name} logoUrl={menuData.unavailable.logoUrl} />;
  }
  const { tenant, categories, themeConfig, languages } = menuData;

  // Transform tenant to match expected interface
  const transformedTenant = {
    ...tenant,
    logo_url: tenant.logo_url || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: tenant.restaurant_name,
            image: tenant.logo_url,
            url: `${SITE_URL}${menuPath(slug, lang)}`,
            inLanguage: lang,
            telephone: tenant.footer_data?.locations?.[0]?.phone,
            address: {
              '@type': 'PostalAddress',
              streetAddress: tenant.footer_data?.locations?.[0]?.address,
              addressLocality: tenant.footer_data?.locations?.[0]?.city,
              addressCountry: 'IT'
            },
            menu: `${SITE_URL}${menuPath(slug, lang)}`
          })
        }}
      />
      <MenuPageClient
        tenant={transformedTenant}
        categories={categories}
        initialTheme={themeConfig}
        lang={lang}
        languages={languages}
      />
    </>
  );
}

// Metadati per SEO, nella lingua della pagina, con i collegamenti alle altre lingue del menu
const META_TEXT: Record<MenuLang, { title: string; description: (name: string, city?: string) => string }> = {
  it: {
    title: 'Menu Digitale',
    description: (name, city) => `Scopri il menu di ${name}${city ? ` a ${city}` : ''}: piatti, prezzi e allergeni, aggiornati in tempo reale.`,
  },
  en: {
    title: 'Digital Menu',
    description: (name, city) => `The menu of ${name}${city ? ` in ${city}` : ''}: dishes, prices and allergens, always up to date.`,
  },
  fr: {
    title: 'Menu digital',
    description: (name, city) => `Le menu de ${name}${city ? ` à ${city}` : ''} : plats, prix et allergènes, toujours à jour.`,
  },
  de: {
    title: 'Digitale Speisekarte',
    description: (name, city) => `Die Speisekarte von ${name}${city ? ` in ${city}` : ''}: Gerichte, Preise und Allergene, immer aktuell.`,
  },
  es: {
    title: 'Menú digital',
    description: (name, city) => `El menú de ${name}${city ? ` en ${city}` : ''}: platos, precios y alérgenos, siempre actualizados.`,
  },
  pl: {
    title: 'Menu cyfrowe',
    description: (name, city) => `Menu restauracji ${name}${city ? ` (${city})` : ''}: dania, ceny i alergeny, zawsze aktualne.`,
  },
  pt: {
    title: 'Menu digital',
    description: (name, city) => `O menu de ${name}${city ? ` em ${city}` : ''}: pratos, preços e alergénios, sempre atualizados.`,
  },
};

export async function buildMenuMetadata(slug: string, lang: MenuLang) {
  const supabase = createPublicClient();

  // '*' e non l'elenco delle colonne: prima della migrazione 039 menu_languages non esiste
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant } = await (supabase.from('tenants') as any)
    .select('*, tenant_locations(city)')
    .eq('slug', slug)
    .single();

  if (!tenant || (lang !== 'it' && !tenantLanguages(tenant).includes(lang))) {
    return {
      title: 'Ristorante non trovato',
    };
  }

  if (!isMenuPublic(tenant)) {
    return menuUnavailableMetadata(tenant.footer_data?.public_name || tenant.restaurant_name);
  }

  const tenantData = tenant as {
    restaurant_name: string;
    logo_url: string | null;
    tenant_locations?: { city: string }[];
    menu_languages?: unknown;
  };

  const city = tenantData.tenant_locations?.[0]?.city;
  const text = META_TEXT[lang];
  const title = `${tenantData.restaurant_name} - ${text.title}`;
  const description = text.description(tenantData.restaurant_name, city);
  const pageUrl = `${SITE_URL}${menuPath(slug, lang)}`;
  const translated = tenantLanguages(tenantData);

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      // Versioni del menu in altre lingue: i motori di ricerca mostrano quella giusta a ogni turista
      languages: translated.length
        ? {
          it: `${SITE_URL}/${slug}`,
          ...Object.fromEntries(translated.map((l) => [l, `${SITE_URL}/${slug}/${l}`])),
          'x-default': `${SITE_URL}/${slug}`,
        }
        : undefined,
    },
    openGraph: {
      title: tenantData.restaurant_name,
      description,
      url: pageUrl,
      type: 'website',
      locale: { it: 'it_IT', en: 'en_GB', fr: 'fr_FR', de: 'de_DE', es: 'es_ES', pl: 'pl_PL', pt: 'pt_PT' }[lang],
      // Immagine di anteprima: ./opengraph-image.tsx (logo, nome e colori del locale, 1200×630)
    },
    // PWA del ristorante: Chrome propone di installare il menu come app del locale
    manifest: `/${slug}/manifest.webmanifest`,
    // Icona del ristorante (al posto del logo Go!Food): il logo originale per la scheda
    // del browser; per iOS ("Aggiungi alla schermata Home" usa l'apple-touch-icon, non le
    // icone del manifest) l'icona quadrata e opaca dell'app, perché iOS riempie di nero
    // o bianco le parti trasparenti e deforma i loghi non quadrati
    icons: tenantData.logo_url
      ? { icon: tenantData.logo_url, apple: `/${slug}/app-icon/any/512` }
      : undefined,
    twitter: {
      card: 'summary_large_image' as const,
      title: tenantData.restaurant_name,
      description,
    },
  };
}

// Stesso colore del manifest del ristorante: nell'app installata il theme-color della
// pagina prevale su quello del manifest per la barra di stato
export async function buildMenuViewport(slug: string) {
  const pwa = await getTenantPwaData(slug);
  return pwa ? { themeColor: pwa.appColor } : {};
}

export { isTranslatedLang };
