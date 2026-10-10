import { translate } from '@/lib/i18n/store';
import type { TextKey } from '@/lib/i18n/types';
import { ApiError } from './client';

/** Code d'erreur de l'API → clé de traduction. */
const BY_CODE: Record<string, TextKey> = {
    EMAIL_ALREADY_USED: 'errors.emailUsed',
    ROLE_ALREADY_EXISTS: 'errors.roleExists',
    ROLE_HAS_USERS: 'errors.roleHasUsers',
    STORAGE_QUOTA_EXCEEDED: 'errors.quotaExceeded',
    FILE_TOO_LARGE: 'errors.fileTooLarge',
    UPLOAD_NOT_RECEIVED: 'errors.uploadNotReceived',
    UPLOAD_SIZE_MISMATCH: 'errors.uploadMismatch',
    STORAGE_UNAVAILABLE: 'errors.storageUnavailable',
    RATE_LIMIT_EXCEEDED: 'errors.rateLimit',
    IP_BLOCKED: 'errors.ipBlocked',
    NETWORK_ERROR: 'errors.network',
    STORAGE_REJECTED: 'errors.storageRejected',
    UPLOAD_NETWORK_ERROR: 'errors.uploadNetwork',
    UNKNOWN: 'errors.generic',
};

const BY_STATUS: Record<number, TextKey> = {
    401: 'errors.unauthorized',
    403: 'errors.forbidden',
    404: 'errors.notFound',
    429: 'errors.tooMany',
    503: 'errors.unavailable',
};

/** Message affichable, dans la langue courante, pour n'importe quelle erreur (jamais de détail technique). */
export function errorMessage(error: unknown): string {
    if (!(error instanceof ApiError)) {
        return translate('errors.unexpected');
    }

    const byCode = BY_CODE[error.code];

    if (byCode) {
        return translate(byCode);
    }

    // Le serveur ajoute « Warning: … your IP will be blocked » : à garder tel quel.
    if (
        (error.code === 'UNAUTHORIZED' || error.status === 429) &&
        /warning/i.test(error.message)
    ) {
        return error.message;
    }

    // Les 400 de validation portent un message précis (en anglais, côté serveur) mais utile.
    if (error.code === 'VALIDATION_ERROR' || error.code === 'BAD_REQUEST') {
        return error.message;
    }

    const byStatus = BY_STATUS[error.status];

    return byStatus ? translate(byStatus) : error.message;
}
