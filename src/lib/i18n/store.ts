import { flushSync } from 'react-dom';
import { runCircleTransition } from '@/lib/view-transition';
import type { TransitionOrigin } from '@/lib/view-transition';
import {
    DEFAULT_LOCALE,
    LOCALE_META,
    LOCALE_STORAGE_KEY,
    detectLocale,
} from './config';
import type { Locale } from './config';
import { en } from './dictionaries/en';
import { fr } from './dictionaries/fr';
import type { Params, PluralForms, PluralKey, TextKey, Translation } from './types';

const dictionaries: Record<Locale, Translation> = { fr, en };

const listeners = new Set<() => void>();

// Même valeur que le rendu serveur : la vraie langue est appliquée après l'hydratation.
let currentLocale: Locale = DEFAULT_LOCALE;

export const getLocale = (): Locale => currentLocale;

export const subscribeLocale = (callback: () => void) => {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
};

const notify = (): void => listeners.forEach((listener) => listener());

function applyDocumentLocale(locale: Locale): void {
    document.documentElement.lang = locale;
}

/** Au montage : adopte la langue mémorisée / du navigateur. */
export function initLocale(): void {
    currentLocale = detectLocale();
    applyDocumentLocale(currentLocale);
    notify();
}

/**
 * Change de langue. Avec `origin`, le nouveau texte se révèle en cercle depuis ce point
 * (même effet que le changement de thème).
 */
export function setLocale(locale: Locale, origin?: TransitionOrigin): void {
    if (locale === currentLocale) {
        return;
    }

    try {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
        // Stockage indisponible : la langue vaut pour la session seulement.
    }

    runCircleTransition(
        () => {
            currentLocale = locale;
            applyDocumentLocale(locale);
            // La View Transition photographie le DOM juste après ce callback : React doit avoir fini.
            flushSync(notify);
        },
        origin,
        // Seul le texte change : balayage plus lent et régulier pour que le cercle se voie.
        { duration: 1000, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },
    );
}

// --- Traduction ------------------------------------------------------------

function lookup(locale: Locale, key: string): unknown {
    return key
        .split('.')
        .reduce<unknown>(
            (node, part) =>
                node && typeof node === 'object'
                    ? (node as Record<string, unknown>)[part]
                    : undefined,
            dictionaries[locale],
        );
}

function interpolate(template: string, params?: Params): string {
    return params
        ? template.replace(/\{(\w+)\}/g, (match, name: string) =>
              name in params ? String(params[name]) : match,
          )
        : template;
}

export function translateIn(locale: Locale, key: TextKey, params?: Params): string {
    const value = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key);

    return typeof value === 'string' ? interpolate(value, params) : key;
}

export function pluralIn(
    locale: Locale,
    key: PluralKey,
    count: number,
    params?: Params,
): string {
    const forms = (lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key)) as
        | PluralForms
        | undefined;

    if (!forms) {
        return key;
    }

    const category = new Intl.PluralRules(LOCALE_META[locale].intl).select(count);

    return interpolate(forms[category] ?? forms.other, { count, ...params });
}

/** Traduit dans la langue courante, hors composant (messages d'erreur, toasts…). */
export const translate = (key: TextKey, params?: Params): string =>
    translateIn(currentLocale, key, params);
