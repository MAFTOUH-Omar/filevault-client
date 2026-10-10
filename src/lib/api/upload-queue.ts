import { errorMessage } from './errors';
import { uploadFile } from './upload';

export type UploadChange = {
    status?: 'uploading' | 'done' | 'error';
    progress?: number;
    error?: string;
};

/** Envois simultanés : assez pour saturer la bande passante sans écraser le rate limit global (100/min). */
const ENVOIS_SIMULTANES = 3;

/** File d'attente d'envois : au plus `ENVOIS_SIMULTANES` en vol, le reste patiente. */
export class UploadQueue {
    private readonly waiting: { id: string; file: File }[] = [];
    private readonly running = new Map<string, AbortController>();

    private onSettled: () => void = () => undefined;

    constructor(
        private readonly onChange: (id: string, change: UploadChange) => void,
    ) {}

    /** Appelé après chaque envoi terminé (succès ou échec) : quota et liste à rafraîchir. */
    setOnSettled(callback: () => void): void {
        this.onSettled = callback;
    }

    add(id: string, file: File): void {
        this.waiting.push({ id, file });
        this.drain();
    }

    /** Annule un envoi en cours ou retire un envoi en attente. */
    cancel(id: string): void {
        const index = this.waiting.findIndex((entry) => entry.id === id);

        if (index >= 0) {
            this.waiting.splice(index, 1);
        }

        this.running.get(id)?.abort();
    }

    cancelAll(): void {
        this.waiting.length = 0;
        this.running.forEach((controller) => controller.abort());
    }

    private drain(): void {
        while (
            this.running.size < ENVOIS_SIMULTANES &&
            this.waiting.length > 0
        ) {
            this.start(this.waiting.shift()!);
        }
    }

    private start({ id, file }: { id: string; file: File }): void {
        const controller = new AbortController();
        this.running.set(id, controller);

        uploadFile(
            file,
            (ratio) => this.onChange(id, { progress: Math.round(ratio * 100) }),
            controller.signal,
        )
            .then(() => this.onChange(id, { status: 'done', progress: 100 }))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                this.onChange(id, {
                    status: 'error',
                    error: errorMessage(error),
                });
            })
            .finally(() => {
                this.running.delete(id);
                this.onSettled();
                this.drain();
            });
    }
}
