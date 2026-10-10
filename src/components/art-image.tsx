'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Image d'illustration facultative (`public/images/*`) : si le fichier n'existe pas encore,
 * elle disparaît (ou laisse place à `fallback`) au lieu d'afficher une image cassée.
 */
export function ArtImage({
    src,
    alt = '',
    width,
    height,
    className,
    fallback = null,
}: {
    src: string;
    alt?: string;
    width: number;
    height: number;
    className?: string;
    fallback?: ReactNode;
}) {
    const [failed, setFailed] = useState(false);
    const ref = useRef<HTMLImageElement>(null);

    // L'erreur peut survenir avant l'hydratation, auquel cas onError ne se déclenche jamais.
    useEffect(() => {
        const img = ref.current;

        if (img?.complete && img.naturalWidth === 0) {
            setFailed(true);
        }
    }, []);

    if (failed) {
        return fallback;
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element -- illustration statique, repli géré à la main
        <img
            ref={ref}
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={() => setFailed(true)}
        />
    );
}
