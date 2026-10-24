import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

const title = 'Go!Food Menù - Digital Menus for Restaurants';
const description =
  'A digital table menu for your restaurant: EU allergen information, gluten-free filter, AI import from a photo of your menu and a QR code for your tables. €19.90 a month.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: '/en',
    languages: { it: '/', en: '/en', 'x-default': '/' },
  },
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'en_GB',
    url: '/en',
  },
};

export default function Page() {
  return <LandingPage lang="en" />;
}
