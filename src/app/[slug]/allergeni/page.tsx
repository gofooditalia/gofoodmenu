import { AllergensPage, buildAllergensMetadata } from '../allergens-page';

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
  return <AllergensPage slug={slug} lang="it" />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return buildAllergensMetadata(slug, 'it');
}
