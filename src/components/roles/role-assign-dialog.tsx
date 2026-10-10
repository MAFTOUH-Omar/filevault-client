'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { assignRole, unassignRole } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import type { Role } from '@/lib/api/types';
import { useI18n } from '@/lib/i18n/use-i18n';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * L'API n'a pas d'annuaire d'utilisateurs : on cible l'utilisateur par son identifiant.
 * À remonter (`key`) pour chaque rôle ciblé afin de réinitialiser l'état.
 */
export function RoleAssignDialog({
    role,
    onClose,
}: {
    role: Role | null;
    onClose: () => void;
}) {
    const { t } = useI18n();
    const [userId, setUserId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mutate = useMutation({
        mutationFn: ({ target, action }: { target: Role; action: 'assign' | 'unassign' }) =>
            (action === 'assign' ? assignRole : unassignRole)(
                target.id,
                userId.trim(),
            ),
        onSuccess: (_data, { target, action }) => {
            toast.success(
                action === 'assign'
                    ? t('roles.assignDialog.assigned', { name: target.name })
                    : t('roles.assignDialog.unassigned', { name: target.name }),
            );
            onClose();
        },
        onError: (err) => setError(errorMessage(err)),
    });

    const submit = (action: 'assign' | 'unassign') => {
        if (!role) {
            return;
        }

        if (!UUID.test(userId.trim())) {
            setError(t('validation.userId'));

            return;
        }

        setError(null);
        mutate.mutate({ target: role, action });
    };

    return (
        <Dialog open={role !== null} onOpenChange={(open) => !open && !mutate.isPending && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t('roles.assignDialog.title', { name: role?.name ?? '' })}
                    </DialogTitle>
                    <DialogDescription>
                        {t('roles.assignDialog.text', { name: role?.name ?? '' })}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="assign-user">{t('roles.assignDialog.userId')}</Label>
                    <Input
                        id="assign-user"
                        autoFocus
                        dir="ltr"
                        placeholder="00000000-0000-0000-0000-000000000000"
                        value={userId}
                        onChange={(event) => setUserId(event.target.value)}
                        aria-invalid={!!error}
                    />
                    <InputError role="alert" message={error ?? undefined} />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={mutate.isPending}
                        onClick={() => submit('unassign')}
                    >
                        {t('roles.assignDialog.unassign')}
                    </Button>
                    <Button
                        disabled={mutate.isPending}
                        onClick={() => submit('assign')}
                    >
                        {mutate.isPending && <Spinner />}
                        {t('roles.assignDialog.assign')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
