'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { changePassword } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { SettingsRow, SettingsSection } from './settings-ui';

type Translate = ReturnType<typeof useI18n>['t'];

// Mêmes bornes que ChangePasswordRequest côté serveur.
const makeSchema = (t: Translate) =>
    z
        .object({
            currentPassword: z
                .string()
                .min(1, t('validation.currentPasswordRequired')),
            newPassword: z
                .string()
                .min(8, t('validation.passwordMin'))
                .max(72, t('validation.passwordMax')),
            confirmation: z.string(),
        })
        .refine((values) => values.newPassword === values.confirmation, {
            path: ['confirmation'],
            message: t('validation.passwordMismatch'),
        });

type Values = z.infer<ReturnType<typeof makeSchema>>;

/** Monté seulement dialogue ouvert : le formulaire repart donc vierge à chaque ouverture. */
function PasswordForm({ onDone }: { onDone: () => void }) {
    const { t } = useI18n();
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(makeSchema(t)) });

    const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
        setServerError(null);

        try {
            await changePassword({ currentPassword, newPassword });
            toast.success(t('settings.security.success'));
            onDone();
        } catch (error) {
            setServerError(errorMessage(error));
        }
    });

    return (
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="currentPassword">
                    {t('settings.security.currentPassword')}
                </Label>
                <PasswordInput
                    id="currentPassword"
                    autoComplete="current-password"
                    aria-invalid={!!errors.currentPassword}
                    {...register('currentPassword')}
                />
                <InputError message={errors.currentPassword?.message} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="newPassword">
                    {t('settings.security.newPassword')}
                </Label>
                <PasswordInput
                    id="newPassword"
                    autoComplete="new-password"
                    aria-invalid={!!errors.newPassword}
                    {...register('newPassword')}
                />
                <InputError message={errors.newPassword?.message} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirmation">
                    {t('settings.security.confirmation')}
                </Label>
                <PasswordInput
                    id="confirmation"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmation}
                    {...register('confirmation')}
                />
                <InputError message={errors.confirmation?.message} />
            </div>
            {serverError && <InputError role="alert" message={serverError} />}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onDone}>
                    {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}
                    {t('settings.security.submit')}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function SecuritySettings() {
    const { logout } = useAuth();
    const { t } = useI18n();
    const [passwordOpen, setPasswordOpen] = useState(false);

    return (
        <>
            <SettingsSection title={t('settings.security.accessSection')}>
                <SettingsRow
                    title={t('auth.password')}
                    description={t('settings.security.passwordText')}
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPasswordOpen(true)}
                    >
                        {t('common.change')}
                    </Button>
                </SettingsRow>
                <SettingsRow
                    title={t('settings.security.sessionTitle')}
                    description={t('settings.security.sessionText')}
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void logout()}
                    >
                        {t('nav.logout')}
                    </Button>
                </SettingsRow>
            </SettingsSection>

            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('settings.security.passwordTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('settings.security.passwordText')}
                        </DialogDescription>
                    </DialogHeader>
                    <PasswordForm onDone={() => setPasswordOpen(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
}
