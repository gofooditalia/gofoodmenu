import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlutenFilterProvider } from "@/contexts/GlutenFilterContext";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Script from 'next/script';
import QueryProvider from "@/components/providers/QueryProvider";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Go!Food Menù - Il Menu Digitale per Ristoranti",
    template: "%s | Go!Food Menù"
  },
  description: "La soluzione completa per il tuo ristorante: menu digitale multilingua, gestione allergeni e setup immediato. Il cliente scansiona il QR e consulta il menu. Inizia oggi.",
  keywords: "menu digitale, ristorante, gofood, menu online, qr code, menu multilingua, gestione allergeni",
  openGraph: {
    title: "Go!Food Menù - Il Menu Digitale per Ristoranti",
    description: "La soluzione completa per il tuo ristorante: menu digitale multilingua, gestione allergeni e setup immediato. Il cliente scansiona il QR e consulta il menu. Inizia oggi.",
    type: "website",
    // Immagine di anteprima: src/app/opengraph-image.tsx (file convention di Next)
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#E9580C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#FFF8E7]`}
      >
        <LanguageProvider>
          <QueryProvider>
            <GlutenFilterProvider>
              {children}
              {/* <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '10px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              /> */}
              <SonnerToaster position="top-center" />
              <CookieBanner />
              <Analytics />
            </GlutenFilterProvider>
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
