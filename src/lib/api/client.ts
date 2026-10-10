import type { ApiErrorBody, AuthResponse } from './types';

export const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');

/** Erreur renvoyée par l'API (`{ code, message }`) ou levée côté réseau (`status` = 0). */
export class ApiError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

// ---------------------------------------------------------------------------
// Session : le jeton d'accès ne vit qu'en mémoire (jamais dans le stockage du
// navigateur). Le refresh token, lui, est un cookie HttpOnly posé par l'API.
// ---------------------------------------------------------------------------

/** Marqueur « une session existe peut-être » : évite un /auth/refresh inutile pour un visiteur anonyme. */
const SESSION_HINT_KEY = 'filevault:session';

/** Marge avant expiration à partir de laquelle on renouvelle le jeton de manière proactive. */
const MARGE_RENOUVELLEMENT_MS = 30_000;

let accessToken: string | null = null;
let accessTokenExpiresAt = 0;
let inflightRefresh: Promise<AuthResponse | null> | null = null;
let onSessionLost: (() => void) | null = null;

export function hasSessionHint(): boolean {
    try {
        return localStorage.getItem(SESSION_HINT_KEY) === '1';
    } catch {
        return false;
    }
}

function setSessionHint(value: boolean): void {
    try {
        if (value) {
            localStorage.setItem(SESSION_HINT_KEY, '1');
        } else {
            localStorage.removeItem(SESSION_HINT_KEY);
        }
    } catch {
        // Stockage indisponible (navigation privée stricte) : le hint est facultatif.
    }
}

/** Restaure la session au chargement : sans marqueur, inutile d'interroger le serveur. */
export function restoreSession(): Promise<AuthResponse | null> {
    return hasSessionHint() ? refreshSession() : Promise.resolve(null);
}

/** Enregistre le jeton d'une réponse d'authentification (login, register, refresh). */
export function storeSession(auth: AuthResponse): void {
    accessToken = auth.accessToken;
    accessTokenExpiresAt = Date.now() + auth.expiresInSeconds * 1000;
    setSessionHint(true);
}

export function clearSession(): void {
    accessToken = null;
    accessTokenExpiresAt = 0;
    setSessionHint(false);
}

/** Appelé quand la session ne peut plus être renouvelée (refresh token expiré ou révoqué). */
export function setSessionLostHandler(handler: (() => void) | null): void {
    onSessionLost = handler;
}

// ---------------------------------------------------------------------------
// Requêtes
// ---------------------------------------------------------------------------

async function toApiError(response: Response): Promise<ApiError> {
    try {
        const body = (await response.json()) as Partial<ApiErrorBody>;

        return new ApiError(
            response.status,
            body.code ?? 'UNKNOWN',
            body.message ?? 'Request failed.',
        );
    } catch {
        return new ApiError(
            response.status,
            'UNKNOWN',
            'Request failed.',
        );
    }
}

async function request(path: string, init: RequestInit): Promise<Response> {
    try {
        return await fetch(`${API_URL}${path}`, {
            ...init,
            credentials: 'include',
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }

        throw new ApiError(
            0,
            'NETWORK_ERROR',
            'Cannot reach the server.',
        );
    }
}

function runLocked<T>(task: () => Promise<T>): Promise<T> {
    if (typeof navigator !== 'undefined' && 'locks' in navigator) {
        return navigator.locks.request('filevault:refresh', task) as Promise<T>;
    }

    return task();
}

/**
 * Échange le cookie de refresh contre un nouveau jeton (le serveur fait une rotation).
 * - Mutualisé dans l'onglet (une seule requête en vol) ET entre onglets via Web Locks :
 *   deux onglets présentant le même refresh token périmé compteraient comme des refus
 *   côté serveur (AbuseGuard), jusqu'à la mise en liste noire de l'IP.
 * - Renvoie `null` si la session est perdue ; lève `ApiError` pour une panne réseau/serveur.
 */
export function refreshSession(): Promise<AuthResponse | null> {
    inflightRefresh ??= runLocked(async () => {
        const response = await request('/auth/refresh', { method: 'POST' });

        if (response.status === 401) {
            clearSession();
            // Efface le cookie périmé, sinon chaque visite retenterait (et compterait un refus).
            void request('/auth/logout', { method: 'POST' }).catch(
                () => undefined,
            );

            return null;
        }

        if (!response.ok) {
            throw await toApiError(response);
        }

        const auth = (await response.json()) as AuthResponse;
        storeSession(auth);

        return auth;
    }).finally(() => {
        inflightRefresh = null;
    });

    return inflightRefresh;
}

async function currentAccessToken(): Promise<string | null> {
    if (
        accessToken &&
        accessTokenExpiresAt - Date.now() > MARGE_RENOUVELLEMENT_MS
    ) {
        return accessToken;
    }

    const auth = await refreshSession();

    if (!auth) {
        onSessionLost?.();

        return null;
    }

    return auth.accessToken;
}

type QueryValue = string | number | boolean | undefined | null;

export type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    query?: Record<string, QueryValue>;
    /** `false` pour les routes publiques (login, register…). */
    auth?: boolean;
    signal?: AbortSignal;
};

function buildPath(path: string, query?: Record<string, QueryValue>): string {
    if (!query) {
        return path;
    }

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    }

    const qs = params.toString();

    return qs ? `${path}?${qs}` : path;
}

export async function api<T = void>(
    path: string,
    { method = 'GET', body, query, auth = true, signal }: RequestOptions = {},
): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (auth) {
        const token = await currentAccessToken();

        if (!token) {
            throw new ApiError(401, 'UNAUTHORIZED', 'Session expired.');
        }

        headers.Authorization = `Bearer ${token}`;
    }

    const url = buildPath(path, query);
    const init: RequestInit = {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
    };

    let response = await request(url, init);

    // Rattrapage d'un jeton révoqué/expiré entre deux contrôles. Réservé aux GET : un 401 sur
    // un PUT /auth/me/* signifie « mauvais mot de passe » et rejouer consommerait le quota
    // de 3 tentatives par jour (les mutations sont couvertes par le renouvellement proactif).
    if (auth && response.status === 401 && method === 'GET') {
        accessTokenExpiresAt = 0;
        const token = await currentAccessToken();

        if (token) {
            response = await request(url, {
                ...init,
                headers: { ...headers, Authorization: `Bearer ${token}` },
            });
        }
    }

    if (!response.ok) {
        throw await toApiError(response);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}
