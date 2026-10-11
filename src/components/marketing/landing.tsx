'use client';

import {
    ArrowRight,
    Clock,
    KeyRound,
    ShieldCheck,
    UploadCloud,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ArtImage } from '@/components/art-image';
import Highlight from '@/components/motion/highlight';
import Reveal from '@/components/motion/reveal';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GridPattern from './grid-pattern';
import { HeroFloaters } from './hero-floaters';
import { useAuth } from '@/lib/auth/auth-provider';
import type { TextKey } from '@/lib/i18n/types';
import { useI18n } from '@/lib/i18n/use-i18n';

const features: {
    icon: LucideIcon;
    title: TextKey;
    text: TextKey;
}[] = [
    {
        icon: UploadCloud,
        title: 'marketing.upload.title',
        text: 'marketing.upload.text',
    },
    {
        icon: Clock,
        title: 'marketing.links.title',
        text: 'marketing.links.text',
    },
    {
        icon: ShieldCheck,
        title: 'marketing.roles.title',
        text: 'marketing.roles.text',
    },
    {
        icon: KeyRound,
        title: 'marketing.account.title',
        text: 'marketing.account.text',
    },
];

export function Landing() {
    const { status } = useAuth();
    const { t } = useI18n();
    const signedIn = status === 'authenticated';
    const target = signedIn ? '/files' : '/register';

    return (
        <>
            <section className="overflow-hidden">
                <div className="bg-dots absolute inset-x-0 top-0 -z-10 h-[40rem] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <div className="relative mx-auto max-w-6xl px-4 pt-[calc(var(--spacing-navbar)+4rem)] pb-16 text-center sm:px-6 sm:pt-[calc(var(--spacing-navbar)+6rem)]">
                    <div className="relative">
                        <HeroFloaters />
                        <Reveal>
                            <Badge
                                variant="lime"
                                className="mb-6 px-2.5 py-0.5"
                            >
                                <span className="size-1.5 animate-pulse rounded-full bg-lime-deep" />
                                {t('marketing.heroBadge')}
                            </Badge>
                        </Reveal>
                        <Reveal delay_s={0.08}>
                            <h1 className="mx-auto max-w-4xl font-display text-[2.8rem] leading-[1.02] font-extrabold sm:text-7xl">
                                {t('marketing.heroTitle')}{' '}
                                <Highlight delay_s={0.5}>
                                    {t('marketing.heroHighlight')}
                                </Highlight>
                            </h1>
                        </Reveal>
                        <Reveal delay_s={0.16}>
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                                {t('marketing.heroText')}
                            </p>
                        </Reveal>
                        <Reveal delay_s={0.24}>
                            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button asChild variant="lime" size="xl">
                                    <Link href={target}>
                                        {signedIn
                                            ? t('marketing.openVault')
                                            : t('marketing.createVault')}
                                        <ArrowRight />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="xl">
                                    <a href="#features">
                                        {t('marketing.discover')}
                                    </a>
                                </Button>
                            </div>
                        </Reveal>
                    </div>

                    {/* Visuel facultatif : public/images/hero-main.webp (1536×1024). */}
                    <Reveal delay_s={0.32} y_px={0} scale_initial={0.96}>
                        <ArtImage
                            src="/images/hero-main.webp"
                            width={1536}
                            height={1024}
                            className="mx-auto mt-14 w-full max-w-4xl rounded-3xl shadow-lift"
                        />
                    </Reveal>
                </div>
            </section>

            <section
                id="features"
                className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-28 sm:px-6"
            >
                <Reveal>
                    <h2 className="mx-auto max-w-2xl text-center font-display text-4xl font-extrabold sm:text-5xl">
                        {t('marketing.featuresTitle')}
                    </h2>
                </Reveal>
                <div className="mt-14 overflow-hidden rounded-lg border border-border">
                    <Stagger className="-me-px -mb-px grid sm:grid-cols-2 lg:grid-cols-4">
                        {features.map(({ icon: Icon, title, text }) => (
                            <StaggerItem
                                key={title}
                                className="relative overflow-hidden border-e border-b border-border bg-background p-6"
                            >
                                <GridPattern />
                                <span className="relative flex size-11 items-center justify-center rounded-xl bg-lime text-night">
                                    <Icon className="size-5" />
                                </span>
                                <h3 className="relative mt-10 font-display text-xl font-bold">
                                    {t(title)}
                                </h3>
                                <p className="relative mt-2 text-sm text-foreground/80">
                                    {t(text)}
                                </p>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </section>

            <section className="px-4 pb-24 sm:px-6">
                <Reveal>
                    <div className="mx-auto max-w-4xl rounded-3xl bg-night px-6 py-14 text-center text-white shadow-lift sm:px-12">
                        <h2 className="font-display text-3xl font-extrabold sm:text-5xl">
                            {t('marketing.ctaTitle')}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-white/70">
                            {t('marketing.ctaText')}
                        </p>
                        <Button
                            asChild
                            variant="lime"
                            size="xl"
                            className="mt-8"
                        >
                            <Link href={target}>
                                {signedIn
                                    ? t('marketing.openVault')
                                    : t('marketing.ctaStart')}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </Reveal>
            </section>
        </>
    );
}
