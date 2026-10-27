'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { MenuFrame } from './MenuFrame';
import { TextureOverlay } from './TextureOverlay';
import { readableTextOn } from '@/lib/theme-engine/contrast';

// Font già inclusi nel sito da next/font (src/app/layout.tsx): non vanno riscaricati da Google Fonts
const LOCAL_FONTS: Record<string, string> = {
    'Inter': 'var(--font-inter)',
    'Playfair Display': 'var(--font-playfair)',
};

const fontStack = (font: string) => LOCAL_FONTS[font] ?? `'${font}'`;

// lang: lingua della pagina tradotta (es. allergeni in polacco), per lettori di schermo e traduttori del browser
export function ThemeWrapper({ children, className, lang }: { children: React.ReactNode; className?: string; lang?: string }) {
    const { currentTheme } = useTheme();
    const { fontHeading, fontBody, colors } = currentTheme;
    // Senza fondo scelto il prezzo usa la superficie delle card: trasparente finirebbe sopra la foto
    const priceBackground = colors.priceBackground || colors.surface;
    const badgeBackground = colors.badgeBackground || colors.accent;
    // I colori dei badge non si scelgono dal Design Studio: se il testo non si legge si corregge qui
    const badgeText = readableTextOn(badgeBackground, colors.badgeText ?? colors.surface);
    // Testo su fondo colore principale (pulsanti e categorie attive): lo sfondo del menu, se si legge
    const onPrimary = readableTextOn(colors.primary, colors.background);

    // Helper to construct Google Fonts URL
    const getFontUrl = () => {
        const fonts = [fontHeading, fontBody].filter(f => f && f !== 'sans-serif' && f !== 'serif' && !LOCAL_FONTS[f]);
        const uniqueFonts = [...new Set(fonts)];
        if (uniqueFonts.length === 0) return '';

        const query = uniqueFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&');
        return `https://fonts.googleapis.com/css2?${query}&display=swap`;
    };

    return (
        <div
            lang={lang}
            className={`relative w-full min-h-[600px] flex flex-col ${className || ''}`}
            style={{
                fontFamily: fontStack(fontBody),
                '--tenant-primary': colors.primary,
                '--tenant-secondary': colors.secondary,
                '--tenant-background': colors.background,
                '--tenant-surface': colors.surface,
                '--tenant-text': colors.text,
                '--tenant-text-secondary': colors.textSecondary,
                '--tenant-border': colors.border,
                '--tenant-price': colors.price,
                '--tenant-accent': colors.accent,
                '--tenant-success': colors.success,

                // Granular Variables
                '--tenant-price-bg': priceBackground,
                '--tenant-badge-bg': badgeBackground,
                '--tenant-badge-text': badgeText,
                '--tenant-on-primary': onPrimary,
                '--tenant-footer-bg': colors.footerBackground || colors.background, // Fallback to main background
                '--tenant-footer-text': colors.footerText ?? colors.textSecondary,
                '--tenant-header-bg': colors.headerBackground ?? colors.surface,
                '--tenant-header-text': colors.headerText ?? colors.primary,
                '--tenant-overlay': colors.overlay ?? colors.primary,
                '--tenant-overlay-opacity': colors.overlayOpacity ?? 0.1,
                '--tenant-text-shadow': currentTheme.textShadow ?? 'none',
            } as React.CSSProperties}
        >
            {getFontUrl() && (
                <link rel="stylesheet" href={getFontUrl()} />
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
            .theme-heading { font-family: ${fontStack(fontHeading)}, serif; text-shadow: var(--tenant-text-shadow); }
            .theme-body { font-family: ${fontStack(fontBody)}, sans-serif; text-shadow: var(--tenant-text-shadow); }
        `}} />

            {/* Texture/Pattern Layer */}
            <TextureOverlay />

            {/* Content Layer */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
}
