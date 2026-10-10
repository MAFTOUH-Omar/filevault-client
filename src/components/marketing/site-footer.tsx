'use client';

import { useI18n } from '@/lib/i18n/use-i18n';

export function SiteFooter() {
    const { t } = useI18n();

    return (
        <footer className="border-t py-4 text-center text-xs text-muted-foreground">
            {t('marketing.footer')}
        </footer>
    );
}
