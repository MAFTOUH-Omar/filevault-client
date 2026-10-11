'use client';

import { HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { UserSummary } from '@/lib/api/types';
import { useI18n } from '@/lib/i18n/use-i18n';
import { cn } from '@/lib/utils';

/**
 * Espace utilisé / autorisé par les rôles du compte (`storageQuotaBytes`, `null` = illimité),
 * avec ce qu'il reste (`storageRemainingBytes`, calculé par le serveur).
 */
export function StorageMeter({
    user,
    className,
}: {
    user: Pick<
        UserSummary,
        'storageUsedBytes' | 'storageQuotaBytes' | 'storageRemainingBytes'
    >;
    className?: string;
}) {
    const { t, formatBytes } = useI18n();
    const { storageUsedBytes, storageQuotaBytes, storageRemainingBytes } = user;
    const hasQuota = typeof storageQuotaBytes === 'number';
    const remainingBytes = hasQuota
        ? (storageRemainingBytes ??
          Math.max(storageQuotaBytes - storageUsedBytes, 0))
        : null;
    const ratio = hasQuota
        ? storageQuotaBytes > 0
            ? Math.min(100, (storageUsedBytes / storageQuotaBytes) * 100)
            : 100
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
            {hasQuota && remainingBytes !== null && (
                <>
                    <Progress
                        value={ratio}
                        aria-label={t('storage.usedAria')}
                        indicatorClassName={cn(
                            'bg-lime-deep',
                            ratio >= 90 && 'bg-destructive',
                        )}
                    />
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                        <span>
                            {t('storage.percentUsed', {
                                percent: Math.round(ratio),
                            })}
                        </span>
                        <span
                            className={cn(
                                remainingBytes === 0 && 'text-destructive',
                            )}
                        >
                            {remainingBytes === 0
                                ? t('storage.full')
                                : t('storage.remaining', {
                                      size: formatBytes(remainingBytes),
                                  })}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
