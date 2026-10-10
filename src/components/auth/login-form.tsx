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

const makeSchema = (t: Translate) =>
    z.object({
        email: z.email(t('validation.email')),
        password: z.string().min(1, t('validation.passwordRequired')),
    });

type Values = z.infer<ReturnType<typeof makeSchema>>;

export function LoginForm() {
    const { login } = useAuth();
    const { t } = useI18n();
    useDocumentTitle(t('auth.signIn'));
    const router = useRouter();
    const next = useSearchParams().get('next');
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        resetField,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(makeSchema(t)) });

    const onSubmit = handleSubmit(async ({ email, password }) => {
        setServerError(null);

        try {
            await login(email, password);
            router.replace(safeNext(next));
        } catch (error) {
            setServerError(errorMessage(error));
            resetField('password');
        }
    });

    const withNext = (path: string) =>
        next ? `${path}?next=${encodeURIComponent(next)}` : path;

    return (
        <>
            <AuthHeading
                title={t('auth.loginTitle')}
                description={t('auth.loginText')}
            />

            <form
                onSubmit={onSubmit}
                noValidate
                className="mt-6 flex flex-col gap-5 text-start"
            >
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="sr-only">
                            {t('auth.email')}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            dir="ltr"
                            autoFocus
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
                            autoComplete="current-password"
                            placeholder={t('auth.password')}
                            className="h-11"
                            aria-invalid={!!errors.password}
                            {...register('password')}
                        />
                        <InputError message={errors.password?.message} />
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
                        {t('auth.loginSubmit')}
                    </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    {t('auth.noAccount')}{' '}
                    <Link
                        href={withNext('/register')}
                        className="font-semibold text-foreground underline decoration-lime decoration-[3px] underline-offset-4"
                    >
                        {t('auth.createAccount')}
                    </Link>
                </p>
            </form>
        </>
    );
}
