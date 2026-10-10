'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { getRolePermissions } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import type { Role } from '@/lib/api/types';
import { useI18n } from '@/lib/i18n/use-i18n';

export function RolePermissionsSheet({
    role,
    onClose,
}: {
    role: Role | null;
    onClose: () => void;
}) {
    const { t } = useI18n();
    const { data, isPending, isError, error } = useQuery({
        queryKey: ['roles', role?.id, 'permissions'],
        queryFn: () => getRolePermissions(role!.id),
        enabled: role !== null,
    });

    return (
        <Sheet open={role !== null} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        {t('roles.sheet.title', { name: role?.name ?? '' })}
                    </SheetTitle>
                    <SheetDescription>{t('roles.sheet.text')}</SheetDescription>
                </SheetHeader>
                <div className="space-y-3 px-4 pb-4">
                    {isPending &&
                        Array.from({ length: 4 }, (_, index) => (
                            <Skeleton key={index} className="h-12 w-full" />
                        ))}
                    {isError && (
                        <p className="text-sm text-destructive">
                            {errorMessage(error)}
                        </p>
                    )}
                    {data?.map((permission) => (
                        <div
                            key={permission.name}
                            className="rounded-lg border p-3"
                        >
                            <code className="text-xs font-semibold" dir="ltr">
                                {permission.name}
                            </code>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {permission.description}
                            </p>
                        </div>
                    ))}
                    {data?.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            {t('roles.sheet.none')}
                        </p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
