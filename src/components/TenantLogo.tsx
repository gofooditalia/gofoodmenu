/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';

interface TenantLogoProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

// Solo i loghi su Supabase (remotePatterns in next.config.ts) passano dall'ottimizzazione;
// gli SVG e gli altri indirizzi restano <img>, come prima.
function isOptimizable(src: string) {
  return /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(src) && !/\.svg(\?|$)/i.test(src);
}

// Logo del locale ridimensionato: l'originale può pesare centinaia di KB per pochi pixel a schermo.
// Stessi `sizes` ovunque, così header e footer scaricano lo stesso file.
export default function TenantLogo({ src, alt, className, eager = false }: TenantLogoProps) {
  if (!isOptimizable(src)) {
    return <img src={src} alt={alt} className={className} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={600}
      height={240}
      sizes="200px"
      loading={eager ? 'eager' : 'lazy'}
      className={className}
    />
  );
}
