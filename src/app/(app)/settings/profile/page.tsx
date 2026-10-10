import type { Metadata } from 'next';
import { ProfileSettings } from '@/components/settings/profile-settings';

export const metadata: Metadata = { title: 'Profil' };

// La session vit dans un cookie de l'API (autre origine) : l'espace connecté est rendu côté
// client derrière AppShell, il n'y a donc rien à valider pour la navigation instantanée.
export const instant = false;

export default function Page() {
    return <ProfileSettings />;
}
