/**
 * Pagina allergeni nelle lingue del menu tradotto: /{slug}/en/allergeni, /fr, /de, /es.
 * Solo per le lingue attive del locale (tenants.menu_languages); le altre danno 404.
 */

import { notFound } from 'next/navigation';
import { isTranslatedLang } from '@/lib/menu-languages';
import { AllergensPage, buildAllergensMetadata } from '../../allergens-page';

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
  return <AllergensPage slug={slug} lang={lang} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, lang } = await params;
  if (!isTranslatedLang(lang)) return { title: 'Ristorante non trovato' };
  return buildAllergensMetadata(slug, lang);
}
