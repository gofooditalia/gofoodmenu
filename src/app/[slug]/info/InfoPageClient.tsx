'use client';

import React from 'react';
import Link from 'next/link';
import TenantLogo from '@/components/TenantLogo';
import { SocialIcon } from '@/components/SocialIcon';
import { ThemeProvider, useTheme } from '@/components/theme/ThemeContext';
import { ThemeWrapper } from '@/components/theme/ThemeWrapper';
import type { ThemeConfig } from '@/lib/theme-engine/types';
import { readableTextOn } from '@/lib/theme-engine/contrast';
import { absoluteUrl, mapsUrl, parsePhoneNumbers, socialLabel } from '@/lib/tenant-info';
import type { FooterSocial } from '@/types/menu';

export interface InfoLocation {
  city: string;
  address: string;
  phone: string | null;
  openingHours: string | null;
}

interface InfoPageProps {
  slug: string;
  name: string;
  tagline: string;
  logoUrl: string | null;
  locations: InfoLocation[];
  socials: FooterSocial[];
}

const NewTabHint = () => <span className="sr-only"> (si apre in una nuova scheda)</span>;

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  );
}

function InfoContent({ slug, name, tagline, logoUrl, locations, socials }: InfoPageProps) {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  // Testi e pulsanti secondari stanno sulle card (colore superficie): se il colore del tema non si legge, si corregge
  const accentOnSurface = readableTextOn(colors.surface, colors.primary);
  const mutedOnSurface = readableTextOn(colors.surface, colors.textSecondary);
  const titleOnBackground = readableTextOn(colors.background, colors.primary);
  const mutedOnBackground = readableTextOn(colors.background, colors.textSecondary);

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    color: colors.text,
    borderColor: colors.border,
  };
  const outlineButton =
    'inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-full border-2 font-semibold text-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  return (
    <div lang="it" className="min-h-screen" style={{ color: colors.text }}>
      <main className="mx-auto w-full max-w-md px-4 pt-10 pb-8 flex flex-col gap-6">
        {/* Logo, nome e sottotitolo */}
        <header className="text-center flex flex-col items-center gap-3">
          {logoUrl && (
            <TenantLogo src={logoUrl} alt="" eager className="h-24 w-auto max-w-[240px] object-contain" />
          )}
          <h1 className="font-display text-3xl font-bold theme-heading" style={{ color: titleOnBackground }}>
            {name}
          </h1>
          {tagline && (
            <p className="theme-body text-base" style={{ color: mutedOnBackground }}>
              {tagline}
            </p>
          )}
        </header>

        {/* Il pulsante principale: il menu */}
        <Link
          href={`/${slug}`}
          className="flex items-center justify-center gap-2 min-h-14 rounded-2xl px-6 text-lg font-bold shadow-md transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: colors.primary, color: 'var(--tenant-on-primary)', outlineColor: colors.primary }}
        >
          Sfoglia il menu
          <span aria-hidden="true">→</span>
        </Link>

        {/* Sedi: indicazioni, telefono, orari */}
        {locations.length > 0 && (
          <section aria-labelledby="info-sedi" className="flex flex-col gap-3">
            <h2 id="info-sedi" className="text-center text-sm font-bold uppercase tracking-wider" style={{ color: mutedOnBackground }}>
              {locations.length > 1 ? 'Le nostre sedi' : 'Dove siamo'}
            </h2>
            <ul className="flex flex-col gap-3">
              {locations.map((location, index) => {
                const phones = parsePhoneNumbers(location.phone);
                return (
                  <li key={index} className="rounded-2xl border p-4 shadow-sm" style={cardStyle}>
                    <h3 className="font-bold text-lg theme-heading" style={{ color: accentOnSurface }}>
                      {location.city || location.address}
                    </h3>
                    <p className="text-sm">{location.address}</p>
                    {location.openingHours && (
                      <p className="mt-1 flex gap-1.5 text-sm" style={{ color: mutedOnSurface }}>
                        <ClockIcon />
                        <span>
                          <span className="sr-only">Orari: </span>
                          {location.openingHours}
                        </span>
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {location.address && (
                        <a
                          href={mapsUrl(location.address, location.city)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={outlineButton}
                          style={{ color: accentOnSurface, borderColor: accentOnSurface, outlineColor: accentOnSurface }}
                        >
                          <PinIcon />
                          Indicazioni
                          <NewTabHint />
                        </a>
                      )}
                      {phones.map((phone) => (
                        <a
                          key={phone.href}
                          href={phone.href}
                          className={outlineButton}
                          style={{ color: accentOnSurface, borderColor: accentOnSurface, outlineColor: accentOnSurface }}
                        >
                          <PhoneIcon />
                          <span className="sr-only">Chiama </span>
                          {phone.label}
                        </a>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Social */}
        {socials.length > 0 && (
          <section aria-labelledby="info-social" className="flex flex-col gap-3">
            <h2 id="info-social" className="text-center text-sm font-bold uppercase tracking-wider" style={{ color: mutedOnBackground }}>
              Seguici
            </h2>
            <ul className="flex flex-col gap-2">
              {socials.map((social, index) => (
                <li key={index}>
                  <a
                    href={absoluteUrl(social.url.trim())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 min-h-12 rounded-2xl border px-4 font-semibold shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ ...cardStyle, outlineColor: accentOnSurface }}
                  >
                    <span style={{ color: accentOnSurface }}>
                      <SocialIcon platform={social.platform} className="w-6 h-6" />
                    </span>
                    {socialLabel(social.platform)}
                    <NewTabHint />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="pb-8 text-center text-xs" style={{ color: mutedOnBackground }}>
        Menu digitale con{' '}
        <a href="https://gofoodmenu.it" target="_blank" rel="noopener noreferrer" className="underline">
          Go!Food Menù
          <NewTabHint />
        </a>
      </footer>
    </div>
  );
}

export default function InfoPageClient({ initialTheme, ...props }: InfoPageProps & { initialTheme?: ThemeConfig | null }) {
  return (
    <ThemeProvider initialTheme={initialTheme ?? undefined}>
      <ThemeWrapper className="min-h-screen">
        <InfoContent {...props} />
      </ThemeWrapper>
    </ThemeProvider>
  );
}
