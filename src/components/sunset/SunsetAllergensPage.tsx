'use client';

/**
 * Pagina allergeni del menu Sunset (/sunset-barcarello/allergeni e /sunset-barcarello/{lingua}/allergeni), al
 * posto di AllergensPageClient: stessi testi fissi (src/lib/allergens-i18n.ts), con l'aspetto e il tema chiaro/scuro
 * del menu Sunset. Una sola pagina, senza schede: l'elenco dei 14 allergeni con le descrizioni e sotto le note legali
 * (asterischi, regolamento, coperto), con le stesse icone al tratto del menu (AllergenIcon). La scheda "Info legali" del menu standard ripeteva solo i nomi degli allergeni.
 */

import './sunset-menu.css';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { AllergenIcon } from '@/components/AllergenIcon';
import ScrollToTop from '@/components/ScrollToTop';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ALLERGEN_LIST, ALLERGEN_PAGE } from '@/lib/allergens-i18n';
import { menuLangDir, menuLangPath, menuLangTag, type MenuLang } from '@/lib/menu-languages';
import type { SunsetLayout } from '@/lib/menu-layouts';
import type { Tenant } from '@/types/menu';
import { SunsetLanguageMenu } from './SunsetLanguageMenu';
import { SunsetLogo } from './SunsetLogo';
import { formatCoverCharge } from './cover-charge';
import { SunsetWave } from './SunsetSkyline';
import { useSunsetTheme } from './useSunsetTheme';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MenuLangProvider } from '@/lib/menu-i18n';


// Lingua della pagina per piè di pagina, selettore e "torna su" (come AllergensPageClient)
export default function SunsetAllergensPage(props: { tenant: Tenant; lang: MenuLang; languages: MenuLang[]; layout: SunsetLayout }) {
  return (
    <MenuLangProvider value={props.lang}>
      <LanguageProvider initialLanguage={props.lang}>
        <SunsetAllergensContent {...props} />
      </LanguageProvider>
    </MenuLangProvider>
  );
}

function SunsetAllergensContent({
  tenant,
  lang,
  languages,
  layout,
}: {
  tenant: Tenant;
  lang: MenuLang;
  languages: MenuLang[];
  layout: SunsetLayout;
}) {
  useSunsetTheme(layout.place);
  const text = ALLERGEN_PAGE[lang];
  const name = tenant.restaurant_name.replace(/\s+/g, ' ').trim();
  const menuHref = menuLangPath(tenant.slug, lang);
  // Coperto solo se il locale ne ha uno (a zero la riga non dice niente al cliente)
  const coverCharge = formatCoverCharge(tenant.cover_charge, lang);

  return (
    <div
      lang={menuLangTag(lang)}
      dir={menuLangDir(lang)}
      className="sunset-menu min-h-screen overflow-x-hidden"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* Barra in alto: logo che riporta al menu, lingua */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-[var(--sm-bg)] border-b border-[var(--sm-line)]">
        <div className="mx-auto max-w-2xl h-full px-3 flex items-center justify-between gap-2">
          <Link href={menuHref} aria-label={`${text.menu}: ${name}`} className="block">
            {tenant.logo_url ? (
              <SunsetLogo url={tenant.logo_url} style={{ width: 96 }} />
            ) : (
              <span className="sm-serif text-lg text-[var(--sm-heading)]">{name}</span>
            )}
          </Link>
          {languages.length > 1 ? (
            <SunsetLanguageMenu slug={tenant.slug} current={lang} languages={languages} pathSuffix="/allergeni" />
          ) : (
            <LanguageSwitcher compact />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-20 pb-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-[var(--sm-ink-2)]">
            <li>
              <Link href={menuHref} className="underline underline-offset-4 decoration-[var(--sm-dots)]">
                {text.menu}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[var(--sm-ink)]">{text.allergens}</li>
          </ol>
        </nav>

        <section className="pt-8 text-center">
          <h1 className="sm-serif text-[2rem] leading-tight text-[var(--sm-heading)]">{text.title}</h1>
          <SunsetWave />
          <p className="mt-4 text-base leading-relaxed text-[var(--sm-ink-2)]">{text.subtitle}</p>
        </section>

        <section className="mt-10" aria-labelledby="sm-allergen-list">
          <h2 id="sm-allergen-list" className="sm-serif text-center text-[1.75rem] leading-tight text-[var(--sm-heading)]">
            {text.listTitle}
          </h2>
          <p className="mt-2 text-center text-base text-[var(--sm-ink-2)]">{text.listSubtitle}</p>
          {text.translationNote && <p className="mt-2 text-center text-sm text-[var(--sm-ink-2)]">{text.translationNote}</p>}
          <ol className="mt-6">
            {ALLERGEN_LIST.map((allergen) => (
              <li key={allergen.id} className="flex gap-4 py-5 border-t border-[var(--sm-line)] first:border-t-0">
                <span className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-[var(--sm-nav)] border border-[var(--sm-line)] text-[var(--sm-accent)]">
                  <AllergenIcon id={allergen.id} className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[1.0625rem] font-semibold leading-snug text-[var(--sm-ink)]">
                    <span className="text-[var(--sm-accent)] tabular-nums me-2">{allergen.number}.</span>
                    {allergen.name[lang]}
                  </h3>
                  <p className="mt-1 text-base leading-relaxed text-[var(--sm-ink-2)]">{allergen.description[lang]}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Note legali: spiegano anche gli asterischi che il locale usa nel menu, per questo non stanno in una scheda nascosta */}
        <section
          className="mt-8 rounded-2xl border border-[var(--sm-line)] bg-[var(--sm-surface)] px-5 py-6 md:px-8"
          aria-labelledby="sm-allergen-notes"
        >
          <h2 id="sm-allergen-notes" className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sm-accent)]">
            {text.regulationTitle}
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-[var(--sm-ink-2)]">
            <p>{text.legalText}</p>
            <p>
              <span className="font-semibold text-[var(--sm-ink)]">*</span> {text.frozenAtSource}
            </p>
            <p>
              <span className="font-semibold text-[var(--sm-ink)]">**</span> {text.blastChilled}
            </p>
            <p className="rounded-xl bg-[var(--sm-nav)] p-4 text-sm italic text-[var(--sm-ink)]">{text.contactText}</p>
          </div>
          {coverCharge && (
            <p className="mt-6 pt-5 border-t border-[var(--sm-line)] text-center text-base font-semibold text-[var(--sm-ink)]">
              {text.coverCharge}: {coverCharge}
            </p>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-[var(--sm-line)] bg-[var(--sm-nav)] p-6">
          <h2 className="sm-serif text-[1.375rem] leading-tight text-[var(--sm-heading)]">{text.questionsTitle}</h2>
          <p className="mt-2 text-base leading-relaxed text-[var(--sm-ink-2)]">{text.questionsText}</p>
        </section>

        <p className="mt-8 text-center text-base">
          <Link href={menuHref} className="font-medium text-[var(--sm-heading)] underline underline-offset-4 decoration-[var(--sm-dots)]">
            ← {text.menu}
          </Link>
        </p>
      </main>

      <Footer footerData={tenant.footer_data} restaurantName={name} logoUrl={tenant.logo_url || undefined} slug={tenant.slug} />
      <ScrollToTop />
    </div>
  );
}
