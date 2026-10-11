'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
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
import { UserAvatar } from '@/components/user-avatar';
import { changeEmail } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { SettingsRow, SettingsSection } from './settings-ui';

type Translate = ReturnType<typeof useI18n>['t'];

const makeSchema = (t: Translate) =>
    z.object({
        newEmail: z
            .email(t('validation.email'))
            .max(255, t('validation.emailMax')),
        currentPassword: z.string().min(1, t('validation.confirmWithPassword')),
    });

type Values = z.infer<ReturnType<typeof makeSchema>>;

/** Monté seulement dialogue ouvert : le formulaire repart donc vierge à chaque ouverture. */
function EmailForm({ onDone }: { onDone: () => void }) {
    const { setUser } = useAuth();
    const { t } = useI18n();
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(makeSchema(t)) });

    const onSubmit = handleSubmit(async (values) => {
        setServerError(null);

        try {
            setUser(await changeEmail(values));
            toast.success(t('settings.profile.success'));
            onDone();
        } catch (error) {
            setServerError(errorMessage(error));
        }
    });

    return (
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="newEmail">
                    {t('settings.profile.newEmail')}
                </Label>
                <Input
                    id="newEmail"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    aria-invalid={!!errors.newEmail}
                    {...register('newEmail')}
                />
                <InputError message={errors.newEmail?.message} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="currentPassword">
                    {t('settings.profile.currentPassword')}
                </Label>
                <PasswordInput
                    id="currentPassword"
                    autoComplete="current-password"
                    aria-invalid={!!errors.currentPassword}
                    {...register('currentPassword')}
                />
                <InputError message={errors.currentPassword?.message} />
            </div>
            {serverError && <InputError role="alert" message={serverError} />}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onDone}>
                    {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}
                    {t('settings.profile.submit')}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function ProfileSettings() {
    const { user } = useAuth();
    const { t } = useI18n();
    const [emailOpen, setEmailOpen] = useState(false);

    if (!user) {
        return null;
    }

    return (
        <>
            <div className="flex items-center gap-4 pt-6">
                <UserAvatar seed={user.id} size={64} />
                <div className="min-w-0">
                    <p className="truncate font-display text-2xl font-extrabold tracking-tight">
                        {user.fullName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                    </p>
                </div>
            </div>

            <SettingsSection title={t('nav.groupAccount')}>
                <SettingsRow
                    title={t('auth.email')}
                    description={user.email}
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEmailOpen(true)}
                    >
                        {t('common.change')}
                    </Button>
                </SettingsRow>
                <SettingsRow title={t('settings.profile.roles')}>
                    <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                            <Badge key={role} variant="lime">
                                {role}
                            </Badge>
                        ))}
                        {user.roles.length === 0 && (
                            <span className="text-sm text-muted-foreground">
                                {t('settings.profile.noRole')}
                            </span>
                        )}
                    </div>
                </SettingsRow>
            </SettingsSection>

            <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('settings.profile.emailTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('settings.profile.emailText')}
                        </DialogDescription>
                    </DialogHeader>
                    <EmailForm onDone={() => setEmailOpen(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
}
