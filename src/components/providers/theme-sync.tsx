'use client';

import { useThemeSync } from '@/hooks/use-appearance';
import { useLocaleSync } from '@/lib/i18n/use-i18n';

/** Branche les stores de thème et de langue sur ce qu'a déjà posé le script inline du layout. */
export function ThemeSync() {
    useThemeSync();
    useLocaleSync();

    return null;
}
