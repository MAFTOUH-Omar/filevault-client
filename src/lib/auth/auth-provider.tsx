'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import {
    clearSession,
    restoreSession,
    setSessionLostHandler,
} from '@/lib/api/client';
import * as endpoints from '@/lib/api/endpoints';
import type { PermissionName, UserSummary } from '@/lib/api/types';
import { translate } from '@/lib/i18n/store';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
    status: AuthStatus;
    user: UserSummary | null;
    /** Vrai si l'utilisateur porte la permission (lue dans son jeton, sans appel réseau). */
    can: (permission: PermissionName) => boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (input: {
        email: string;
        password: string;
        fullName: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    /** Relit `/auth/me` (quota consommé, nouvel email…). */
    reloadUser: () => Promise<void>;
    setUser: (user: UserSummary) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [user, setUser] = useState<UserSummary | null>(null);
    const [status, setStatus] = useState<AuthStatus>('loading');

    // Restauration de session au chargement : seulement si une session a déjà existé ici.
    useEffect(() => {
        let active = true;

        restoreSession()
            .then((auth) => {
                if (!active) {
                    return;
                }

                setUser(auth?.user ?? null);
                setStatus(auth ? 'authenticated' : 'anonymous');
            })
            .catch(() => {
                if (active) {
                    // Serveur injoignable : on ne détruit pas la session, on laisse réessayer.
                    setStatus('anonymous');
                    toast.error(translate('errors.network'));
                }
            });

        return () => {
            active = false;
        };
    }, []);

    // Session perdue en cours de route (refresh token révoqué/expiré).
    useEffect(() => {
        setSessionLostHandler(() => {
            setUser(null);
            setStatus('anonymous');
            queryClient.clear();
            toast.error(translate('errors.sessionExpired'));
        });

        return () => setSessionLostHandler(null);
    }, [queryClient]);

    const login = useCallback(async (email: string, password: string) => {
        const auth = await endpoints.login(email, password);
        setUser(auth.user);
        setStatus('authenticated');
    }, []);

    const register = useCallback(
        async (input: { email: string; password: string; fullName: string }) => {
            const auth = await endpoints.register(input);
            setUser(auth.user);
            setStatus('authenticated');
        },
        [],
    );

    const logout = useCallback(async () => {
        try {
            await endpoints.logout();
        } catch {
            // Même si le serveur est injoignable, on referme la session locale.
            clearSession();
        }

        setUser(null);
        setStatus('anonymous');
        queryClient.clear();
        router.replace('/login');
    }, [queryClient, router]);

    const reloadUser = useCallback(async () => {
        setUser(await endpoints.fetchMe());
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            status,
            user,
            can: (permission) => user?.permissions.includes(permission) ?? false,
            login,
            register,
            logout,
            reloadUser,
            setUser,
        }),
        [status, user, login, register, logout, reloadUser],
    );

    return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth doit être utilisé dans <AuthProvider>.');
    }

    return context;
}

/** Destination après connexion : uniquement un chemin interne (pas d'open redirect). */
export function safeNext(next: string | null, fallback = '/files'): string {
    return next && next.startsWith('/') && !next.startsWith('//')
        ? next
        : fallback;
}
