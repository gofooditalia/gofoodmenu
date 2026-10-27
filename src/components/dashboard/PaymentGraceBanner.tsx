import Link from 'next/link';
import { isMenuPublic, lastVisibleDay } from '@/lib/menu-visibility';

interface PaymentGraceBannerProps {
    graceUntil?: string | null;
}

// Pagamento non riuscito (subscription_status 'past_due'): durante la tolleranza il menu resta online
// fino alla data indicata, poi i clienti vedono la pagina neutra (src/lib/billing-grace.ts).
export default function PaymentGraceBanner({ graceUntil }: PaymentGraceBannerProps) {
    const online = isMenuPublic({ subscription_status: 'past_due', grace_until: graceUntil });

    return (
        <div role="alert" className={`mb-6 rounded-xl border px-4 py-3 ${online ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-red-300 bg-red-50 text-red-900'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="font-bold">
                        {online ? 'Pagamento non riuscito' : 'Menu sospeso: pagamento non riuscito'}
                    </p>
                    <p className="text-sm mt-0.5">
                        {online && graceUntil
                            ? `Il menu resta visibile ai clienti fino a ${lastVisibleDay(graceUntil)}. Aggiorna la carta per evitare la sospensione.`
                            : 'I clienti vedono una pagina che li invita a chiedere al personale. Aggiorna la carta: appena il pagamento va a buon fine il menu torna visibile.'}
                    </p>
                </div>
                <Link
                    href="/dashboard/account"
                    className="whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-bold text-white hover:bg-gray-800"
                >
                    Aggiorna pagamento
                </Link>
            </div>
        </div>
    );
}
