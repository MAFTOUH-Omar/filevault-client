import { api, storeSession, clearSession } from './client';
import type {
    AuthResponse,
    DownloadLink,
    Page,
    Permission,
    Role,
    StoredFile,
    UploadTicket,
    UserSummary,
} from './types';

// --- Auth -----------------------------------------------------------------

export async function login(
    email: string,
    password: string,
): Promise<AuthResponse> {
    const auth = await api<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
    });
    storeSession(auth);

    return auth;
}

export async function register(input: {
    email: string;
    password: string;
    fullName: string;
}): Promise<AuthResponse> {
    const auth = await api<AuthResponse>('/auth/register', {
        method: 'POST',
        body: input,
        auth: false,
    });
    storeSession(auth);

    return auth;
}

export async function logout(): Promise<void> {
    try {
        await api('/auth/logout', { method: 'POST', auth: false });
    } finally {
        clearSession();
    }
}

export const fetchMe = () => api<UserSummary>('/auth/me');

export const changeEmail = (input: {
    newEmail: string;
    currentPassword: string;
}) => api<UserSummary>('/auth/me/email', { method: 'PUT', body: input });

export const changePassword = (input: {
    currentPassword: string;
    newPassword: string;
}) => api('/auth/me/password', { method: 'PUT', body: input });

// --- Fichiers -------------------------------------------------------------

export const listFiles = (page: number, size: number) =>
    api<Page<StoredFile>>('/api/files', { query: { page, size } });

export const initiateUpload = (input: {
    fileName: string;
    contentType: string;
    sizeBytes: number;
}) =>
    api<UploadTicket>('/api/files', {
        method: 'POST',
        body: input,
    });

export const completeUpload = (id: string) =>
    api<StoredFile>(`/api/files/${id}/complete`, { method: 'POST' });

export const createDownloadLink = (id: string) =>
    api<DownloadLink>(`/api/files/${id}/download`);

export const deleteFile = (id: string) =>
    api(`/api/files/${id}`, { method: 'DELETE' });

// --- Rôles ----------------------------------------------------------------

export const listRoles = (params: {
    search?: string;
    page: number;
    size: number;
}) => api<Page<Role>>('/api/roles', { query: params });

export const getRolePermissions = (id: number) =>
    api<Permission[]>(`/api/roles/${id}/permissions`);

export type RoleInput = { name: string; storageQuotaBytes: number | null };

export const createRole = (input: RoleInput) =>
    api<Role>('/api/roles', { method: 'POST', body: input });

export const updateRole = (id: number, input: RoleInput) =>
    api<Role>(`/api/roles/${id}`, { method: 'PUT', body: input });

export const deleteRole = (id: number, force: boolean) =>
    api(`/api/roles/${id}`, {
        method: 'DELETE',
        query: force ? { force: true } : undefined,
    });

export const assignRole = (id: number, userId: string) =>
    api(`/api/roles/${id}/assign`, { method: 'POST', body: { userId } });

export const unassignRole = (id: number, userId: string) =>
    api(`/api/roles/${id}/assign/${userId}`, { method: 'DELETE' });
