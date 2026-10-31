'use client';

/**
 * Selettore lingua del menu Sunset: un solo pulsante (bandiera, codice e freccia) che apre la tendina con tutte
 * le lingue del menu. Occupa meno della pillola di NativeLanguageSwitcher e lascia spazio al filtro senza glutine.
 * Stesso comportamento: ogni lingua è una pagina vera (/{slug}/{lingua}) e la scelta resta nel cookie menu_lang.
 */

import { ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { rememberChoice } from '@/components/NativeLanguageSwitcher';
import { MENU_LANG_LABELS, menuLangPath, menuLangTag, type MenuLang } from '@/lib/menu-languages';
import { useMenuStrings } from '@/lib/menu-i18n';

// pathSuffix: pagina oltre al menu (es. '/allergeni'), il selettore porta alla stessa pagina nell'altra lingua
export function SunsetLanguageMenu({ slug, current, languages, pathSuffix = '' }: { slug: string; current: MenuLang; languages: MenuLang[]; pathSuffix?: string }) {
  const strings = useMenuStrings();
  const currentLabel = MENU_LANG_LABELS[current];

  return (
    // modal={false}: il resto della pagina resta leggibile ai lettori di schermo mentre la tendina è aperta
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${strings.languageLabel}: ${currentLabel.label}`}
          className="flex items-center gap-1.5 h-9 ps-2.5 pe-2 rounded-full border border-[var(--sm-pill-border)] text-sm font-semibold text-[var(--sm-ink)] touch-manipulation notranslate"
        >
          <span className="text-base leading-none" aria-hidden="true">{currentLabel.flag}</span>
          <span aria-hidden="true">{current.toUpperCase()}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      {/* La tendina sta fuori dal menu (portal): la classe sunset-menu le dà i colori del tema chiaro o scuro */}
      <DropdownMenuContent align="end" className="sunset-menu min-w-44 border-[var(--sm-line)] rounded-xl p-1 shadow-lg">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            asChild
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2.5 text-base text-[var(--sm-ink)] focus:bg-[var(--sm-highlight)] focus:text-[var(--sm-ink)]"
          >
            <a
              href={menuLangPath(slug, lang, pathSuffix)}
              hrefLang={menuLangTag(lang)}
              lang={menuLangTag(lang)}
              onClick={() => rememberChoice(lang)}
              aria-current={current === lang ? 'page' : undefined}
              className="notranslate"
            >
              <span className="text-lg leading-none" aria-hidden="true">{MENU_LANG_LABELS[lang].flag}</span>
              <span className={current === lang ? 'font-semibold' : ''}>{MENU_LANG_LABELS[lang].label}</span>
              {current === lang && <Check className="ms-auto w-4 h-4 text-[var(--sm-accent)]" aria-hidden="true" />}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
