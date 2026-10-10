'use client';

import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'motion/react';
import type { ReactNode } from 'react';
import { useRef } from 'react';

type ParallaxProps = {
    children: ReactNode;
    className?: string;
    /** 0.15 ≈ ±45 px de translation sur toute la traversée de l'écran. */
    speed?: number;
};

const amplitude_px = 300;

export default function Parallax({
    children,
    className,
    speed = 0.15,
}: ParallaxProps) {
    const isReducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });
    const y_px = useTransform(
        scrollYProgress,
        [0, 1],
        [speed * amplitude_px, -speed * amplitude_px],
    );

    return (
        <motion.div
            ref={ref}
            className={className}
            style={isReducedMotion ? undefined : { y: y_px }}
        >
            {children}
        </motion.div>
    );
}
