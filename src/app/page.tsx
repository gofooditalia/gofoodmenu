import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

// Versione inglese in /en: i motori di ricerca le collegano tra loro
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: { it: '/', en: '/en', 'x-default': '/' },
  },
};

export default function Page() {
  return <LandingPage lang="it" />;
}
