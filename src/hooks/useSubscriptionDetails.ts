import { useQuery } from '@tanstack/react-query';

/** Dati dell'abbonamento letti da Stripe (/api/stripe/subscription-details). Date in secondi Unix. */
export interface SubscriptionDetails {
    status?: string;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
    cancel_at?: number | null;
}

/**
 * Abbonamento Stripe del locale, condiviso tra pagina Account e avviso di disdetta nel pannello.
 * Solo per i locali premium: il piano free non ha abbonamento.
 */
export function useSubscriptionDetails(enabled: boolean) {
    return useQuery({
        queryKey: ['subscription-details'],
        queryFn: async (): Promise<SubscriptionDetails | null> => {
            const res = await fetch('/api/stripe/subscription-details');
            if (!res.ok) throw new Error('subscription-details failed');
            const data = await res.json();
            return data?.status ? data : null;
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });
}

/** Data in cui l'abbonamento disdetto termina (e il menu smette di essere visibile), o null se non è disdetto. */
export function cancellationEnd(details: SubscriptionDetails | null | undefined): number | null {
    if (!details) return null;
    if (details.cancel_at) return details.cancel_at;
    if (details.cancel_at_period_end && details.current_period_end) return details.current_period_end;
    return null;
}

/** Abbonamento ancora in corso che si rinnoverà: finché è così "Elimina Account" è bloccato (vedi deleteAccount). */
export function isRenewing(details: SubscriptionDetails | null | undefined): boolean {
    return Boolean(details && ['active', 'trialing', 'past_due', 'unpaid'].includes(details.status ?? '') && !cancellationEnd(details));
}

/** Es. "27 novembre 2026" (ora italiana). */
export function formatBillingDate(unixSeconds: number): string {
    return new Date(unixSeconds * 1000).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Rome',
    });
}
