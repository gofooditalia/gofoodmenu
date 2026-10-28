'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dish } from '@/types/menu';
import { useTranslation } from '@/hooks/useTranslation';
import { parseIngredients } from '@/utils/ingredientParser';
import { useGlutenFilter } from '@/contexts/GlutenFilterContext';
import { Leaf, Home, Snowflake } from 'lucide-react';
import { useMenuLang, useMenuStrings } from '@/lib/menu-i18n';
import { menuLangPath } from '@/lib/menu-languages';
import { dishThumbUrl } from '@/lib/dish-thumbs';

interface DishCardProps {
  dish: Dish & {
    is_seasonal?: boolean;
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
  };
  tenantSlug: string;
  // Le prime card visibili all'apertura: foto scaricata subito invece che in lazy loading
  priority?: boolean;
  // false: piatto solo testo, senza riquadro foto (tema con dishPhotos 'hide')
  showPhoto?: boolean;
}

export default function DishCard({ dish, tenantSlug, priority = false, showPhoto = true }: DishCardProps) {
  const { isGlutenFree } = useGlutenFilter();
  // Etichette nella lingua del menu (/{slug}/{lingua}); fuori dal menu pubblico italiano
  const strings = useMenuStrings();
  const menuLang = useMenuLang();
  const [imageError, setImageError] = useState(false);
  const placeholderImage = '/no-image.svg';

  // Verifica se il piatto contiene glutine
  const containsGluten = dish.allergens?.includes('glutine') || false;

  // Il piatto è disabilitato se il filtro glutine è attivo E contiene glutine
  const isDisabled = isGlutenFree && containsGluten;

  // Piatti stagionali che mostrano "fuori stagione" invece dell'immagine
  const isSeasonalDish = dish.is_seasonal || false;

  // Determine if we should show placeholder
  const isLegacyPlaceholder = dish.image?.includes('icon.svg') || dish.image?.includes('favicon.svg');
  const showPlaceholder = !dish.image || imageError || isLegacyPlaceholder;

  // Foto su Supabase: miniatura scaricata direttamente, senza /_next/image. Se manca si torna alla foto
  // ottimizzata da Vercel (foto caricate prima delle miniature o fuori da Supabase)
  const thumbUrl = dishThumbUrl(dish.image);
  const [thumbError, setThumbError] = useState(false);
  const useThumb = !showPlaceholder && !!thumbUrl && !thumbError;

  return (
    <div className={`bg-[var(--tenant-surface,#FFFFFF)] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${isDisabled
      ? 'opacity-50 pointer-events-none'
      : 'hover:shadow-2xl hover:-translate-y-1'
      }`}>
      {showPhoto && (
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--tenant-background,#FFF8E7)]">
        {/* Placeholder "Fuori stagione" per piatti stagionali */}
        {isSeasonalDish ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[var(--tenant-background,#FFF8E7)]">
            <div className="text-center max-w-xs">
              <div className="text-7xl mb-6 opacity-40">🌿</div>
              <div className="text-xl md:text-2xl theme-heading font-bold text-[var(--tenant-primary,#8B0000)] mb-3">
                {strings.outOfSeason}
              </div>
              <div className="text-sm md:text-base text-[var(--tenant-text-secondary,#4B5563)] leading-relaxed">
                {strings.seasonalOnly}
              </div>
            </div>
          </div>
        ) : (
          <Image
            src={showPlaceholder ? placeholderImage : useThumb ? thumbUrl! : dish.image!}
            alt={dish.name}
            fill
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 50vw, 33vw"
            className={`
                ${showPlaceholder ? 'object-contain p-12 opacity-40 grayscale' : 'object-cover opacity-100'} 
                hover:scale-105 transition-transform duration-500
              `}
            unoptimized={useThumb}
            preload={priority}
            onError={() => (useThumb ? setThumbError(true) : setImageError(true))}
          />
        )}
        {/* Price badge */}
        <div
          className="absolute top-4 end-4 text-[var(--tenant-price,#171717)] px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: 'var(--tenant-price-bg, var(--tenant-secondary, #D4AF37))' }}
        >
          <span className="font-bold text-base" dir="ltr">€{dish.price}</span>
        </div>

        {/* Badge glutine quando filtro attivo */}
        {isDisabled && (
          <div className="absolute top-4 start-4 bg-red-600 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <span className="font-semibold text-xs flex items-center gap-1">
              <span>🌾</span>
              {strings.containsGluten}
            </span>
          </div>
        )}

        {/* Badge Fatto in casa e Surgelato */}
        <div className="absolute top-4 start-4 flex flex-col gap-2">
          {!isDisabled && dish.is_homemade && (
            <div
              className="px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: 'var(--tenant-badge-bg, var(--tenant-primary, #8B0000))',
                color: 'var(--tenant-badge-text, #FFFFFF)'
              }}
            >
              <span className="font-semibold text-xs flex items-center gap-1">
                <span>🏠</span>
                {strings.homemade}
              </span>
            </div>
          )}
          {!isDisabled && dish.is_frozen && (
            <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              <span className="font-semibold text-xs flex items-center gap-1">
                <span>❄️</span>
                {strings.frozen}
              </span>
            </div>
          )}
        </div>
      </div>
      )}

      <div className="p-4 md:p-5">
        {showPhoto ? (
          <h3 className="text-lg md:text-xl lg:text-2xl theme-heading font-bold text-[var(--tenant-text,#171717)] mb-2 leading-tight">
            {dish.name}
          </h3>
        ) : (
          // Senza foto il prezzo sta accanto al nome, come in una carta stampata
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg md:text-xl lg:text-2xl theme-heading font-bold text-[var(--tenant-text,#171717)] leading-tight">
              {dish.name}
            </h3>
            <span
              className="shrink-0 text-[var(--tenant-price,#171717)] px-3 py-1 rounded-full font-bold text-base"
              style={{ backgroundColor: 'var(--tenant-price-bg, var(--tenant-secondary, #D4AF37))' }}
              dir="ltr"
            >
              €{dish.price}
            </span>
          </div>
        )}

        <div className={`text-[var(--tenant-text-secondary,#4B5563)] text-sm md:text-base leading-relaxed mb-3 ${showPhoto ? 'min-h-[3em]' : ''}`}>
          {parseIngredients(dish.description)}
        </div>

        {/* Diet & Feature Badges */}
        <div className={`flex flex-wrap gap-2 mb-3 ${showPhoto ? '' : 'empty:hidden'}`}>
          {/* Senza foto, gli avvisi che stavano sull'immagine diventano etichette */}
          {!showPhoto && isSeasonalDish && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
              🌿 {strings.outOfSeason}
            </span>
          )}
          {!showPhoto && isDisabled && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
              🌾 {strings.containsGluten}
            </span>
          )}
          {dish.is_vegetarian && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Leaf className="w-3 h-3" /> {strings.vegetarian}
            </span>
          )}
          {dish.is_vegan && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
              <Leaf className="w-3 h-3" /> {strings.vegan}
            </span>
          )}

          {dish.is_homemade && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
              <Home className="w-3 h-3" /> {strings.homemade}
            </span>
          )}
          {dish.is_frozen && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <Snowflake className="w-3 h-3" /> {strings.frozen}
            </span>
          )}
        </div>

        {dish.allergens && dish.allergens.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {dish.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--tenant-accent, #d97706) 10%, transparent)',
                    color: 'var(--tenant-primary, #8B0000)',
                    borderColor: 'color-mix(in srgb, var(--tenant-accent, #d97706) 30%, transparent)'
                  }}
                >
                  {strings.allergenName(allergen)}
                </span>
              ))}
            </div>
            <Link
              href={menuLangPath(tenantSlug, menuLang, '/allergeni')}
              prefetch={false}
              className="inline-flex items-center gap-1.5 text-sm hover:brightness-75 font-medium transition-all"
              style={{ color: 'var(--tenant-primary, #8B0000)' }}
            >
              <span>ℹ️</span>
              {strings.allergenInfo}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

