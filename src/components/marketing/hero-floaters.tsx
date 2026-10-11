import type { CSSProperties } from 'react';
import { ArtImage } from '@/components/art-image';
import { cn } from '@/lib/utils';

/**
 * Objets 3D flottants autour du titre. Chaque visuel est facultatif
 * (`public/images/hero-float-*.webp`, fond transparent, carré 768×768) : tant que le fichier
 * n'existe pas, il est simplement absent. Les décalages de phase, durées et amplitudes
 * diffèrent d'un objet à l'autre pour que l'ensemble ne bouge jamais « en chœur ».
 */
const floaters = [
    {
        src: '/images/hero-float-1.webp',
        position: 'start-[2%] -top-14 w-16 sm:-top-16 sm:w-20 lg:start-[1%] lg:top-[2%] lg:w-24 xl:w-36',
        duration_s: 7,
        distance_px: -14,
        rotate_deg: 4,
        delay_s: 0.5,
    },
    {
        src: '/images/hero-float-2.webp',
        position: 'end-[2%] -top-12 w-16 sm:-top-14 sm:w-20 lg:end-[1%] lg:top-[0%] lg:w-24 xl:w-40',
        duration_s: 8,
        distance_px: -18,
        rotate_deg: -5,
        delay_s: 0.65,
    },
    {
        src: '/images/hero-float-3.webp',
        position: 'start-[6%] top-full w-11 sm:start-[10%] sm:w-12 lg:start-[3%] lg:top-[58%] lg:w-20 xl:w-28',
        duration_s: 6,
        distance_px: -10,
        rotate_deg: -6,
        delay_s: 0.8,
    },
    {
        src: '/images/hero-float-4.webp',
        position: 'end-[6%] top-full w-11 sm:end-[10%] sm:w-12 lg:end-[4%] lg:top-[56%] lg:w-20 xl:w-32',
        duration_s: 7.5,
        distance_px: -16,
        rotate_deg: 5,
        delay_s: 0.95,
    },
    {
        src: '/images/hero-float-5.webp',
        position: 'start-[15%] top-[84%] hidden w-16 xl:block xl:w-20',
        duration_s: 5.5,
        distance_px: -8,
        rotate_deg: 8,
        delay_s: 1.1,
    },
    {
        src: '/images/hero-float-6.webp',
        position: 'end-[16%] top-[86%] hidden w-16 xl:block xl:w-24',
        duration_s: 6.5,
        distance_px: -10,
        rotate_deg: -7,
        delay_s: 1.25,
    },
];

export function HeroFloaters() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
        >
            {floaters.map((item, index) => (
                // Entrée (fondu + zoom, une fois) et lévitation (en boucle) : deux couches, tout en CSS.
                <div
                    key={item.src}
                    className={cn(
                        'absolute animate-pop-in motion-reduce:animate-none',
                        item.position,
                    )}
                    style={{ animationDelay: `${item.delay_s}s` }}
                >
                    <div
                        className="animate-drift will-change-transform motion-reduce:animate-none"
                        style={
                            {
                                '--drift-duration': `${item.duration_s}s`,
                                '--drift-y': `${item.distance_px}px`,
                                '--drift-r': `${item.rotate_deg}deg`,
                                animationDelay: `${-index * 1.3}s`,
                            } as CSSProperties
                        }
                    >
                        <ArtImage
                            src={item.src}
                            width={768}
                            height={768}
                            className="h-auto w-full drop-shadow-[0_24px_28px_rgb(0_0_0/0.18)]"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
