'use client';

import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export type VisibilityState = 'visible' | 'hidden_above' | 'hidden_below';

const seuils_observer = Array.from({ length: 21 }, (_, index) => index / 20);

/**
 * Suit un élément dans le viewport, dans les deux sens de scroll :
 * `hidden_above` quand il est sorti par le haut, `hidden_below` par le bas.
 * Il est « visible » dès que `seuil_ratio` de sa hauteur est à l'écran, sans
 * jamais exiger plus de `seuil_px` (un grand bloc ne reste pas vide).
 */
export function useVisibilityState(
    ref: RefObject<Element | null>,
    seuil_ratio = 0.25,
    seuil_px = 120,
): VisibilityState {
    const [state, setState] = useState<VisibilityState>('hidden_below');

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const hauteur_requise_px = Math.min(
                    entry.boundingClientRect.height * seuil_ratio,
                    seuil_px,
                );

                if (
                    entry.isIntersecting &&
                    entry.intersectionRect.height >= hauteur_requise_px
                ) {
                    setState('visible');

                    return;
                }

                setState(
                    entry.boundingClientRect.top < 0
                        ? 'hidden_above'
                        : 'hidden_below',
                );
            },
            { threshold: seuils_observer },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [ref, seuil_ratio, seuil_px]);

    return state;
}
