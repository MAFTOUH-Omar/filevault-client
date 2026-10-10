import type { Metadata } from 'next';
import { RolesPage } from '@/components/roles/roles-page';

export const metadata: Metadata = { title: 'Rôles' };

// La session vit dans un cookie de l'API (autre origine) : l'espace connecté est rendu côté
// client derrière AppShell, il n'y a donc rien à valider pour la navigation instantanée.
export const instant = false;

export default function Page() {
    return <RolesPage />;
}
