'use client';

import BoringAvatar from 'boring-avatars';
import { cn } from '@/lib/utils';

/** Palette Moholy-Nagy / Bauhaus : rouge, jaune, bleu primaires, noir et blanc cassé. */
const MOHOLY_COLORS = ['#d62828', '#f6bd16', '#1d4e9e', '#111111', '#f2ebdd'];

/**
 * Avatar généré (boring-avatars, variante « bauhaus ») : la graine est l'identifiant du compte,
 * donc le motif est stable d'un appareil à l'autre et ne change pas si l'on renomme le profil.
 */
export function UserAvatar({
    seed,
    size = 32,
    className,
}: {
    seed: string;
    size?: number;
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'flex shrink-0 overflow-hidden rounded-full ring-1 ring-border',
                className,
            )}
            style={{ width: size, height: size }}
        >
            <BoringAvatar
                name={seed}
                variant="bauhaus"
                colors={MOHOLY_COLORS}
                size={size}
                // `size-full` : sans classe `size-*`, le Button parent force ses svg à 16 px.
                className="block size-full"
            />
        </span>
    );
}
