'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { errorMessage } from '@/lib/api/errors';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { safeNext, useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { AuthHeading } from './auth-modal';

type Translate = ReturnType<typeof useI18n>['t'];

// Mêmes bornes que RegisterRequest côté serveur.
const makeSchema = (t: Translate) =>
    z
        .object({
            fullName: z
                .string()
                .trim()
                .min(1, t('validation.nameRequired'))
                .max(120, t('validation.nameMax')),
            email: z
                .email(t('validation.email'))
                .max(255, t('validation.emailMax')),
            password: z
                .string()
                .min(8, t('validation.passwordMin'))
                .max(72, t('validation.passwordMax')),
            confirmation: z.string(),
        })
        .refine((values) => values.password === values.confirmation, {
            path: ['confirmation'],
            message: t('validation.passwordMismatch'),
        });

type Values = z.infer<ReturnType<typeof makeSchema>>;

export function RegisterForm() {
    const { register: registerAccount } = useAuth();
    const { t } = useI18n();
    useDocumentTitle(t('auth.createAccount'));
    const router = useRouter();
    const next = useSearchParams().get('next');
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(makeSchema(t)) });

    const onSubmit = handleSubmit(async ({ fullName, email, password }) => {
        setServerError(null);

        try {
            await registerAccount({ fullName, email, password });
            router.replace(safeNext(next));
        } catch (error) {
            setServerError(errorMessage(error));
        }
    });

    const withNext = (path: string) =>
        next ? `${path}?next=${encodeURIComponent(next)}` : path;

    return (
        <>
            <AuthHeading
                title={t('auth.registerTitle')}
                description={t('auth.registerText')}
            />

            <form
                onSubmit={onSubmit}
                noValidate
                className="mt-6 flex flex-col gap-5 text-start"
            >
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName" className="sr-only">
                            {t('auth.fullName')}
                        </Label>
                        <Input
                            id="fullName"
                            autoFocus
                            autoComplete="name"
                            placeholder={t('auth.fullName')}
                            className="h-11"
                            aria-invalid={!!errors.fullName}
                            {...register('fullName')}
                        />
                        <InputError message={errors.fullName?.message} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="sr-only">
                            {t('auth.email')}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            dir="ltr"
                            autoComplete="email"
                            placeholder={t('auth.email')}
                            className="h-11 placeholder:text-start"
                            aria-invalid={!!errors.email}
                            {...register('email')}
                        />
                        <InputError message={errors.email?.message} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="sr-only">
                            {t('auth.password')}
                        </Label>
                        <PasswordInput
                            id="password"
                            autoComplete="new-password"
                            placeholder={t('auth.passwordNew')}
                            className="h-11"
                            aria-invalid={!!errors.password}
                            {...register('password')}
                        />
                        <InputError message={errors.password?.message} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="confirmation" className="sr-only">
                            {t('auth.passwordConfirm')}
                        </Label>
                        <PasswordInput
                            id="confirmation"
                            autoComplete="new-password"
                            placeholder={t('auth.passwordConfirm')}
                            className="h-11"
                            aria-invalid={!!errors.confirmation}
                            {...register('confirmation')}
                        />
                        <InputError message={errors.confirmation?.message} />
                    </div>

                    {serverError && (
                        <InputError
                            role="alert"
                            message={serverError}
                            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2"
                        />
                    )}

                    <Button
                        type="submit"
                        size="xl"
                        className="mt-2 w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Spinner />}
                        {t('auth.registerSubmit')}
                    </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    {t('auth.haveAccount')}{' '}
                    <Link
                        href={withNext('/login')}
                        className="font-semibold text-foreground underline decoration-lime decoration-[3px] underline-offset-4"
                    >
                        {t('auth.signIn')}
                    </Link>
                </p>
            </form>
        </>
    );
}
