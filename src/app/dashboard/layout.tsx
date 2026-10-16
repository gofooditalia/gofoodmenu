import { Metadata } from 'next';
import DashboardLayoutClient from './DashboardLayoutClient';

export const metadata: Metadata = {
    title: 'Dashboard - Go!Food Menù',
    description: 'Gestisci il tuo menu digitale',
    // La PWA è solo per i ristoratori: il manifest è collegato alle sole pagine della
    // dashboard, così Chrome non propone l'installazione ai clienti che aprono un menu.
    // Il nome del file non deve iniziare con /dashboard, altrimenti il middleware lo
    // reindirizza al login quando Chrome lo scarica senza cookie.
    // background_color colora anche la barra di navigazione di Android (Android 15+) e ci
    // disegna sopra tasti chiari: serve un tono medio come l'arancio del logo, non il crema.
    manifest: '/app.webmanifest',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
