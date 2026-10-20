import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Video della home: nomi file nuovi a ogni sostituzione, quindi cache lunga senza rischi
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  images: {
    // Le foto caricate prendono sempre un nome nuovo (usePhotos, dishes, logo),
    // quindi la cache lunga è sicura: evita di ritrasformarle ogni 4 ore (default Next 16).
    minimumCacheTTL: 2678400, // 31 giorni
    // Default senza 2048 e 3840: le card dei piatti non superano i 1920px.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
      {
        protocol: 'https',
        hostname: 'www.belleepoquepalermo.it',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
