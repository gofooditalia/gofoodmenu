import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Go!Food Menù',
        short_name: 'Go!Food',
        description: 'Menu digitale multilingua, gestione allergeni e setup immediato.',
        start_url: '/',
        display: 'standalone',
        // Android usa questo colore anche per la barra di navigazione della PWA e ci disegna
        // sopra tasti chiari: su un colore chiaro (es. crema) i tasti diventano invisibili.
        // Arancio del logo, come la barra di stato (theme_color): un tono medio su cui i
        // tasti chiari restano leggibili.
        background_color: '#E9580C',
        theme_color: '#E9580C',
        icons: [
            {
                src: '/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            }
        ],
    };
}
