'use client';

/**
 * Menu su misura di Sunset Barcarello (src/lib/menu-layouts.ts), al posto di MenuPageClient.
 *
 * Carta tipografica pensata per un menu con poche foto: ogni piatto è una riga (nome, prezzo con i puntini,
 * ingredienti, allergeni) e la foto, se c'è, è una miniatura accanto. In testa a ogni categoria i piatti con
 * la foto diventano "In evidenza". Nessun riquadro vuoto per i piatti senza foto.
 * Vini con calice e bottiglia (due voci nel pannello) su una sola riga con due prezzi.
 * Tema chiaro di giorno e scuro dopo il tramonto: useSunsetTheme.ts.
 * Le categorie senza piatti non compaiono.
 */

import './sunset-menu.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useGlutenFilter } from '@/contexts/GlutenFilterContext';
import { useCategoryScroll } from '@/hooks/useCategoryScroll';
import { useMenuStrings } from '@/lib/menu-i18n';
import { menuLangDir, menuLangPath, menuLangTag, type MenuLang } from '@/lib/menu-languages';
import type { SunsetLayout } from '@/lib/menu-layouts';
import { dishThumbUrl } from '@/lib/dish-thumbs';
import { parseIngredients } from '@/utils/ingredientParser';
import type { FooterData } from '@/types/menu';
import { SunsetSkyline, SunsetWave } from './SunsetSkyline';
import { useSunsetTheme } from './useSunsetTheme';
import { SunsetLanguageMenu } from './SunsetLanguageMenu';

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

interface Tenant {
  restaurant_name: string;
  logo_url?: string;
  slug: string;
  tagline?: string;
  footer_data?: FooterData;
}

interface Serving {
  label: string;
  price: string;
}

/** Riga del menu: un piatto, o un vino con più formati (calice, bottiglia) e un prezzo per formato. */
interface Row extends Dish {
  servings?: Serving[];
}

// Barra in alto (56 px) + barra categorie (52 px): le sezioni si fermano qui sotto
const TOP_BAR = 56;
const NAV_OFFSET = 116;
// Quante foto al massimo in "In evidenza" per categoria
const FEATURED_MAX = 6;

function hasPhoto(dish: Dish) {
  return !!dish.image && !dish.image.includes('icon.svg') && !dish.image.includes('favicon.svg');
}

function formatPrice(price: string, lang: MenuLang) {
  const value = Number(price);
  if (!Number.isFinite(value)) return price;
  const cents = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat(menuLangTag(lang), {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const SERVING = /^(.*?)\s*\((calice|bottiglia)\)\s*$/i;

/**
 * "Grillo (Calice)" + "Grillo (Bottiglia)" → una riga "Grillo" con due prezzi. Solo quando ci sono entrambi
 * i formati e per il resto le voci sono identiche (descrizione, allergeni, avvisi): altrimenti restano separate.
 * Nei menu tradotti i nomi cambiano e le voci restano separate.
 */
function groupServings(dishes: Dish[]): Row[] {
  const signature = (d: Dish) =>
    [d.description.trim(), [...d.allergens].sort().join(','), d.is_frozen, d.is_homemade, d.is_seasonal, d.is_vegan, d.is_vegetarian].join('|');
  const groups = new Map<string, { label: string; dish: Dish }[]>();
  for (const dish of dishes) {
    const match = dish.name.match(SERVING);
    if (!match) continue;
    const key = match[1].trim().toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), { label: match[2], dish }]);
  }

  const rows: Row[] = [];
  const done = new Set<string>();
  for (const dish of dishes) {
    const match = dish.name.match(SERVING);
    const key = match?.[1].trim().toLowerCase();
    const group = key ? groups.get(key) : undefined;
    const formats = new Set(group?.map((g) => g.label.toLowerCase()));
    const mergeable =
      !!group &&
      group.length === 2 &&
      formats.has('calice') &&
      formats.has('bottiglia') &&
      signature(group[0].dish) === signature(group[1].dish);
    if (!mergeable) {
      rows.push(dish);
      continue;
    }
    if (done.has(key!)) continue;
    done.add(key!);
    const ordered = [...group!].sort((a) => (a.label.toLowerCase() === 'calice' ? -1 : 1));
    const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    rows.push({
      ...dish,
      name: match![1].trim(),
      image: ordered.find((g) => hasPhoto(g.dish))?.dish.image ?? dish.image,
      servings: ordered.map((g) => ({ label: label(g.label), price: g.dish.price })),
    });
  }
  return rows;
}

/** Foto del piatto: miniatura scaricata da Supabase, altrimenti la foto ottimizzata (come DishCard). */
function DishPhoto({ dish, sizes, className }: { dish: Dish; sizes: string; className?: string }) {
  const thumb = dishThumbUrl(dish.image);
  const [thumbError, setThumbError] = useState(false);
  const [error, setError] = useState(false);
  const useThumb = !!thumb && !thumbError;
  if (error) return null;
  return (
    <Image
      src={useThumb ? thumb! : dish.image}
      alt=""
      fill
      sizes={sizes}
      unoptimized={useThumb}
      className={`object-cover ${className ?? ''}`}
      onError={() => (useThumb ? setThumbError(true) : setError(true))}
    />
  );
}

function Logo({ url, className, style }: { url: string; className?: string; style?: React.CSSProperties }) {
  const mask = `url("${url.replace(/"/g, '%22')}")`;
  return (
    <div
      aria-hidden="true"
      className={`sm-logo ${className ?? ''}`}
      style={{ WebkitMaskImage: mask, maskImage: mask, ...style }}
    />
  );
}

function DishRow({ row, lang, highlighted }: { row: Row; lang: MenuLang; highlighted: boolean }) {
  const strings = useMenuStrings();
  const { isGlutenFree } = useGlutenFilter();
  const disabled = isGlutenFree && row.allergens.includes('glutine');
  const photo = hasPhoto(row) && !row.is_seasonal;

  const notes: string[] = [];
  if (row.is_seasonal) notes.push(strings.outOfSeason);
  if (row.is_frozen) notes.push(strings.frozen);
  if (row.is_homemade) notes.push(strings.homemade);
  if (row.is_vegan) notes.push(strings.vegan);
  else if (row.is_vegetarian) notes.push(strings.vegetarian);

  return (
    <article
      id={`piatto-${row.id}`}
      className={`flex gap-3 py-5 px-2 -mx-2 min-h-[7.75rem] border-t border-[var(--sm-line)] first:border-t-0 ${highlighted ? 'sm-row-highlight' : ''} ${disabled ? 'opacity-45' : ''}`}
    >
      <div className="flex-1 min-w-0">
        {row.servings ? (
          <h3 className="sm-dish-name text-[1.0625rem] leading-snug font-semibold text-[var(--sm-ink)]">{row.name}</h3>
        ) : (
          <div className="flex items-end gap-2">
            <h3 className="sm-dish-name text-[1.0625rem] leading-snug font-semibold text-[var(--sm-ink)] min-w-0">{row.name}</h3>
            <span className="sm-leader" aria-hidden="true" />
            <span className="shrink-0 text-[1.0625rem] font-semibold text-[var(--sm-accent)] tabular-nums" dir="ltr">
              € {formatPrice(row.price, lang)}
            </span>
          </div>
        )}

        {row.servings && (
          <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-base text-[var(--sm-ink-2)]">
            {row.servings.map((s) => (
              <span key={s.label}>
                {s.label}{' '}
                <span className="font-semibold text-[var(--sm-accent)] tabular-nums" dir="ltr">
                  € {formatPrice(s.price, lang)}
                </span>
              </span>
            ))}
          </p>
        )}

        {row.description?.trim() && (
          <p className="mt-1 text-base leading-relaxed text-[var(--sm-ink-2)]">{parseIngredients(row.description)}</p>
        )}

        {(notes.length > 0 || row.allergens.length > 0 || disabled) && (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--sm-ink-2)]">
            {disabled && <span className="font-semibold text-[var(--sm-accent)]">{strings.containsGluten} · </span>}
            {notes.length > 0 && <span className="font-medium text-[var(--sm-ink)]">{notes.join(' · ')}</span>}
            {notes.length > 0 && row.allergens.length > 0 && ' · '}
            {row.allergens.map((a) => strings.allergenName(a)).join(' · ')}
          </p>
        )}
      </div>

      {photo && (
        <div className="relative shrink-0 w-[4.5rem] h-[4.5rem] rounded-lg overflow-hidden bg-[var(--sm-nav)] self-start mt-0.5">
          <DishPhoto dish={row} sizes="72px" />
        </div>
      )}
    </article>
  );
}

export default function SunsetMenu({
  tenant,
  categories,
  lang,
  languages,
  layout,
}: {
  tenant: Tenant;
  categories: Category[];
  lang: MenuLang;
  languages: MenuLang[];
  layout: SunsetLayout;
}) {
  useSunsetTheme(layout.place);
  const strings = useMenuStrings();
  const { isGlutenFree, toggleGlutenFilter } = useGlutenFilter();

  // Categorie senza piatti visibili: fuori dal menu e dalla barra
  const sections = useMemo(
    () =>
      categories
        .filter((c) => c.dishes.length > 0)
        .map((c) => ({
          ...c,
          rows: groupServings(c.dishes),
          featured: c.dishes.filter((d) => hasPhoto(d) && !d.is_seasonal).slice(0, FEATURED_MAX),
        })),
    [categories],
  );
  const categoryIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const { activeCategory, scrollToCategory, scrollToElement } = useCategoryScroll(categoryIds, NAV_OFFSET);

  // Mini logo nella barra quando quello grande è uscito dallo schermo
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      rootMargin: `-${TOP_BAR}px 0px 0px 0px`,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // La categoria attiva resta visibile nella barra
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const button = activeCategory ? nav?.querySelector<HTMLElement>(`[data-cat="${CSS.escape(activeCategory)}"]`) : null;
    if (nav && button) {
      nav.scrollTo({ left: button.offsetLeft - nav.offsetWidth / 2 + button.offsetWidth / 2, behavior: 'smooth' });
    }
  }, [activeCategory]);

  // Tocco su una foto in evidenza: si va alla riga del piatto, che si illumina un momento
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const goToDish = (categoryId: string, dishId: string) => {
    // Un vino unito su una riga (calice e bottiglia) ha l'id della prima voce: se manca si va alla categoria
    if (!document.getElementById(`piatto-${dishId}`)) {
      scrollToCategory(categoryId);
      return;
    }
    scrollToElement(`piatto-${dishId}`, 'smooth', categoryId);
    setHighlighted(dishId);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlighted(null), 1800);
  };
  useEffect(() => () => clearTimeout(highlightTimer.current), []);

  const name = tenant.restaurant_name.replace(/\s+/g, ' ').trim();
  return (
    <div
      lang={menuLangTag(lang)}
      dir={menuLangDir(lang)}
      className="sunset-menu min-h-screen select-none overflow-x-hidden"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* Barra in alto: mini logo a sinistra (compare scorrendo), filtro senza glutine e lingua a destra */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-[var(--sm-bg)]">
        <div className="mx-auto max-w-2xl h-full px-3 flex items-center justify-between gap-2">
          <div className={`transition-opacity duration-300 ${heroVisible ? 'opacity-0' : 'opacity-100'}`}>
            {tenant.logo_url ? (
              <Logo url={tenant.logo_url} style={{ width: 96, aspectRatio: '1920 / 800' }} />
            ) : (
              <span aria-hidden="true" className="sm-serif text-lg text-[var(--sm-heading)]">{name}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleGlutenFilter}
              title={strings.glutenFilter}
              aria-pressed={isGlutenFree}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm font-semibold touch-manipulation ${isGlutenFree
                ? 'bg-[var(--sm-pill-bg)] text-[var(--sm-pill-text)] border-transparent'
                : 'border-[var(--sm-pill-border)] text-[var(--sm-ink)]'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true"><path d="m2 22 10-10m4-4-1.17 1.17M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94M8 8l-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97m-.6-6.24c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4" /><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0M16 16l-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 1.97-.98m6.24.6c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28M2 2l20 20" /></svg>
              <span>{strings.glutenFreeShort}</span>
            </button>

            {languages.length > 1 ? (
              <SunsetLanguageMenu slug={tenant.slug} current={lang} languages={languages} />
            ) : (
              <LanguageSwitcher compact />
            )}
          </div>
        </div>
      </header>

      {/* Barra categorie */}
      <nav aria-label={name} className="fixed top-14 inset-x-0 z-40 bg-[var(--sm-nav)] border-y border-[var(--sm-line)]">
        <div ref={navRef} className="sm-scroll-x overflow-x-auto mx-auto max-w-2xl">
          <div className="flex gap-2 px-3 py-2.5 min-w-max">
            {sections.map((section) => {
              const active = activeCategory === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  data-cat={section.id}
                  onClick={() => scrollToCategory(section.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap touch-manipulation border ${active
                    ? 'bg-[var(--sm-pill-bg)] text-[var(--sm-pill-text)] border-transparent'
                    : 'text-[var(--sm-ink)] border-[var(--sm-pill-border)]'
                    }`}
                >
                  {section.name.trim()}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="pt-[108px]">
        {/* Testata: logo del locale, luogo e skyline dell'Isola delle Femmine */}
        <div ref={heroRef} className="mx-auto max-w-2xl px-4 pt-7 text-center">
          <h1 className="flex flex-col items-center">
            <span className="sr-only">{name}</span>
            {tenant.logo_url ? (
              <Logo url={tenant.logo_url} className="mx-auto" style={{ width: 'min(78vw, 320px)', aspectRatio: '1920 / 800' }} />
            ) : (
              <span aria-hidden="true" className="sm-serif text-4xl text-[var(--sm-heading)]">{name}</span>
            )}
          </h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--sm-accent)]">{layout.placeLabel}</p>
          <div className="mt-3 -mx-4 sm:mx-0">
            <SunsetSkyline />
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 pb-6">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="pt-9">
              <h2 className="text-center sm-serif text-[1.75rem] leading-tight text-[var(--sm-heading)]">
                {section.name.trim()}
              </h2>
              <SunsetWave />
              {section.description?.trim() && (
                <p className="mt-3 text-center text-base italic leading-relaxed text-[var(--sm-ink-2)] sm-serif">
                  {section.description}
                </p>
              )}

              {section.featured.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sm-accent)]">{strings.featured}</p>
                  <div className="sm-scroll-x mt-2 -mx-4 px-4 overflow-x-auto">
                    <div className="flex gap-3 pb-1 min-w-max">
                      {section.featured.map((dish) => (
                        <button
                          key={dish.id}
                          type="button"
                          onClick={() => goToDish(section.id, dish.id)}
                          className="w-40 text-start rounded-xl overflow-hidden bg-[var(--sm-surface)] border border-[var(--sm-line)]"
                        >
                          <span className="relative block aspect-[4/3] bg-[var(--sm-nav)]">
                            <DishPhoto dish={dish} sizes="160px" />
                          </span>
                          <span className="block px-2.5 py-2">
                            <span className="sm-dish-name block text-sm leading-snug font-semibold text-[var(--sm-ink)] line-clamp-2">
                              {dish.name}
                            </span>
                            <span className="block mt-0.5 text-sm font-semibold text-[var(--sm-accent)] tabular-nums" dir="ltr">
                              € {formatPrice(dish.price, lang)}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                {section.rows.map((row) => (
                  <DishRow key={row.id} row={row} lang={lang} highlighted={highlighted === row.id} />
                ))}
              </div>
            </section>
          ))}

          <p className="mt-10 text-center text-base">
            <Link
              href={menuLangPath(tenant.slug, lang, '/allergeni')}
              prefetch={false}
              className="font-medium text-[var(--sm-heading)] underline underline-offset-4 decoration-[var(--sm-dots)]"
            >
              {strings.allergenInfo}
            </Link>
          </p>
          <div className="mt-6 mx-auto w-40 opacity-90">
            <SunsetSkyline />
          </div>
        </div>
      </main>

      <Footer footerData={tenant.footer_data} restaurantName={name} logoUrl={tenant.logo_url} slug={tenant.slug} />
      <ScrollToTop />
    </div>
  );
}
