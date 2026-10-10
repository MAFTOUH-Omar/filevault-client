import type { Variants } from 'motion/react';

export const ease_reveal = [0.22, 1, 0.36, 1] as const;
export const duree_reveal_s = 0.6;
export const duree_sortie_s = 0.3;
export const decalage_y_px = 24;
export const decalage_stagger_s = 0.08;

type OptionsReveal = {
    y_px?: number;
    scale_initial?: number;
    delay_s?: number;
};

/**
 * Trois états pilotés par `useVisibilityState` : le contenu arrive depuis le
 * côté par lequel il est sorti (haut ou bas), donc l'animation vaut dans les
 * deux sens de scroll.
 */
export function creerVariantsReveal({
    y_px = decalage_y_px,
    scale_initial = 1,
    delay_s = 0,
}: OptionsReveal = {}): Variants {
    const sortie = { duration: duree_sortie_s, ease: 'easeIn' } as const;

    return {
        hidden_below: {
            opacity: 0,
            y: y_px,
            scale: scale_initial,
            transition: sortie,
        },
        hidden_above: {
            opacity: 0,
            y: -y_px,
            scale: scale_initial,
            transition: sortie,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: duree_reveal_s,
                ease: ease_reveal,
                delay: delay_s,
            },
        },
    };
}

export const variants_reveal = creerVariantsReveal();

export const variants_stagger: Variants = {
    hidden_below: {},
    hidden_above: {},
    visible: { transition: { staggerChildren: decalage_stagger_s } },
};
