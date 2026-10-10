'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { runCircleTransition } from '@/lib/view-transition';
import type { TransitionOrigin } from '@/lib/view-transition';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (
        mode: Appearance,
        origin?: TransitionOrigin,
    ) => void;
};

const STORAGE_KEY = 'appearance';

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';

const prefersDark = (): boolean =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;

const readStoredAppearance = (): Appearance => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch {
        return 'system';
    }
};

const isDarkMode = (appearance: Appearance): boolean =>
    appearance === 'dark' || (appearance === 'system' && prefersDark());

const applyTheme = (appearance: Appearance): void => {
    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
};

const notify = (): void => listeners.forEach((listener) => listener());

/**
 * Synchronise le store avec le thème déjà appliqué par le script inline du layout
 * (qui évite le flash au premier rendu) et suit les changements du thème système.
 */
export function useThemeSync(): void {
    useEffect(() => {
        currentAppearance = readStoredAppearance();
        applyTheme(currentAppearance);
        notify();

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onSystemChange = () => applyTheme(currentAppearance);

        media.addEventListener('change', onSystemChange);

        return () => media.removeEventListener('change', onSystemChange);
    }, []);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    // Lu sur <html> (posé par le script inline) ; « light » côté serveur et pendant l'hydratation,
    // sinon un système en mode sombre ferait diverger le HTML serveur (aria-label du bouton de thème).
    const resolvedAppearance: ResolvedAppearance = useSyncExternalStore(
        subscribe,
        () =>
            document.documentElement.classList.contains('dark')
                ? 'dark'
                : 'light',
        () => 'light',
    );

    const updateAppearance = (
        mode: Appearance,
        origin?: TransitionOrigin,
    ): void => {
        currentAppearance = mode;

        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            // Stockage indisponible : le thème vaut pour la session seulement.
        }

        runCircleTransition(() => {
            applyTheme(mode);
            notify();
        }, origin);
    };

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
