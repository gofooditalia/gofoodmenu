'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Le pagine in inglese (per ora solo la landing /en) mostrano il banner in inglese
const TEXT = {
    it: { region: 'Informativa sui cookie', intro: 'Questo sito utilizza cookie per migliorare la tua esperienza. Continuando a navigare accetti la nostra', and: 'e', accept: 'Accetto' },
    en: { region: 'Cookie notice', intro: 'This site uses cookies to improve your experience. By continuing to browse you accept our', and: 'and', accept: 'I agree' },
};

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();
    const lang = pathname === '/en' || pathname?.startsWith('/en/') ? 'en' : 'it';
    const t = TEXT[lang];

    useEffect(() => {
        // Check if consent is already given
        const consent = localStorage.getItem('cookie_consent_accepted');
        if (!consent) {
            // Small delay to make the entrance smoother
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent_accepted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div role="region" lang={lang} aria-label={t.region} className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="text-gray-600 text-sm md:text-base text-center md:text-left">
                    <p>
                        {t.intro}{' '}
                        <a
                            href="https://www.iubenda.com/privacy-policy/23100081/cookie-policy"
                            className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe font-semibold text-orange-700 hover:text-orange-800 underline decoration-orange-300 decoration-2 underline-offset-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Cookie Policy
                        </a>{' '}
                        {t.and}{' '}
                        <a
                            href="https://www.iubenda.com/privacy-policy/23100081"
                            className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe font-semibold text-orange-700 hover:text-orange-800 underline decoration-orange-300 decoration-2 underline-offset-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>.
                    </p>
                </div>

                <button
                    onClick={handleAccept}
                    className="whitespace-nowrap bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    {t.accept}
                </button>
            </div>
        </div>
    );
}
