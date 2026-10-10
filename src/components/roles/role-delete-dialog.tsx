'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { deleteRole } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/errors';
import type { Role } from '@/lib/api/types';
import { useI18n } from '@/lib/i18n/use-i18n';

/**
 * Suppression en deux temps, comme l'API : un 409 ROLE_HAS_USERS propose de forcer, ce qui
 * déplace les utilisateurs concernés vers un rôle `archive-<nom>` au lieu de les dépouiller.
 * À remonter (`key`) pour chaque rôle ciblé afin de réinitialiser l'état.
 */
export function RoleDeleteDialog({
    role,
    onClose,
}: {
    role: Role | null;
    onClose: () => void;
}) {
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const [needsForce, setNeedsForce] = useState(false);

    const remove = useMutation({
        mutationFn: ({ target, force }: { target: Role; force: boolean }) =>
            deleteRole(target.id, force),
        onSuccess: async (_data, { target }) => {
            toast.success(t('roles.delete.done', { name: target.name }));
            await queryClient.invalidateQueries({ queryKey: ['roles'] });
            onClose();
        },
        onError: (error) => {
            if (error instanceof ApiError && error.code === 'ROLE_HAS_USERS') {
                setNeedsForce(true);

                return;
            }

            toast.error(errorMessage(error));
            onClose();
        },
    });

    return (
        <ConfirmDialog
            open={role !== null}
            onOpenChange={(open) => !open && onClose()}
            title={
                needsForce ? t('roles.delete.forceTitle') : t('roles.delete.title')
            }
            description={
                needsForce
                    ? t('roles.delete.forceText', { name: role?.name ?? '' })
                    : t('roles.delete.text', { name: role?.name ?? '' })
            }
            confirmLabel={
                needsForce
                    ? t('roles.delete.forceConfirm')
                    : t('roles.delete.confirm')
            }
            destructive
            pending={remove.isPending}
            onConfirm={() =>
                role && remove.mutate({ target: role, force: needsForce })
            }
        />
    );
}
