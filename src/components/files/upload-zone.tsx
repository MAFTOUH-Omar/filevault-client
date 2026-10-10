'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CircleAlert, CircleCheck, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { UploadQueue } from '@/lib/api/upload-queue';
import type { UploadChange } from '@/lib/api/upload-queue';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { cn } from '@/lib/utils';

type UploadItem = {
    id: string;
    file: File;
    status: 'uploading' | 'done' | 'error';
    progress: number;
    error?: string;
};

export function UploadZone() {
    const { reloadUser } = useAuth();
    const { t, formatBytes } = useI18n();
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [items, setItems] = useState<UploadItem[]>([]);

    const [queue] = useState(
        () =>
            new UploadQueue((id: string, change: UploadChange) =>
                setItems((current) =>
                    current.map((item) =>
                        item.id === id ? { ...item, ...change } : item,
                    ),
                ),
            ),
    );

    useEffect(() => {
        queue.setOnSettled(() => {
            void queryClient.invalidateQueries({ queryKey: ['files'] });
            void reloadUser().catch(() => undefined);
        });
    }, [queue, queryClient, reloadUser]);

    // Quitter la page annule les envois en cours : leurs réservations expirent côté serveur.
    useEffect(() => () => queue.cancelAll(), [queue]);

    const enqueue = (list: FileList) => {
        const added: UploadItem[] = Array.from(list).map((file) => ({
            id: crypto.randomUUID(),
            file,
            status: 'uploading',
            progress: 0,
        }));

        setItems((current) => [...added, ...current]);
        added.forEach((item) => queue.add(item.id, item.file));
    };

    const dismiss = (id: string) => {
        queue.cancel(id);
        setItems((current) => current.filter((item) => item.id !== id));
    };

    return (
        <section className="space-y-3">
            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);

                    if (event.dataTransfer.files.length > 0) {
                        enqueue(event.dataTransfer.files);
                    }
                }}
                className={cn(
                    'bg-dots flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                    isDragging
                        ? 'border-lime-deep bg-lime-soft'
                        : 'border-border bg-card',
                )}
            >
                <div className="flex size-12 items-center justify-center rounded-full bg-lime text-night shadow-soft">
                    <UploadCloud className="size-6" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium">{t('files.dropTitle')}</p>
                    <p className="text-sm text-muted-foreground">
                        {t('files.dropText')}
                    </p>
                </div>
                <Button variant="lime" onClick={() => inputRef.current?.click()}>
                    {t('files.choose')}
                </Button>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                        if (event.target.files?.length) {
                            enqueue(event.target.files);
                        }

                        // Permet de re-sélectionner le même fichier juste après.
                        event.target.value = '';
                    }}
                />
            </div>

            {items.length > 0 && (
                <ul className="space-y-2" aria-live="polite">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="rounded-lg border bg-card p-3 text-sm"
                        >
                            <div className="flex items-center gap-3">
                                {item.status === 'uploading' && (
                                    <Spinner className="shrink-0" />
                                )}
                                {item.status === 'done' && (
                                    <CircleCheck className="size-4 shrink-0 text-green-600" />
                                )}
                                {item.status === 'error' && (
                                    <CircleAlert className="size-4 shrink-0 text-destructive" />
                                )}
                                <span className="min-w-0 flex-1 truncate font-medium">
                                    {item.file.name}
                                </span>
                                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                    {formatBytes(item.file.size)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    aria-label={
                                        item.status === 'uploading'
                                            ? t('files.cancelUpload', {
                                                  name: item.file.name,
                                              })
                                            : t('files.hideUpload', {
                                                  name: item.file.name,
                                              })
                                    }
                                    onClick={() => dismiss(item.id)}
                                >
                                    <X />
                                </Button>
                            </div>
                            {item.status === 'uploading' && (
                                <Progress
                                    value={item.progress}
                                    className="mt-2 h-1.5"
                                    indicatorClassName="bg-lime-deep"
                                />
                            )}
                            {item.status === 'error' && (
                                <p className="mt-1 text-xs text-destructive">
                                    {item.error}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
