'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance } from '@/hooks/use-appearance';
import { LOCALES, LOCALE_META } from '@/lib/i18n/config';
import type { TextKey } from '@/lib/i18n/types';
import { useI18n } from '@/lib/i18n/use-i18n';
import { getElementCenter } from '@/lib/view-transition';
import { cn } from '@/lib/utils';
import { SettingsRow, SettingsSection } from './settings-ui';

const themes: { value: Appearance; labelKey: TextKey; icon: LucideIcon }[] = [
    { value: 'light', labelKey: 'settings.appearance.light', icon: Sun },
    { value: 'dark', labelKey: 'settings.appearance.dark', icon: Moon },
    { value: 'system', labelKey: 'settings.appearance.system', icon: Monitor },
];

/** Choix exclusif en pastilles (le bouton actif ressort sur le fond du groupe). */
function Segmented({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div
            role="radiogroup"
            aria-label={label}
            className="inline-flex rounded-lg bg-muted p-1"
        >
            {children}
        </div>
    );
}

function Segment({
    selected,
    onSelect,
    lang,
    children,
}: {
    selected: boolean;
    onSelect: (button: HTMLButtonElement) => void;
    lang?: string;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            role="radio"
            lang={lang}
            aria-checked={selected}
            onClick={(event) => onSelect(event.currentTarget)}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
                selected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
            )}
        >
            {children}
        </button>
    );
}

export function AppearanceSettings() {
    const { appearance, updateAppearance } = useAppearance();
    const { t, locale, setLocale } = useI18n();

    return (
        <SettingsSection title={t('settings.appearance.section')}>
            <SettingsRow
                title={t('settings.appearance.themeTitle')}
                description={t('settings.appearance.themeText')}
            >
                <Segmented label={t('settings.appearance.themeTitle')}>
                    {themes.map(({ value, labelKey, icon: Icon }) => (
                        <Segment
                            key={value}
                            selected={appearance === value}
                            onSelect={(button) =>
                                updateAppearance(value, getElementCenter(button))
                            }
                        >
                            <Icon className="size-4" />
                            {t(labelKey)}
                        </Segment>
                    ))}
                </Segmented>
            </SettingsRow>
            <SettingsRow
                title={t('settings.appearance.languageTitle')}
                description={t('settings.appearance.languageText')}
            >
                <Segmented label={t('settings.appearance.languageTitle')}>
                    {LOCALES.map((code) => (
                        <Segment
                            key={code}
                            lang={code}
                            selected={locale === code}
                            onSelect={(button) =>
                                setLocale(code, getElementCenter(button))
                            }
                        >
                            {LOCALE_META[code].label}
                        </Segment>
                    ))}
                </Segmented>
            </SettingsRow>
        </SettingsSection>
    );
}
