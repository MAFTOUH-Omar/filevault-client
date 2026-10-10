'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOCALES, LOCALE_META } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/use-i18n';
import { getElementCenter } from '@/lib/view-transition';
import { cn } from '@/lib/utils';

/**
 * Bascule de langue (FR ⇄ EN) : le bouton affiche la langue vers laquelle on bascule et le nouveau
 * texte se révèle en cercle depuis lui, exactement comme `ThemeToggle` pour le thème.
 */
export default function LanguageSwitcher({ className }: { className?: string }) {
    const { locale, setLocale, t } = useI18n();
    const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn('h-9 gap-1.5 px-2.5 text-xs font-bold', className)}
            lang={next}
            aria-label={`${t('language.label')} : ${LOCALE_META[next].label}`}
            onClick={(event) =>
                setLocale(next, getElementCenter(event.currentTarget))
            }
        >
            <Languages className="size-4" />
            {LOCALE_META[next].short}
        </Button>
    );
}
