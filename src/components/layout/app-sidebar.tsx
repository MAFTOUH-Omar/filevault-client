'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/lib/auth/auth-provider';
import type { TextKey } from '@/lib/i18n/types';
import { useI18n } from '@/lib/i18n/use-i18n';
import { cn } from '@/lib/utils';
import { adminNav, mainNav, settingsNav } from './nav-config';
import type { NavItem } from './nav-config';
import { StorageMeter } from './storage-meter';

/** Section repliable façon Reddit : intitulé en capitales discrètes + chevron. */
function NavSection({
    labelKey,
    items,
    onNavigate,
}: {
    labelKey: TextKey;
    items: NavItem[];
    onNavigate?: () => void;
}) {
    const pathname = usePathname();
    const { can } = useAuth();
    const { t } = useI18n();
    const [open, setOpen] = useState(true);
    const visible = items.filter(
        (item) => !item.permission || can(item.permission),
    );

    if (visible.length === 0) {
        return null;
    }

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="border-t border-sidebar-border py-2 first:border-t-0"
        >
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] font-semibold tracking-wider text-sidebar-muted uppercase outline-none transition-colors hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                {t(labelKey)}
                <ChevronDown className="size-4 transition-transform group-data-[state=closed]:-rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
                <ul className="mt-1 space-y-0.5">
                    {visible.map((item) => {
                        const active = pathname.startsWith(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                                        active
                                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    )}
                                >
                                    <item.icon className="size-[18px] shrink-0" />
                                    <span className="truncate">
                                        {t(item.titleKey)}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </CollapsibleContent>
        </Collapsible>
    );
}

/**
 * Contenu de la sidebar (colonne fixe sur grand écran, tiroir sur mobile). Sa couleur est
 * volontairement inversée par rapport au thème : voir les tokens `--sidebar-*` de globals.css.
 */
export function SidebarNav({
    onNavigate,
    className,
}: {
    onNavigate?: () => void;
    className?: string;
}) {
    const { user } = useAuth();
    const { t } = useI18n();

    return (
        <nav
            aria-label={t('nav.main')}
            className={cn(
                'sidebar-scope flex flex-col bg-sidebar p-3 text-sidebar-foreground',
                className,
            )}
        >
            <NavSection
                labelKey="nav.groupSpace"
                items={mainNav}
                onNavigate={onNavigate}
            />
            <NavSection
                labelKey="nav.groupAdmin"
                items={adminNav}
                onNavigate={onNavigate}
            />
            <NavSection
                labelKey="nav.groupAccount"
                items={settingsNav}
                onNavigate={onNavigate}
            />

            {user && (
                <div className="mt-auto border-t border-sidebar-border px-3 pt-4 pb-1">
                    <StorageMeter user={user} />
                </div>
            )}
        </nav>
    );
}
