'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/language-switcher';
import { LogoMark } from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/use-i18n';
import { UserMenu } from './user-menu';

/** Barre du haut façon Reddit : logo à gauche (menu seulement sur mobile), actions et compte à droite. */
export function AppHeader({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
    const { t } = useI18n();

    return (
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-1 border-b bg-background/85 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:gap-2 sm:px-4">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('nav.toggleMenu')}
                onClick={onOpenMobileMenu}
                className="lg:hidden"
            >
                <Menu className="size-5" />
            </Button>

            <Link
                href="/files"
                className="flex items-center gap-2 rounded-lg px-1 py-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
                <LogoMark className="size-8 shrink-0 rounded-[22%]" />
                <span className="font-display text-xl font-extrabold tracking-tight">
                    FileVault
                </span>
            </Link>

            <div className="ms-auto flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    );
}
