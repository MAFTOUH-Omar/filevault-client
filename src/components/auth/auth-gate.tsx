'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';
import { safeNext, useAuth } from '@/lib/auth/auth-provider';

/** Redirige hors des pages login/register si une session est déjà ouverte. */
function Redirector() {
    const { status } = useAuth();
    const router = useRouter();
    const next = useSearchParams().get('next');

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace(safeNext(next));
        }
    }, [status, next, router]);

    return null;
}

export function AuthGate({ children }: { children: ReactNode }) {
    return (
        <>
            <Suspense>
                <Redirector />
            </Suspense>
            {children}
        </>
    );
}
