'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** Vrai dès que la page a défilé de plus de `seuil_px` depuis le haut. */
export function useIsScrolled(seuil_px = 8): boolean {
    const subscribe = useCallback((callback: () => void) => {
        window.addEventListener('scroll', callback, { passive: true });

        return () => window.removeEventListener('scroll', callback);
    }, []);

    return useSyncExternalStore(
        subscribe,
        () => window.scrollY > seuil_px,
        () => false,
    );
}
