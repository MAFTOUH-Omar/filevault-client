'use client';

import { Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { LogoMark } from '@/components/logo';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { AppHeader } from './app-header';
import { SidebarNav } from './app-sidebar';
import { cn } from '@/lib/utils';
import { titleKeyFor } from './nav-config';

export function FullPageLoader() {
    const { t } = useI18n();

    return (
        <div
            role="status"
            aria-label={t('common.loading')}
            className="flex min-h-svh items-center justify-center"
        >
            <div className="flex w-64 flex-col gap-3">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
}

/**
 * Garde de l'espace connecté (tant que la session n'est pas restaurée, rien n'est rendu) et
 * mise en page façon Reddit : barre du haut pleine largeur, sidebar à gauche, colonne centrale.
 */
export function AppShell({ children }: { children: ReactNode }) {
    const { status } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useI18n();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [desktopOpen, setDesktopOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const titleKey = titleKeyFor(pathname);
    useDocumentTitle(titleKey ? t(titleKey) : 'FileVault');

    useEffect(() => {
        if (status === 'anonymous') {
            router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
    }, [status, router, pathname]);

    if (status !== 'authenticated') {
        return <FullPageLoader />;
    }

    return (
        <div className="flex min-h-svh flex-col">
            <AppHeader onOpenMobileMenu={() => setMobileOpen(true)} />

            <div className="flex flex-1 items-start">
                {/*
                 * Rail façon Reddit : la sidebar se replie en une fine colonne, et le bouton
                 * (rond, détouré) reste à cheval sur sa bordure, ouverte ou fermée.
                 */}
                <div
                    className={cn(
                        'sticky top-14 hidden h-[calc(100svh-3.5rem)] shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none lg:block',
                        desktopOpen ? 'w-64' : 'w-8',
                    )}
                >
                    <aside
                        inert={!desktopOpen}
                        className="size-full overflow-x-hidden overflow-y-auto border-e border-sidebar-border bg-sidebar"
                    >
                        {/* Replié : tout le contenu (icônes comprises) disparaît, seul le rail reste. */}
                        <SidebarNav
                            className={cn(
                                'min-h-full w-64 transition-[opacity,visibility] duration-200 motion-reduce:transition-none',
                                !desktopOpen && 'invisible opacity-0',
                            )}
                        />
                    </aside>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t('nav.toggleMenu')}
                        aria-expanded={desktopOpen}
                        onClick={() => setDesktopOpen((open) => !open)}
                        className="absolute end-0 top-3 z-10 size-8 translate-x-1/2 rounded-full bg-lime-dark text-lime shadow-soft hover:bg-lime-dark-hover hover:text-lime rtl:-translate-x-1/2"
                    >
                        <Menu className="size-4" />
                    </Button>
                </div>

                {/* Halo lime très doux en haut de page : donne de la profondeur sans charger le contenu. */}
                <main className="min-w-0 flex-1 bg-[radial-gradient(60rem_22rem_at_50%_-8rem,color-mix(in_oklab,var(--color-lime)_14%,transparent),transparent)]">
                    <div
                        key={pathname}
                        className="mx-auto flex w-full max-w-5xl animate-in flex-col gap-6 px-4 py-6 duration-500 fade-in-0 slide-in-from-bottom-2 md:px-8 md:py-8 motion-reduce:animate-none"
                    >
                        {children}
                    </div>
                </main>
            </div>

            <Sheet open={mobileOpen && !isDesktop} onOpenChange={setMobileOpen}>
                <SheetContent
                    side="left"
                    className="sidebar-scope w-72 gap-0 overflow-y-auto border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"
                >
                    <SheetTitle className="sr-only">FileVault</SheetTitle>
                    <SheetDescription className="sr-only">
                        {t('nav.main')}
                    </SheetDescription>
                    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
                        <LogoMark className="size-8 shrink-0 rounded-[22%]" />
                        <span className="font-display text-xl font-extrabold tracking-tight">
                            FileVault
                        </span>
                    </div>
                    <SidebarNav
                        className="flex-1"
                        onNavigate={() => setMobileOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
