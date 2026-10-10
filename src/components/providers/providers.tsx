'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ApiError } from '@/lib/api/client';
import { AuthProvider } from '@/lib/auth/auth-provider';

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: false,
                // Une 4xx est une réponse définitive (droits, introuvable) : inutile de la rejouer,
                // et les 401/403 comptent comme des refus côté serveur (AbuseGuard).
                retry: (failureCount, error) =>
                    !(error instanceof ApiError && error.status < 500) &&
                    failureCount < 2,
            },
        },
    });
}

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(createQueryClient);

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
                <Toaster />
            </AuthProvider>
        </QueryClientProvider>
    );
}
