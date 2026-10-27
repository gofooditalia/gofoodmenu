/**
 * Quando il menu pubblico di un locale è visibile (menu, lingue, allergeni, /info, sitemap).
 * Abbonamento premium attivo, oppure pagamento non riuscito ma ancora nel periodo di tolleranza
 * (tenants.grace_until, migrazione 040). Negli altri casi le pagine mostrano MenuUnavailable.
 */

export interface MenuVisibilityFields {
  subscription_tier?: string | null;
  subscription_status?: string | null;
  grace_until?: string | null;
}

export function isMenuPublic(tenant: MenuVisibilityFields, now: Date = new Date()): boolean {
  if (tenant.subscription_tier === 'free') return false;
  if (tenant.subscription_status === 'active') return true;
  if (tenant.subscription_status === 'past_due' && tenant.grace_until) {
    return new Date(tenant.grace_until).getTime() > now.getTime();
  }
  return false;
}

/**
 * Ultimo giorno intero con il menu visibile durante la tolleranza (il giorno prima della scadenza,
 * che cade di primo mattino), es. "lunedì 3 novembre". Per email e pannello del ristoratore.
 */
export function lastVisibleDay(graceUntil: string): string {
  return new Date(new Date(graceUntil).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Rome',
  });
}
