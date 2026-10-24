/**
 * Menu pubblico in italiano: /{slug}. Le versioni tradotte stanno in ./[lang]/page.tsx;
 * dati, pagina e metadati sono in ./menu-page.tsx.
 */

import { MenuPage, buildMenuMetadata, buildMenuViewport } from './menu-page';

// Cached per slug (ISR). Purged on every menu change via revalidatePublicMenu
// (src/app/actions/revalidate-menu.ts); the time-based revalidate is only a safety net.
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <MenuPage slug={slug} lang="it" />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return buildMenuMetadata(slug, 'it');
}

export async function generateViewport({ params }: PageProps) {
  const { slug } = await params;
  return buildMenuViewport(slug);
}
