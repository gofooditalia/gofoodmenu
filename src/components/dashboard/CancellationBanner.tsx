'use client';

import Link from 'next/link';
import { cancellationEnd, formatBillingDate, useSubscriptionDetails } from '@/hooks/useSubscriptionDetails';

// Disdetta programmata dal portale Stripe: l'abbonamento resta attivo fino a fine periodo, poi il locale
// passa al piano free e i clienti vedono la pagina neutra. Fino ad allora si può riattivare.
export default function CancellationBanner() {
    const { data } = useSubscriptionDetails(true);
    const endsAt = cancellationEnd(data);
    if (!endsAt) return null;

    return (
        <div role="status" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="font-bold">Abbonamento disdetto</p>
                    <p className="text-sm mt-0.5">
                        Il menu resta visibile ai clienti fino al {formatBillingDate(endsAt)}. Hai cambiato idea? Puoi riattivarlo prima di quella data.
                    </p>
                </div>
                <Link
                    href="/dashboard/account"
                    className="whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-bold text-white hover:bg-gray-800"
                >
                    Riattiva abbonamento
                </Link>
            </div>
        </div>
    );
}
