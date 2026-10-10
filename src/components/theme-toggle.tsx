'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { useI18n } from '@/lib/i18n/use-i18n';
import { getElementCenter } from '@/lib/view-transition';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { t } = useI18n();
    const isDark = resolvedAppearance === 'dark';

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('relative', className)}
            aria-label={isDark ? t('a11y.toLight') : t('a11y.toDark')}
            onClick={(event) =>
                updateAppearance(
                    isDark ? 'light' : 'dark',
                    getElementCenter(event.currentTarget),
                )
            }
        >
            <Sun className="size-4 scale-100 rotate-0 transition-transform duration-500 dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform duration-500 dark:scale-100 dark:rotate-0" />
        </Button>
    );
}
