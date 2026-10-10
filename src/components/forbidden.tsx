'use client';

import { LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/use-i18n';

/**
 * Affiché quand l'utilisateur n'a pas la permission requise. On ne fait volontairement
 * AUCUN appel API dans ce cas : chaque 403 compte comme un refus côté serveur (AbuseGuard)
 * et finit par mettre l'IP en liste noire.
 */
export function Forbidden({ permission }: { permission: string }) {
    const { t } = useI18n();

    return (
        <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-lime-soft">
                <LockKeyhole className="size-6" />
            </div>
            <h2 className="font-display text-2xl font-extrabold">
                {t('forbidden.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
                {t('forbidden.text', { permission })}
            </p>
            <Button asChild variant="outline">
                <Link href="/settings/profile">{t('forbidden.profile')}</Link>
            </Button>
        </div>
    );
}
