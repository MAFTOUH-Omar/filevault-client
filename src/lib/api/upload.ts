import { ApiError } from './client';
import { completeUpload, initiateUpload } from './endpoints';
import type { StoredFile, UploadTicket } from './types';

/** Le serveur n'accepte que `type/sous-type` sans paramètre : le reste retombe sur du binaire générique. */
const MIME_VALIDE = /^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*\/[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*$/;

/** En-têtes que le navigateur calcule lui-même : les poser à la main est interdit (et inutile). */
const ENTETES_INTERDITS = new Set(['content-length', 'host']);

const TENTATIVES_CONFIRMATION = 4;
const DELAI_CONFIRMATION_MS = 600;

export function contentTypeOf(file: File): string {
    return MIME_VALIDE.test(file.type) ? file.type : 'application/octet-stream';
}

/**
 * Envoie les octets directement à R2 (l'API ne les voit jamais). `XMLHttpRequest` plutôt que
 * `fetch` : c'est le seul moyen d'obtenir la progression de l'envoi.
 */
function putToStorage(
    ticket: UploadTicket,
    file: File,
    onProgress: (ratio: number) => void,
    signal: AbortSignal,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(ticket.uploadMethod, ticket.uploadUrl);

        for (const [name, value] of Object.entries(ticket.uploadHeaders)) {
            if (!ENTETES_INTERDITS.has(name.toLowerCase())) {
                xhr.setRequestHeader(name, value);
            }
        }

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
                onProgress(event.loaded / event.total);
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                onProgress(1);
                resolve();
            } else {
                reject(
                    new ApiError(
                        xhr.status,
                        'STORAGE_REJECTED',
                        'Storage rejected the upload.',
                    ),
                );
            }
        };
        xhr.onerror = () =>
            reject(
                new ApiError(
                    0,
                    'UPLOAD_NETWORK_ERROR',
                    'Upload to storage failed.',
                ),
            );
        xhr.onabort = () =>
            reject(new DOMException('Upload annulé', 'AbortError'));

        signal.addEventListener('abort', () => xhr.abort(), { once: true });
        xhr.send(file);
    });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** R2 peut mettre un instant à rendre l'objet visible : 409 UPLOAD_NOT_RECEIVED se retente. */
async function confirm(id: string): Promise<StoredFile> {
    for (let attempt = 1; ; attempt++) {
        try {
            return await completeUpload(id);
        } catch (error) {
            const retryable =
                error instanceof ApiError &&
                error.code === 'UPLOAD_NOT_RECEIVED' &&
                attempt < TENTATIVES_CONFIRMATION;

            if (!retryable) {
                throw error;
            }

            await wait(DELAI_CONFIRMATION_MS * attempt);
        }
    }
}

/** Flux complet : réservation du quota → PUT vers R2 → confirmation. */
export async function uploadFile(
    file: File,
    onProgress: (ratio: number) => void,
    signal: AbortSignal,
): Promise<StoredFile> {
    const ticket = await initiateUpload({
        fileName: file.name,
        contentType: contentTypeOf(file),
        sizeBytes: file.size,
    });

    await putToStorage(ticket, file, onProgress, signal);

    return confirm(ticket.file.id);
}
