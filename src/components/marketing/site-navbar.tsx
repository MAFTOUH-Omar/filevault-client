'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/language-switcher';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useIsScrolled } from '@/hooks/use-is-scrolled';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { cn } from '@/lib/utils';

/** Transparente tout en haut de page, teintée dès qu'on défile. */
export function SiteNavbar() {
    const { status } = useAuth();
    const { t } = useI18n();
    const isScrolled = useIsScrolled();

    return (
        <header
            className={cn(
                'sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
                isScrolled
                    ? 'border-border bg-background/80 backdrop-blur-md'
                    : 'border-transparent bg-transparent backdrop-blur-none',
            )}
        >
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Logo />
                <div className="flex items-center gap-1 sm:gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    {status === 'authenticated' ? (
                        <Button asChild variant="lime" size="sm">
                            <Link href="/files">{t('marketing.myVault')}</Link>
                        </Button>
                    ) : (
                        <Button asChild variant="lime" size="sm">
                            <Link href="/register">{t('marketing.start')}</Link>
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
}
