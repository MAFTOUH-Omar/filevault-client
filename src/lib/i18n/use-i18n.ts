'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { DEFAULT_LOCALE, LOCALE_META } from './config';
import type { Locale } from './config';
import {
    getLocale,
    initLocale,
    pluralIn,
    setLocale,
    subscribeLocale,
    translateIn,
} from './store';
import type { Params, PluralKey, TextKey } from './types';

/** À monter une fois : applique la langue mémorisée (`lang` de <html>) après l'hydratation. */
export function useLocaleSync(): void {
    useEffect(() => {
        initLocale();
    }, []);
}

export function useI18n() {
    const locale: Locale = useSyncExternalStore(
        subscribeLocale,
        getLocale,
        () => DEFAULT_LOCALE,
    );

    return useMemo(() => {
        const meta = LOCALE_META[locale];

        return {
            locale,
            setLocale,
            t: (key: TextKey, params?: Params) => translateIn(locale, key, params),
            tn: (key: PluralKey, count: number, params?: Params) =>
                pluralIn(locale, key, count, params),
            formatDate: (iso: string) =>
                new Intl.DateTimeFormat(meta.intl, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }).format(new Date(iso)),
            formatBytes: (bytes: number) => {
                if (bytes <= 0) {
                    return `0 ${meta.units[0]}`;
                }

                const index = Math.min(
                    Math.floor(Math.log(bytes) / Math.log(1024)),
                    meta.units.length - 1,
                );
                const value = bytes / 1024 ** index;
                const digits = index === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;

                return `${new Intl.NumberFormat(meta.intl, {
                    maximumFractionDigits: digits,
                }).format(value)} ${meta.units[index]}`;
            },
        };
    }, [locale]);
}
