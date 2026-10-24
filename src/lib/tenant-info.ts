/**
 * Scheda contatti del locale: /{slug}/info (link e contatti, nient'altro; il QR resta sul menu).
 * Pensata per la bio di Instagram/TikTok, la scheda Google e i biglietti da visita.
 */

// In prova solo su questi locali; gli altri ricevono 404. Togliere il controllo quando la si apre a tutti.
export const INFO_PAGE_SLUGS = ['magnaromatrattoria'];

export function hasInfoPage(slug: string) {
  return INFO_PAGE_SLUGS.includes(slug);
}

export interface PhoneNumber {
  /** Come l'ha scritto il ristoratore */
  label: string;
  /** Indirizzo tel: con prefisso internazionale */
  href: string;
}

/**
 * Numeri di telefono da un campo libero: "091 7283177 - 3922151234" → due numeri.
 * Le parti con lettere o troppo corte (es. un indirizzo scritto per sbaglio nel campo) vengono saltate.
 */
export function parsePhoneNumbers(raw: string | null | undefined): PhoneNumber[] {
  if (!raw) return [];
  return raw
    .split(/\s[-–]\s|[\/,;|]|\se\s/)
    .map((part) => part.trim())
    .filter((part) => part && !/[a-zà-ú]/i.test(part))
    .flatMap((part) => {
      const digits = part.replace(/\D/g, '');
      if (digits.length < 6 || digits.length > 15) return [];
      const international = part.startsWith('+') || part.startsWith('00')
        ? digits.replace(/^00/, '')
        : `39${digits}`;
      return [{ label: part, href: `tel:+${international}` }];
    });
}

/** Indicazioni stradali su Google Maps (sul telefono apre l'app). */
export function mapsUrl(address: string, city?: string | null) {
  const query = [address, city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  tripadvisor: 'TripAdvisor',
  website: 'Sito web',
};

export function socialLabel(platform: string) {
  return SOCIAL_LABELS[platform] ?? 'Link';
}

export function absoluteUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
