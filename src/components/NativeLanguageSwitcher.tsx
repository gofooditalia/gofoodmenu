'use client';

/**
 * Selettore lingua per i menu con traduzioni salvate (migrazione 039): ogni lingua è una pagina vera
 * (/{slug}, /{slug}/en…), niente Google Translate. La scelta finisce nel cookie menu_lang, che il
 * middleware rispetta alla visita successiva più della lingua del telefono.
 * Stesso aspetto di LanguageSwitcher (pillola con l'italiano a sinistra e le altre lingue nel menu).
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MENU_LANG_COOKIE, MENU_LANG_LABELS, menuLangPath, menuLangTag, type MenuLang } from '@/lib/menu-languages';
import { useMenuStrings } from '@/lib/menu-i18n';

interface NativeLanguageSwitcherProps {
  slug: string;
  current: MenuLang;
  languages: MenuLang[];
  compact?: boolean;
  pathSuffix?: string;
}

function rememberChoice(lang: MenuLang) {
  document.cookie = `${MENU_LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  // Una vecchia scelta fatta con Google Translate non deve ritradurre la pagina già tradotta
  document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
}

export default function NativeLanguageSwitcher({ slug, current, languages, compact = false, pathSuffix = '' }: NativeLanguageSwitcherProps) {
  const strings = useMenuStrings();
  const href = (lang: MenuLang) => menuLangPath(slug, lang, pathSuffix);
  const others = languages.filter((l) => l !== 'it');
  const shown = current === 'it' ? (others.includes('en') ? 'en' : others[0]) : current;

  const activeStyle = {
    backgroundColor: 'var(--tenant-primary, #8B0000)',
    color: 'var(--tenant-on-primary, #FFFFFF)',
  };
  const idleClass = 'text-[var(--tenant-text-secondary,#4B5563)] hover:text-[var(--tenant-text,#111827)] active:bg-[color-mix(in_srgb,var(--tenant-text,#171717)_10%,transparent)]';

  return (
    <nav aria-label={strings.languageLabel} className="relative z-50">
      <div className={`flex items-center gap-1 bg-[color-mix(in_srgb,var(--tenant-surface,#FFFFFF)_90%,transparent)] backdrop-blur-sm rounded-full px-2 py-1.5 shadow-md border border-[color-mix(in_srgb,var(--tenant-text,#171717)_15%,transparent)] ${compact ? 'scale-90' : ''}`}>
        <a
          href={href('it')}
          hrefLang="it"
          lang="it"
          onClick={() => rememberChoice('it')}
          aria-current={current === 'it' ? 'page' : undefined}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all touch-manipulation flex items-center gap-1.5 notranslate ${current === 'it' ? 'shadow-sm' : idleClass}`}
          style={current === 'it' ? activeStyle : undefined}
        >
          <span className="text-base" aria-hidden="true">{MENU_LANG_LABELS.it.flag}</span>
          <span>IT</span>
          <span className="sr-only">{MENU_LANG_LABELS.it.label}</span>
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all touch-manipulation flex items-center gap-1.5 notranslate ${current !== 'it' ? 'shadow-sm' : idleClass}`}
              style={current !== 'it' ? activeStyle : undefined}
              aria-label={`${shown.toUpperCase()}, ${strings.languageLabel}`}
            >
              <span className="text-base" aria-hidden="true">{MENU_LANG_LABELS[shown].flag}</span>
              <span>{shown.toUpperCase()}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {others.map((lang) => (
              <DropdownMenuItem key={lang} asChild className="cursor-pointer gap-2">
                <a
                  href={href(lang)}
                  hrefLang={menuLangTag(lang)}
                  lang={menuLangTag(lang)}
                  onClick={() => rememberChoice(lang)}
                  aria-current={current === lang ? 'page' : undefined}
                >
                  <span className="text-lg notranslate" aria-hidden="true">{MENU_LANG_LABELS[lang].flag}</span>
                  <span className="notranslate">{MENU_LANG_LABELS[lang].label}</span>
                  {current === lang && <span className="ms-auto text-xs" aria-hidden="true">✓</span>}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
