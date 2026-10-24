"use client";
import React, { useState, useRef, useEffect } from 'react';
import { FooterData } from '@/types/menu';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import DishCard from '@/components/DishCard';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import { ThemeProvider, useTheme } from '@/components/theme/ThemeContext';
import { ThemeWrapper } from '@/components/theme/ThemeWrapper';
import { ThemeDivider } from '@/components/theme/ThemeDivider';
import { ThemeConfig } from '@/lib/theme-engine/types';
import { readableTextOn } from '@/lib/theme-engine/contrast';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MenuLangProvider } from '@/lib/menu-i18n';
import type { MenuLang } from '@/lib/menu-languages';

interface Tenant {
  restaurant_name: string;
  logo_url?: string;
  slug: string;
  tagline?: string;
  footer_data?: FooterData;
}

// Altezza occupata da header fisso (72px) + barra categorie: le sezioni si fermano qui sotto
const NAV_OFFSET = 140;

interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  allergens: string[];
  is_seasonal?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_homemade?: boolean;
  is_frozen?: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  dishes: Dish[];
}

function MenuContent({ tenant, categories, lang, languages }: { tenant: Tenant, categories: Category[], lang: MenuLang, languages: MenuLang[] }) {
  const { currentTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id ?? null);
  // Durante lo scroll avviato da un click sulla barra, lo scroll-spy non deve cambiare categoria
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scrollToCategory = (categoryId: string, behavior: ScrollBehavior = 'smooth') => {
    const section = document.getElementById(categoryId);
    if (!section) return;

    isManualScroll.current = true;
    setActiveCategory(categoryId);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    const top = section.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior });

    scrollTimeout.current = setTimeout(() => {
      isManualScroll.current = false;
    }, 1000);
  };

  // Scroll-spy: la categoria attiva è l'ultima sezione il cui titolo è passato sotto la barra
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      if (isManualScroll.current || categories.length === 0) return;

      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      let current = categories[0].id;
      if (atBottom) {
        current = categories[categories.length - 1].id;
      } else {
        for (const category of categories) {
          const el = document.getElementById(category.id);
          if (!el) continue;
          if (el.getBoundingClientRect().top - NAV_OFFSET - 24 <= 0) current = category.id;
          else break;
        }
      }

      setActiveCategory((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [categories]);

  // Link diretto a una categoria (es. /ristorante#id-categoria)
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && categories.some((c) => c.id === id)) {
      requestAnimationFrame(() => scrollToCategory(id, 'auto'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sottotitolo e descrizioni delle categorie usano il colore secondario, spesso decorativo e chiaro
  const secondaryText = readableTextOn(currentTheme.colors.background, currentTheme.colors.secondary);
  const showPhotos = currentTheme.dishPhotos !== 'hide';

  return (
    <div
      lang={lang}
      className="min-h-screen pt-[135px] select-none overflow-x-hidden relative z-10"
      style={{
        // backgroundColor: currentTheme.colors.background, // RIMOSSO PER PERMETTERE AL TEXTURE OVERLAY DI ESSERE VISIBILE
        color: currentTheme.colors.text,
        '--tenant-primary': currentTheme.colors.primary,
        '--tenant-secondary': currentTheme.colors.secondary,
        '--tenant-background': currentTheme.colors.background,
        '--tenant-surface': currentTheme.colors.surface,
        '--tenant-text': currentTheme.colors.text,
        '--tenant-text-secondary': currentTheme.colors.textSecondary,
        '--tenant-border': currentTheme.colors.border,
        '--tenant-price': currentTheme.colors.price,
        '--tenant-accent': currentTheme.colors.accent,
      } as React.CSSProperties}
    >
      <Header
        restaurantName={tenant.restaurant_name}
        logoUrl={tenant.logo_url}
        logoHeight={currentTheme.logoHeight}
        mobileHeaderStyle={currentTheme.mobileHeaderStyle}
        slug={tenant.slug}
        menuLang={lang}
        menuLanguages={languages}
      />

      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={(id) => scrollToCategory(id)}
      />

      <main>
        {/* Hero Section */}
        <section className="relative h-[25vh] sm:h-[35vh] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundColor: currentTheme.colors.overlay || currentTheme.colors.primary,
              opacity: currentTheme.colors.overlayOpacity ?? 0.1
            }}
          />
          {/* Optional: Add a real image back if available, currently using color overlay pattern */}
          <div className="relative z-10 text-center px-4">
            <h1
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 theme-heading"
              style={{ color: currentTheme.colors.primary }}
            >
              {tenant.restaurant_name}
            </h1>
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto theme-body"
              style={{ color: secondaryText }}
            >
              {tenant.tagline || (lang === 'it' ? 'Autentica cucina romana nel cuore della città' : '')}
            </p>
          </div>
        </section>

        {/* Menu Sections: tutte le categorie in sequenza, navigabili con lo scroll verticale */}
        <div className="container mx-auto px-4 py-4 space-y-16">
          {categories.map((category, categoryIndex) => (
            <section key={category.id} id={category.id}>
              {/* Category Title with Dividers */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <ThemeDivider
                  dividerStyle={currentTheme.dividerStyle}
                  className={currentTheme.dividerStyle === 'gradient' ? 'flex-1' : 'max-w-[100px] w-full'}
                />
                <h2
                  className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center shrink-0 px-4 theme-heading"
                  style={{ color: currentTheme.colors.primary }}
                >
                  {category.name}
                </h2>
                <ThemeDivider
                  dividerStyle={currentTheme.dividerStyle}
                  className={currentTheme.dividerStyle === 'gradient' ? 'flex-1' : 'max-w-[100px] w-full'}
                />
              </div>

              {/* Category Description */}
              {category.description && (
                <p className="text-center text-lg mb-8 max-w-2xl mx-auto theme-body" style={{ color: secondaryText }}>
                  {category.description}
                </p>
              )}

              {/* Dishes Grid */}
              {/* Senza foto le schede sono solo testo: due colonne bastano anche su schermo largo */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${showPhotos ? 'lg:grid-cols-3' : ''}`}>
                {category.dishes.map((dish, dishIndex) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    tenantSlug={tenant.slug}
                    priority={categoryIndex === 0 && dishIndex < 2}
                    showPhoto={showPhotos}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer
        footerData={tenant.footer_data}
        restaurantName={tenant.restaurant_name}
        logoUrl={tenant.logo_url || undefined}
        slug={tenant.slug}
      />
      <ScrollToTop />
    </div>
  );
}

export default function MenuPageClient({ tenant, categories, initialTheme, lang = 'it', languages = ['it'] }: { tenant: Tenant, categories: Category[], initialTheme?: ThemeConfig, lang?: MenuLang, languages?: MenuLang[] }) {
  return (
    <MenuLangProvider value={lang}>
      <LanguageProvider initialLanguage={lang}>
        <ThemeProvider initialTheme={initialTheme}>
          <ThemeWrapper>
            <MenuContent tenant={tenant} categories={categories} lang={lang} languages={languages} />
          </ThemeWrapper>
        </ThemeProvider>
      </LanguageProvider>
    </MenuLangProvider>
  );
}
