import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminOverview, isAdminEmail } from '@/lib/admin';
import { NewsletterSyncButton } from './NewsletterSyncButton';
import { TranslateMenuButton } from './TranslateMenuButton';

export const metadata: Metadata = {
    title: 'Admin - Go!Food Menù',
    robots: { index: false, follow: false },
};

// Dati sempre aggiornati: niente cache
export const dynamic = 'force-dynamic';
// La traduzione di un menu (pulsante "Traduci menu") fa più chiamate all'AI: serve più tempo del solito
export const maxDuration = 300;

const TIER_LABELS: Record<string, string> = { free: 'Free', basic: 'Basic', premium: 'Premium' };
const STATUS_LABELS: Record<string, string> = {
    active: 'Attivo',
    trialing: 'In prova',
    past_due: 'Pagamento in sospeso',
    incomplete: 'Incompleto',
    suspended: 'Sospeso',
    cancelled: 'Disdetto',
    canceled: 'Disdetto',
};

function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleDateString('it-IT') : '—';
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    );
}

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Per chi non è amministratore la pagina non esiste
    if (!user || !isAdminEmail(user.email)) notFound();

    const { tenants, totals, mrr } = await getAdminOverview();
    const toContact = tenants.filter((t) => t.flags.length > 0);

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Pannello Go!Food</h1>
                        <p className="text-gray-600">Ristoranti iscritti, abbonamenti e segnali da seguire.</p>
                    </div>
                    <NewsletterSyncButton />
                </div>

                <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Stat label="Iscritti" value={totals.total} />
                    <Stat label="Configurati" value={totals.configured} />
                    <Stat label="Paganti" value={totals.paying} />
                    <Stat label="In prova" value={totals.trialing} />
                    <Stat label="Nuovi questo mese" value={totals.newThisMonth} />
                    <Stat
                        label="Ricavi mensili (MRR)"
                        value={mrr ? `${mrr.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })} ${mrr.currency}` : '—'}
                        hint={mrr ? `${mrr.subscriptions} abbonamenti Stripe attivi` : 'Stripe non disponibile'}
                    />
                </section>

                {toContact.length > 0 && (
                    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <h2 className="font-bold text-amber-900 mb-2">Da ricontattare ({toContact.length})</h2>
                        <ul className="space-y-1 text-sm text-amber-900">
                            {toContact.map((t) => (
                                <li key={t.id}>
                                    <span className="font-semibold">{t.restaurantName}</span>: {t.flags.join(' · ')}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="rounded-xl border border-gray-200 bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-500">
                            <tr>
                                <th className="p-3">Ristorante</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Piano</th>
                                <th className="p-3">Stato</th>
                                <th className="p-3 text-right">Piatti</th>
                                <th className="p-3">Ultima modifica menu</th>
                                <th className="p-3">Iscritto il</th>
                                <th className="p-3">Lingue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((t) => (
                                <tr key={t.id} className="border-t border-gray-100">
                                    <td className="p-3 font-semibold text-gray-900">
                                        {t.slug ? (
                                            <a href={`/${t.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {t.restaurantName}
                                            </a>
                                        ) : t.restaurantName}
                                    </td>
                                    <td className="p-3 text-gray-600">{t.email ?? '—'}</td>
                                    <td className="p-3">{TIER_LABELS[t.tier] ?? t.tier}</td>
                                    <td className="p-3">{STATUS_LABELS[t.status] ?? t.status}</td>
                                    <td className="p-3 text-right">{t.dishCount}</td>
                                    <td className="p-3">{formatDate(t.lastMenuUpdate)}</td>
                                    <td className="p-3">{formatDate(t.createdAt)}</td>
                                    <td className="p-3">
                                        {t.slug && t.tier !== 'free' && t.dishCount > 0 ? (
                                            <TranslateMenuButton tenantId={t.id} restaurantName={t.restaurantName} />
                                        ) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </main>
    );
}
