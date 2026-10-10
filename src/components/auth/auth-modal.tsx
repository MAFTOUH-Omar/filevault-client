'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArtImage } from '@/components/art-image';
import LanguageSwitcher from '@/components/language-switcher';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/use-i18n';
import AuthBackdrop from './auth-backdrop';

/**
 * Couverture : `public/images/auth-cover.webp` (1024×1536, coffre dans la moitié basse sur fond noir),
 * sinon un dessin CSS avec le slogan. Le panneau garde la hauteur du formulaire (login ou inscription) ;
 * `object-cover` + `object-position` gardent le coffre cadré quel que soit le ratio.
 */
function AuthCover() {
    const { t } = useI18n();

    return (
        <div className="relative hidden overflow-hidden bg-night md:block">
            <div
                aria-hidden="true"
                className="absolute -top-24 -end-24 size-72 rounded-full bg-lime/25 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="absolute -start-20 bottom-10 size-56 rounded-full bg-lime/10 blur-3xl"
            />
            <ArtImage
                src="/images/auth-cover.webp"
                width={1024}
                height={1536}
                className="absolute inset-0 size-full object-cover object-[55%_62%]"
                fallback={
                    <p className="absolute inset-x-8 bottom-8 font-display text-3xl leading-[1.1] font-extrabold text-white">
                        {t('auth.coverTitle')}
                    </p>
                }
            />

        </div>
    );
}

/**
 * Pages d'authentification en « modale » plein écran : page floutée derrière,
 * carte bordée, couverture à gauche, titre serif et formulaire à droite.
 */
export function AuthModal({ children }: { children: ReactNode }) {
    const { t } = useI18n();

    return (
        <div className="relative min-h-svh overflow-hidden bg-background">
            <AuthBackdrop />

            <div className="absolute end-3 top-3 z-20 flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />
            </div>

            <div className="relative z-10 flex min-h-svh items-center justify-center p-4 py-16">
                <div className="relative grid w-full max-w-184 translate-y-0 overflow-hidden rounded-2xl border border-border bg-card opacity-100 shadow-[0_2px_0_rgb(0_0_0/0.02),0_24px_60px_-24px_rgb(0_0_0/0.25)] transition-all duration-500 md:min-h-120 md:grid-cols-[17rem_1fr] starting:translate-y-4 starting:opacity-0">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="absolute end-3 top-3 z-10 size-8 text-foreground/60"
                    >
                        <Link href="/" aria-label={t('common.close')}>
                            <X strokeWidth={2.25} />
                        </Link>
                    </Button>

                    <AuthCover />

                    <div className="flex flex-col justify-center p-6 text-center sm:p-9">
                        <Logo className="mx-auto mb-5 md:hidden" />
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Titre + sous-titre de la carte (centrés, police serif). */
export function AuthHeading({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <>
            <h1 className="font-display text-xl leading-tight font-extrabold sm:text-2xl">
                {title}
            </h1>
            <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>
        </>
    );
}
