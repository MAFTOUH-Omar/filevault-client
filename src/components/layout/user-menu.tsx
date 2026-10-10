'use client';

import { ChevronDown, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';

/** Avatar + nom dans l'en-tête (comme Reddit) ; le menu donne accès aux paramètres et à la déconnexion. */
export function UserMenu() {
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const getInitials = useInitials();

    if (!user) {
        return null;
    }

    const avatar = (
        <Avatar className="size-8 overflow-hidden rounded-full">
            <AvatarFallback className="bg-lime-soft text-xs font-bold text-night dark:text-foreground">
                {getInitials(user.fullName)}
            </AvatarFallback>
        </Avatar>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    aria-label={t('nav.userMenu')}
                    className="h-10 gap-2 rounded-full ps-1 pe-2 sm:pe-3"
                >
                    {avatar}
                    <span className="hidden max-w-32 truncate text-sm font-medium md:block">
                        {user.fullName}
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl">
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-2 py-2 text-start">
                        {avatar}
                        <div className="grid min-w-0 flex-1 leading-tight">
                            <span className="truncate text-sm font-medium">
                                {user.fullName}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link
                            href="/settings/profile"
                            className="cursor-pointer"
                        >
                            <Settings />
                            {t('nav.settings')}
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => void logout()}
                >
                    <LogOut />
                    {t('nav.logout')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
