'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { useVisibilityState } from '@/hooks/use-visibility-state';
import { duree_reveal_s, ease_reveal } from './config';

/**
 * Surligneur lime : la barre se déploie en scaleX (origine gauche) à chaque
 * fois que le mot redevient visible.
 * Sous `sm`, le texte peut passer sur 2 lignes : on garde le surlignage CSS
 * statique (`.mark-lime`).
 */
export default function Highlight({
    children,
    delay_s = 0,
}: {
    children: ReactNode;
    delay_s?: number;
}) {
    const isReducedMotion = useReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const isVisible = useVisibilityState(ref) === 'visible';

    if (isReducedMotion) {
        return <span className="mark-lime">{children}</span>;
    }

    return (
        <span
            ref={ref}
            className="mark-lime sm:relative sm:inline-block sm:bg-none sm:whitespace-nowrap"
        >
            <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[8%] hidden h-[34%] origin-left bg-lime sm:block dark:bg-lime/40"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isVisible ? 1 : 0 }}
                transition={{
                    duration: duree_reveal_s,
                    ease: ease_reveal,
                    delay: isVisible ? delay_s : 0,
                }}
            />
            <span className="relative">{children}</span>
        </span>
    );
}
