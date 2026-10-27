'use client';

import Image from 'next/image';
import { ALLERGEN_LIST, ALLERGEN_PAGE } from '@/lib/allergens-i18n';
import type { MenuLang } from '@/lib/menu-languages';

interface AllergensLegalProps {
  lang: MenuLang;
  logoUrl?: string; // Optional restaurant logo
  coverChargeValue?: number; // Dynamic value from DB
}

const LOCALES: Record<MenuLang, string> = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pl: 'pl-PL', pt: 'pt-PT' };

export default function AllergensLegal({ lang, logoUrl, coverChargeValue }: AllergensLegalProps) {
  const text = ALLERGEN_PAGE[lang];

  // Format currency
  const formattedCoverCharge = new Intl.NumberFormat(LOCALES[lang], {
    style: 'currency',
    currency: 'EUR'
  }).format(coverChargeValue || 0);

  return (
    <div className="bg-[var(--tenant-surface,#FFFFFF)] rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header con logo ufficiale */}
      <div className="bg-gradient-to-r from-[var(--tenant-primary,#8B0000)] to-[var(--tenant-primary,#8B0000)] text-center py-8 px-6">
        <div className="inline-block bg-white/10 backdrop-blur-sm border-2 border-[var(--tenant-secondary,#D4AF37)] rounded-lg px-8 py-6">
          <Image
            src={logoUrl || '/icon.svg'}
            alt="Restaurant Logo"
            width={60}
            height={60}
            className="h-16 w-auto mx-auto mb-2 object-contain"
          />
          <p className="text-sm text-[var(--tenant-on-primary,#FFFFFF)] opacity-90 uppercase tracking-wider">
            {text.digitalMenu}
          </p>
        </div>
      </div>

      {/* Contenuto */}
      <div className="p-6 md:p-8">
        {/* Titolo principale */}
        <h2 className="text-2xl md:text-3xl theme-heading font-bold text-center text-[var(--tenant-text,#171717)] mb-6">
          {text.legalTitle}
        </h2>

        {/* Intro */}
        <p className="text-sm md:text-base text-[var(--tenant-text-secondary,#4B5563)] mb-6 leading-relaxed">
          {text.legalText}
        </p>

        {/* Lista numerata allergeni */}
        <ol className="space-y-3 mb-8">
          {ALLERGEN_LIST.map((allergen) => (
            <li
              key={allergen.id}
              className="flex gap-3 text-sm md:text-base text-[var(--tenant-text,#171717)]"
            >
              <span className="font-bold text-[var(--tenant-primary,#8B0000)] min-w-[2rem]">
                {allergen.number}.
              </span>
              <span className="leading-relaxed">{allergen.name[lang]}</span>
            </li>
          ))}
        </ol>

        {/* Regolamento */}
        <div className="border-t-2 border-[var(--tenant-secondary,#D4AF37)] pt-6 space-y-4">
          <h3 className="text-lg font-bold text-center text-[var(--tenant-text,#171717)]">
            {text.regulationTitle}
          </h3>

          <p className="text-sm text-[var(--tenant-text-secondary,#4B5563)] leading-relaxed">
            <span className="font-semibold">*</span> {text.frozenAtSource}
          </p>

          <p className="text-sm text-[var(--tenant-text-secondary,#4B5563)] leading-relaxed">
            <span className="font-semibold">**</span> {text.blastChilled}
          </p>

          <div className="bg-[var(--tenant-background,#FFF8E7)] rounded-lg p-4 mt-6">
            <p className="text-xs md:text-sm text-[var(--tenant-text,#171717)] italic leading-relaxed">
              {text.contactText}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[var(--tenant-text,#171717)] text-[var(--tenant-surface,#FFFFFF)] text-center py-4">
        <p className="text-sm md:text-base font-medium">
          {text.coverCharge}: {formattedCoverCharge}
        </p>
      </div>
    </div>
  );
}

