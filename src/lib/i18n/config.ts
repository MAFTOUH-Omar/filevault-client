export const LOCALES = ['fr', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';

export const LOCALE_STORAGE_KEY = 'locale';

export const LOCALE_META: Record<
    Locale,
    {
        /** Nom de la langue dans sa propre langue. */
        label: string;
        short: string;
        /** Locale BCP 47 pour `Intl` (dates, nombres, pluriels). */
        intl: string;
        /** Unités d'octets. */
        units: readonly string[];
    }
> = {
    fr: {
        label: 'Français',
        short: 'FR',
        intl: 'fr-FR',
        units: ['o', 'Ko', 'Mo', 'Go', 'To'],
    },
    en: {
        label: 'English',
        short: 'EN',
        intl: 'en-GB',
        units: ['B', 'KB', 'MB', 'GB', 'TB'],
    },
};

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Langue choisie (stockage local), sinon celle du navigateur, sinon le français. */
export function detectLocale(): Locale {
    try {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY);

        if (isLocale(stored)) {
            return stored;
        }
    } catch {
        // Stockage indisponible : on retombe sur la langue du navigateur.
    }

    for (const language of navigator.languages ?? [navigator.language]) {
        const base = language.toLowerCase().split('-')[0];

        if (isLocale(base)) {
            return base;
        }
    }

    return DEFAULT_LOCALE;
}
