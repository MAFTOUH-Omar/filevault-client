'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { settingsNav } from '@/components/layout/nav-config';
import { useI18n } from '@/lib/i18n/use-i18n';
import { cn } from '@/lib/utils';

/** Titre « Paramètres » + onglets soulignés (Profil · Sécurité · Apparence), comme les réglages de Reddit. */
export function SettingsHeader() {
    const pathname = usePathname();
    const { t } = useI18n();

    return (
        <div className="space-y-5">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {t('nav.settings')}
            </h1>
            <nav
                aria-label={t('nav.settings')}
                className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0"
            >
                <ul className="flex gap-6">
                    {settingsNav.map((item) => {
                        const active = pathname.startsWith(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        '-mb-px flex items-center gap-2 border-b-2 py-3 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:text-foreground',
                                        active
                                            ? 'border-foreground text-foreground'
                                            : 'border-transparent text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <item.icon className="size-4" />
                                    {t(item.titleKey)}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}

/** Bloc de réglages : intitulé en capitales discrètes, lignes séparées par des filets (sans carte). */
export function SettingsSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="pt-6">
            <h2 className="pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {title}
            </h2>
            <div className="divide-y border-y">{children}</div>
        </section>
    );
}

/** Ligne de réglage : intitulé + description à gauche, valeur ou action à droite. */
export function SettingsRow({
    title,
    description,
    children,
}: {
    title: string;
    description?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 space-y-0.5">
                <p className="font-medium">{title}</p>
                {description && (
                    <p className="text-sm break-words text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children && <div className="shrink-0">{children}</div>}
        </div>
    );
}
