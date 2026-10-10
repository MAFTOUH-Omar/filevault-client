'use client';

import { HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { UserSummary } from '@/lib/api/types';
import { useI18n } from '@/lib/i18n/use-i18n';
import { cn } from '@/lib/utils';

/**
 * Espace utilisé. Le quota n'est affiché que si le serveur l'expose
 * (`storageQuotaBytes` ; `null` = illimité) — sinon, juste le volume utilisé.
 */
export function StorageMeter({
    user,
    className,
}: {
    user: Pick<UserSummary, 'storageUsedBytes' | 'storageQuotaBytes'>;
    className?: string;
}) {
    const { t, formatBytes } = useI18n();
    const { storageUsedBytes, storageQuotaBytes } = user;
    const hasQuota = typeof storageQuotaBytes === 'number';
    const ratio = hasQuota
        ? Math.min(100, (storageUsedBytes / storageQuotaBytes) * 100)
        : 0;

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium">
                    <HardDrive className="size-4 text-muted-foreground" />
                    {t('storage.label')}
                </span>
                <span className="text-muted-foreground tabular-nums">
                    {formatBytes(storageUsedBytes)}
                    {hasQuota && ` / ${formatBytes(storageQuotaBytes)}`}
                    {storageQuotaBytes === null &&
                        ` · ${t('storage.unlimited')}`}
                </span>
            </div>
            {hasQuota && (
                <Progress
                    value={ratio}
                    aria-label={t('storage.usedAria')}
                    indicatorClassName={cn(
                        'bg-lime-deep',
                        ratio >= 90 && 'bg-destructive',
                    )}
                />
            )}
        </div>
    );
}
