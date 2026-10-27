/**
 * Menu pubblico tradotto: /{slug}/en, /fr, /de, /es, /pl, /pt, /zh, /ar (traduzioni salvate nel database, migrazione 039).
 * Esiste solo per le lingue attive del locale (tenants.menu_languages); le altre danno 404.
 * Il middleware ci manda il cliente in base alla lingua del telefono quando apre /{slug} dal QR.
 */

import { notFound } from 'next/navigation';
import { MenuPage, buildMenuMetadata, buildMenuViewport, isTranslatedLang } from '../menu-page';

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ slug: string; lang: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug, lang } = await params;
  if (!isTranslatedLang(lang)) notFound();
  return <MenuPage slug={slug} lang={lang} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, lang } = await params;
  if (!isTranslatedLang(lang)) return { title: 'Ristorante non trovato' };
  return buildMenuMetadata(slug, lang);
}

export async function generateViewport({ params }: PageProps) {
  const { slug } = await params;
  return buildMenuViewport(slug);
}
