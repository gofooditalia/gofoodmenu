'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AllergensList from '@/components/AllergensList';
import AllergensLegal from '@/components/AllergensLegal';
import { Tenant } from '@/types/menu';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { ThemeWrapper } from '@/components/theme/ThemeWrapper';
import { ThemeConfig } from '@/lib/theme-engine/types';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MenuLangProvider } from '@/lib/menu-i18n';
import { ALLERGEN_PAGE } from '@/lib/allergens-i18n';
import { menuLangPath, type MenuLang } from '@/lib/menu-languages';

type TabType = 'list' | 'legal';

interface AllergensPageClientProps {
    tenant: Tenant;
    initialTheme?: ThemeConfig;
    // Lingua della pagina (/{slug}/allergeni o /{slug}/{lingua}/allergeni) e lingue del menu tradotto del locale
    lang: MenuLang;
    languages: MenuLang[];
}

export default function AllergensPageClient({ tenant, initialTheme, lang, languages }: AllergensPageClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>('list');
    const text = ALLERGEN_PAGE[lang];

    return (
        <MenuLangProvider value={lang}>
            <LanguageProvider initialLanguage={lang}>
                <ThemeProvider initialTheme={initialTheme}>
                    <ThemeWrapper lang={lang} className="min-h-screen flex flex-col font-sans transition-colors duration-300">
                        <Header
                            restaurantName={tenant.restaurant_name}
                            logoUrl={tenant.logo_url || undefined}
                            slug={tenant.slug}
                            menuLang={lang}
                            menuLanguages={languages}
                            pathSuffix="/allergeni"
                        />

                        <main className="flex-1 container mx-auto px-4 pb-8 pt-[88px] max-w-7xl">
                            {/* Breadcrumb */}
                            <nav className="mb-6" aria-label="Breadcrumb">
                                <ol className="flex items-center gap-2 text-sm text-[var(--tenant-text-secondary,#4B5563)]">
                                    <li>
                                        <Link
                                            href={menuLangPath(tenant.slug, lang)}
                                            className="hover:text-[var(--tenant-primary,#8B0000)] transition-colors flex items-center gap-1"
                                        >
                                            <span>🏠</span>
                                            {text.menu}
                                        </Link>
                                    </li>
                                    <li className="text-gray-400">/</li>
                                    <li className="text-[var(--tenant-primary,#8B0000)] font-medium">
                                        {text.allergens}
                                    </li>
                                </ol>
                            </nav>

                            {/* Hero Section */}
                            <section className="text-center mb-8 md:mb-12">
                                <div className="inline-block mb-4">
                                    <span className="text-5xl md:text-6xl">🛡️</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl theme-heading font-bold text-[var(--tenant-primary,#8B0000)] mb-4 leading-tight">
                                    {text.title}
                                </h1>
                                <p className="text-base md:text-lg text-[var(--tenant-text-secondary,#4B5563)] max-w-3xl mx-auto leading-relaxed px-4">
                                    {text.subtitle}
                                </p>
                            </section>

                            {/* Tabs Navigation */}
                            <div className="flex justify-center mb-8">
                                <div className="inline-flex rounded-lg bg-[var(--tenant-surface,#FFFFFF)] shadow-md border border-gray-200 p-1">
                                    <button
                                        onClick={() => setActiveTab('list')}
                                        className={`px-6 py-3 rounded-md text-sm md:text-base font-medium transition-all ${activeTab === 'list'
                                            ? 'bg-[var(--tenant-primary,#8B0000)] text-[var(--tenant-on-primary,#FFFFFF)] shadow-lg'
                                            : 'text-[var(--tenant-text,#171717)] hover:bg-[var(--tenant-text,#171717)] hover:bg-opacity-10'
                                            }`}
                                    >
                                        {text.tabList}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('legal')}
                                        className={`px-6 py-3 rounded-md text-sm md:text-base font-medium transition-all ${activeTab === 'legal'
                                            ? 'bg-[var(--tenant-primary,#8B0000)] text-[var(--tenant-on-primary,#FFFFFF)] shadow-lg'
                                            : 'text-[var(--tenant-text,#171717)] hover:bg-[var(--tenant-text,#171717)] hover:bg-opacity-10'
                                            }`}
                                    >
                                        {text.tabLegal}
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="mb-12">
                                {activeTab === 'list' ? (
                                    <div className="animate-fadeIn">
                                        <div className="text-center mb-6">
                                            <h2 className="text-2xl md:text-3xl theme-heading font-bold text-[var(--tenant-text,#171717)] mb-2">
                                                {text.listTitle}
                                            </h2>
                                            <p className="text-sm md:text-base text-[var(--tenant-text-secondary,#4B5563)]">
                                                {text.listSubtitle}
                                            </p>
                                            {text.translationNote && (
                                                <p className="mt-2 text-xs md:text-sm text-[var(--tenant-text-secondary,#4B5563)]">
                                                    {text.translationNote}
                                                </p>
                                            )}
                                        </div>
                                        <AllergensList lang={lang} />
                                    </div>
                                ) : (
                                    <div className="animate-fadeIn">
                                        <AllergensLegal lang={lang} logoUrl={tenant.logo_url || undefined} coverChargeValue={tenant.cover_charge} />
                                    </div>
                                )}
                            </div>

                            {/* Info Box */}
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-[var(--tenant-primary,#8B0000)] rounded-2xl p-6 md:p-8 text-[var(--tenant-on-primary,#FFFFFF)] shadow-xl">
                                    <div className="flex items-start gap-4">
                                        <span className="text-3xl md:text-4xl flex-shrink-0">💬</span>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold mb-2">
                                                {text.questionsTitle}
                                            </h3>
                                            <p className="text-sm md:text-base opacity-90 leading-relaxed">
                                                {text.questionsText}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>

                        <Footer
                            footerData={tenant.footer_data}
                            restaurantName={tenant.restaurant_name}
                            logoUrl={tenant.logo_url || undefined}
                            slug={tenant.slug}
                        />
                    </ThemeWrapper>
                </ThemeProvider>
            </LanguageProvider>
        </MenuLangProvider>
    );
}
