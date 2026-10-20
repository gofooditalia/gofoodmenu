import Image from 'next/image';
import Link from 'next/link';

type ClientLogo = {
  name: string;
  href: string;
  src: string;
  /** Dimensioni del riquadro: i loghi hanno proporzioni diverse */
  box: string;
  /** Classi extra per il riquadro (es. sfondo per loghi chiari) */
  boxClassName?: string;
  imageClassName?: string;
};

const SUPABASE = 'https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/public';
// Loghi nuovi: copia in public/images/clients, non il file nel bucket `logos` del locale,
// che viene svuotato quando il ristoratore cambia logo dalla dashboard

const CLIENT_LOGOS: ClientLogo[] = [
  {
    name: 'Magna Roma',
    href: '/magnaromatrattoria',
    src: '/images/magnaroma-logo.png',
    box: 'w-44 h-20 md:w-56 md:h-24',
  },
  {
    name: 'Osteria Cilea',
    href: '/osteria-cilea',
    src: `${SUPABASE}/Go%20Food/Osteria%20Cilea%20Logo%20HD.png`,
    box: 'w-24 h-20 md:w-28 md:h-24',
  },
  {
    name: 'Bistrot 107',
    href: '/bistrot107',
    src: `${SUPABASE}/Go%20Food/images-modified.png`,
    box: 'w-24 h-20 md:w-28 md:h-24',
  },
  {
    name: 'Villa Pensabene Ristorante Pizzeria',
    href: '/villa-pensabene-ristorante-pizzeria',
    src: `${SUPABASE}/Go%20Food/Gemini_Generated_Image_gw5jhzgw5jhzgw5j-Photoroom.png`,
    box: 'w-28 h-24 md:w-36 md:h-28',
  },
  {
    name: 'Sunset Barcarello',
    href: '/sunset-barcarello',
    src: '/images/clients/sunset-barcarello.png',
    box: 'w-20 h-20 md:w-24 md:h-24',
    boxClassName: 'rounded-full bg-gray-900',
    imageClassName: 'p-3 md:p-4',
  },
  {
    name: 'Spaghetteria da Emanuele',
    href: '/spaghetteria-da-emanuele',
    src: '/images/clients/spaghetteria-da-emanuele.png',
    box: 'w-24 h-20 md:w-28 md:h-24',
  },
  {
    name: 'Scjavuru',
    href: '/scjavuru',
    src: '/images/clients/scjavuru.png',
    box: 'w-24 h-24 md:w-28 md:h-28',
  },
];

function LogoItem({ logo, hidden }: { logo: ClientLogo; hidden?: boolean }) {
  return (
    <li className="shrink-0 px-6 md:px-10" aria-hidden={hidden || undefined}>
      <Link
        href={logo.href}
        // Senza prefetch: la home non deve scaricare in anticipo i menu di tutti i locali
        prefetch={false}
        tabIndex={hidden ? -1 : undefined}
        aria-label={`Menu di ${logo.name}`}
        className="flex h-28 md:h-32 items-center justify-center transition-transform duration-300 hover:scale-110"
      >
        <div className={`relative ${logo.box} ${logo.boxClassName ?? ''}`}>
          <Image
            src={logo.src}
            alt={hidden ? '' : logo.name}
            fill
            sizes="224px"
            className={`object-contain ${logo.imageClassName ?? ''}`}
          />
        </div>
      </Link>
    </li>
  );
}

/**
 * Carosello infinito dei loghi dei ristoranti clienti.
 * La lista è ripetuta due volte e la traccia scorre del 50%: il ciclo è senza stacchi.
 * Si ferma al passaggio del mouse; con "riduci movimento" attivo diventa scorrevole a mano.
 */
export default function ClientLogosMarquee() {
  return (
    <div className="logo-marquee group relative overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <ul className="logo-marquee-track flex w-max items-center group-hover:[animation-play-state:paused]">
        {CLIENT_LOGOS.map((logo) => (
          <LogoItem key={logo.name} logo={logo} />
        ))}
        {CLIENT_LOGOS.map((logo) => (
          <LogoItem key={`${logo.name}-copy`} logo={logo} hidden />
        ))}
      </ul>
    </div>
  );
}
