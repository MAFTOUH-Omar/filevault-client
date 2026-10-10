'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useVisibilityState } from '@/hooks/use-visibility-state';
import { duree_reveal_s, ease_reveal } from './config';

/** Nombre entier qui s'incrémente de 0 à `valeur` à chaque fois qu'il redevient visible. */
export default function CountUp({ valeur }: { valeur: number }) {
    const isReducedMotion = useReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const isVisible = useVisibilityState(ref) === 'visible';
    const [valeur_affichee, setValeurAffichee] = useState(
        isReducedMotion ? valeur : 0,
    );

    useEffect(() => {
        if (!isVisible || isReducedMotion) {
            return;
        }

        const controls = animate(0, valeur, {
            duration: duree_reveal_s * 2,
            ease: ease_reveal,
            onUpdate: (current) => setValeurAffichee(Math.round(current)),
        });

        return () => {
            controls.stop();
            setValeurAffichee(0);
        };
    }, [isVisible, isReducedMotion, valeur]);

    return (
        <span ref={ref} className="tabular-nums">
            {valeur_affichee}
        </span>
    );
}
