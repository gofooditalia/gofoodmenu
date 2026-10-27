/**
 * Pagina neutra al posto del menu quando il locale non ha il menu pubblico (abbonamento sospeso,
 * disdetto o mai attivato: isMenuPublic in src/lib/menu-visibility.ts). Per il cliente al tavolo:
 * niente piatti, niente riferimenti al pagamento, l'invito a chiedere in sala (anche per gli allergeni).
 * Usata da menu, versioni tradotte, allergeni e /info.
 */

import TenantLogo from '@/components/TenantLogo';

interface MenuUnavailableProps {
  name: string;
  logoUrl?: string | null;
}

export default function MenuUnavailable({ name, logoUrl }: MenuUnavailableProps) {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {logoUrl && (
          <TenantLogo src={logoUrl} alt={name} eager className="mx-auto mb-6 h-20 w-auto max-w-[200px] object-contain" />
        )}
        <h1 className="text-2xl font-semibold text-stone-900">Menu non disponibile</h1>
        <p className="mt-4 leading-relaxed">
          Il menu digitale di <strong className="font-semibold">{name}</strong> al momento non è consultabile.
        </p>
        <p className="mt-2 leading-relaxed">
          Per piatti, prezzi e allergeni chiedi pure al personale di sala.
        </p>
        <p lang="en" className="mt-8 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-600">
          The digital menu is currently unavailable. Please ask the staff for dishes, prices and allergen information.
        </p>
      </div>
    </main>
  );
}

/** Metadati della pagina neutra: fuori dai motori di ricerca. */
export function menuUnavailableMetadata(name: string) {
  return {
    title: `${name} - Menu non disponibile`,
    robots: { index: false, follow: false },
  };
}
