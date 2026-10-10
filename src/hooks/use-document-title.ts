'use client';

import { useEffect } from 'react';

/**
 * Titre d'onglet dans la langue courante. Les `metadata` statiques des pages restent le repli
 * (rendu serveur, robots) ; ce hook les remplace côté navigateur, après le routeur.
 */
export function useDocumentTitle(title: string): void {
    useEffect(() => {
        document.title = `${title} · FileVault`;
    }, [title]);
}
