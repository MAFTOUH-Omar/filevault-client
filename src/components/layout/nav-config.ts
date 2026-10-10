import { Files, KeyRound, Palette, ShieldCheck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PERMISSIONS } from '@/lib/api/types';
import type { PermissionName } from '@/lib/api/types';
import type { TextKey } from '@/lib/i18n/types';

export type NavItem = {
    titleKey: TextKey;
    href: string;
    icon: LucideIcon;
    /** Absente = visible pour tout utilisateur connecté. */
    permission?: PermissionName;
};

export const mainNav: NavItem[] = [
    {
        titleKey: 'nav.files',
        href: '/files',
        icon: Files,
        permission: PERMISSIONS.filesRead,
    },
];

export const adminNav: NavItem[] = [
    {
        titleKey: 'nav.roles',
        href: '/admin/roles',
        icon: ShieldCheck,
        permission: PERMISSIONS.rolesRead,
    },
];

export const settingsNav: NavItem[] = [
    { titleKey: 'nav.profile', href: '/settings/profile', icon: UserRound },
    { titleKey: 'nav.security', href: '/settings/security', icon: KeyRound },
    { titleKey: 'nav.appearance', href: '/settings/appearance', icon: Palette },
];

/** Clé de titre d'une route pour l'en-tête. */
export function titleKeyFor(pathname: string): TextKey | null {
    const all = [...mainNav, ...adminNav, ...settingsNav];

    return all.find((item) => pathname.startsWith(item.href))?.titleKey ?? null;
}
