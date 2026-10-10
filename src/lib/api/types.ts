/** Contrats de l'API filevault-server (voir ses records `response/*`). */

export type UserSummary = {
    id: string;
    email: string;
    fullName: string;
    storageUsedBytes: number;
    /**
     * Le serveur n'expose pas encore le quota de l'utilisateur : tant que ce champ est absent,
     * l'interface n'affiche que l'espace utilisé. `null` = illimité.
     */
    storageQuotaBytes?: number | null;
    roles: string[];
    permissions: string[];
};

export type AuthResponse = {
    accessToken: string;
    tokenType: 'Bearer';
    expiresInSeconds: number;
    user: UserSummary;
};

export type StoredFile = {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    status: 'PENDING' | 'READY';
    createdAt: string;
};

export type UploadTicket = {
    file: StoredFile;
    uploadMethod: 'PUT';
    /** Credential : ne jamais l'afficher ni le journaliser. */
    uploadUrl: string;
    uploadHeaders: Record<string, string>;
    expiresAt: string;
};

export type DownloadLink = {
    /** Credential : ne jamais l'afficher ni le journaliser. */
    downloadUrl: string;
    fileName: string;
    expiresAt: string;
};

export type Page<T> = {
    items: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
};

export type Role = {
    id: number;
    name: string;
    /** `null` = quota illimité. */
    storageQuotaBytes: number | null;
    permissions: string[];
};

export type Permission = {
    name: string;
    description: string;
};

export type ApiErrorBody = {
    code: string;
    message: string;
};

/** Permissions portées par le jeton d'accès (`UserSummary.permissions`). */
export const PERMISSIONS = {
    filesRead: 'files:read',
    filesUpload: 'files:upload',
    filesDelete: 'files:delete',
    filesManageAll: 'files:manage-all',
    rolesRead: 'roles:read',
    rolesCreate: 'roles:create',
    rolesUpdate: 'roles:update',
    rolesDelete: 'roles:delete',
    rolesAssign: 'roles:assign',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
