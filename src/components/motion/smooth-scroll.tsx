'use client';

import 'lenis/dist/lenis.css';
import { ReactLenis } from 'lenis/react';
import { useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

const options_lenis = {
    lerp: 0.1,
    duration: 1.1,
    smoothWheel: true,
    // Hauteur de la navbar sticky (64 px) : les ancres ne passent pas dessous.
    anchors: { offset: -80 },
};

/**
 * Scroll fluide Lenis (pages publiques uniquement : l'espace connecté a ses propres
 * conteneurs de défilement). Monté à côté des enfants, jamais autour.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
    const isReducedMotion = useReducedMotion();

    return (
        <>
            {!isReducedMotion && <ReactLenis root options={options_lenis} />}
            {children}
        </>
    );
}
