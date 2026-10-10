import type { ReactNode } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { AuthModal } from '@/components/auth/auth-modal';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGate>
            <AuthModal>{children}</AuthModal>
        </AuthGate>
    );
}
