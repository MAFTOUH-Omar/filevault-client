'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgress() {
    const isReducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 30,
        restDelta: 0.001,
    });

    if (isReducedMotion) {
        return null;
    }

    return (
        <motion.div
            aria-hidden="true"
            style={{ scaleX }}
            className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-lime-deep"
        />
    );
}
