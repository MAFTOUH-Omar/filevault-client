import type { Metadata } from 'next';
import { SecuritySettings } from '@/components/settings/security-settings';

export const metadata: Metadata = { title: 'Sécurité' };

// La session vit dans un cookie de l'API (autre origine) : l'espace connecté est rendu côté
// client derrière AppShell, il n'y a donc rien à valider pour la navigation instantanée.
export const instant = false;

export default function Page() {
    return <SecuritySettings />;
}
