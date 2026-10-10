'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FloatProps = {
    children: ReactNode;
    className?: string;
    /** Décale la phase du cycle pour que plusieurs éléments ne flottent pas en chœur. */
    delay_s?: number;
};

/**
 * Lévitation en CSS pur (keyframes `float` dans app.css) : tourne sur le
 * compositeur, donc reste fluide même quand le thread principal est occupé.
 * L'ombre au sol suit le mouvement pour donner de la profondeur.
 */
export default function Float({
    children,
    className,
    delay_s = 0,
}: FloatProps) {
    const style = { animationDelay: `${-delay_s}s` };

    return (
        <div className={cn('relative', className)}>
            <div
                className="size-full animate-float will-change-transform motion-reduce:animate-none"
                style={style}
            >
                {children}
            </div>
            <div
                aria-hidden="true"
                className="absolute inset-x-[22%] -bottom-2 h-3 animate-float-shadow rounded-full bg-foreground/15 blur-md motion-reduce:animate-none"
                style={style}
            />
        </div>
    );
}
