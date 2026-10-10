'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { createRole, updateRole } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import type { Role } from '@/lib/api/types';
import { GIGA } from '@/lib/format';
import { useI18n } from '@/lib/i18n/use-i18n';

type Translate = ReturnType<typeof useI18n>['t'];

const makeSchema = (t: Translate) =>
    z
        .object({
            name: z
                .string()
                .trim()
                .min(1, t('validation.roleNameRequired'))
                .max(50, t('validation.roleNameMax')),
            unlimited: z.boolean(),
            quotaGb: z.string(),
        })
        .superRefine((values, ctx) => {
            if (values.unlimited) {
                return;
            }

            const quota = Number(values.quotaGb.replace(',', '.'));

            if (!values.quotaGb.trim() || !Number.isFinite(quota) || quota <= 0) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['quotaGb'],
                    message: t('validation.quotaPositive'),
                });
            }
        });

type Values = z.infer<ReturnType<typeof makeSchema>>;

function defaultsFor(role: Role | null): Values {
    return {
        name: role?.name ?? '',
        unlimited: role ? role.storageQuotaBytes === null : false,
        quotaGb:
            role?.storageQuotaBytes != null
                ? String(role.storageQuotaBytes / GIGA)
                : '1',
    };
}

/** Création (`role === null`) ou édition d'un rôle. À remonter (`key`) à chaque ouverture pour repartir d'un formulaire neuf. */
export function RoleFormDialog({
    open,
    onOpenChange,
    role,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role | null;
}) {
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<Values>({
        resolver: zodResolver(makeSchema(t)),
        defaultValues: defaultsFor(role),
    });

    const save = useMutation({
        mutationFn: (values: Values) => {
            const input = {
                name: values.name.trim(),
                storageQuotaBytes: values.unlimited
                    ? null
                    : Math.round(Number(values.quotaGb.replace(',', '.')) * GIGA),
            };

            return role ? updateRole(role.id, input) : createRole(input);
        },
        onSuccess: async () => {
            toast.success(
                role ? t('roles.form.updated') : t('roles.form.created'),
            );
            await queryClient.invalidateQueries({ queryKey: ['roles'] });
            onOpenChange(false);
        },
        onError: (error) => setServerError(errorMessage(error)),
    });

    const unlimited = useWatch({ control, name: 'unlimited' });

    return (
        <Dialog open={open} onOpenChange={(next) => !save.isPending && onOpenChange(next)}>
            <DialogContent>
                <form
                    onSubmit={handleSubmit((values) => save.mutate(values))}
                    noValidate
                    className="grid gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>
                            {role
                                ? t('roles.form.editTitle', { name: role.name })
                                : t('roles.form.createTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('roles.form.text')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="role-name">{t('roles.form.name')}</Label>
                        <Input
                            id="role-name"
                            autoFocus
                            aria-invalid={!!errors.name}
                            {...register('name')}
                        />
                        <InputError message={errors.name?.message} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role-quota">{t('roles.form.quota')}</Label>
                        <Input
                            id="role-quota"
                            inputMode="decimal"
                            disabled={unlimited}
                            aria-invalid={!!errors.quotaGb}
                            {...register('quotaGb')}
                        />
                        <InputError message={errors.quotaGb?.message} />
                        <Controller
                            control={control}
                            name="unlimited"
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="role-unlimited"
                                        checked={field.value}
                                        onCheckedChange={(checked) =>
                                            field.onChange(checked === true)
                                        }
                                    />
                                    <Label htmlFor="role-unlimited">
                                        {t('roles.form.unlimited')}
                                    </Label>
                                </div>
                            )}
                        />
                    </div>

                    {serverError && (
                        <InputError role="alert" message={serverError} />
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={save.isPending}
                            onClick={() => onOpenChange(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={save.isPending}>
                            {save.isPending && <Spinner />}
                            {role ? t('roles.form.save') : t('roles.form.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
