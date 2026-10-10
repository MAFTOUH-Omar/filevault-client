'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { useVisibilityState } from '@/hooks/use-visibility-state';
import { variants_reveal, variants_stagger } from './config';

type StaggerProps = { children: ReactNode; className?: string };

export function Stagger({ children, className }: StaggerProps) {
    const isReducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const state = useVisibilityState(ref);

    if (isReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={variants_stagger}
            initial="hidden_below"
            animate={state}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className }: StaggerProps) {
    const isReducedMotion = useReducedMotion();

    if (isReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div className={className} variants={variants_reveal}>
            {children}
        </motion.div>
    );
}
