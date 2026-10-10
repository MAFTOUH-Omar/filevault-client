'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { useVisibilityState } from '@/hooks/use-visibility-state';
import { creerVariantsReveal } from './config';

type RevealProps = {
    children: ReactNode;
    className?: string;
    delay_s?: number;
    y_px?: number;
    scale_initial?: number;
};

export default function Reveal({
    children,
    className,
    delay_s,
    y_px,
    scale_initial,
}: RevealProps) {
    const isReducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const state = useVisibilityState(ref);
    const variants = useMemo(
        () => creerVariantsReveal({ y_px, scale_initial, delay_s }),
        [y_px, scale_initial, delay_s],
    );

    if (isReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={variants}
            initial="hidden_below"
            animate={state}
        >
            {children}
        </motion.div>
    );
}
