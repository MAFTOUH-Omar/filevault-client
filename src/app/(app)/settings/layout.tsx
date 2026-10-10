import type { ReactNode } from 'react';
import { SettingsHeader } from '@/components/settings/settings-ui';

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-3xl">
            <SettingsHeader />
            {children}
        </div>
    );
}
