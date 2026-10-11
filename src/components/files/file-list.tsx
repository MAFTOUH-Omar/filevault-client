'use client';

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArtImage } from '@/components/art-image';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/api/errors';
import {
    createDownloadLink,
    deleteFile,
    listFiles,
} from '@/lib/api/endpoints';
import { PERMISSIONS } from '@/lib/api/types';
import type { StoredFile } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { FileIcon } from './file-icon';

const PAGE_SIZE = 20;

/** Extension du nom de fichier (sans le point, en minuscules). */
function extensionOf(fileName: string) {
    const dot = fileName.lastIndexOf('.');

    return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

export function FileList() {
    const { can, reloadUser } = useAuth();
    const { t, tn, formatBytes, formatDate } = useI18n();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [toDelete, setToDelete] = useState<StoredFile | null>(null);

    const { data, isPending, isError, error, refetch, isPlaceholderData } =
        useQuery({
            queryKey: ['files', page],
            queryFn: () => listFiles(page, PAGE_SIZE),
            placeholderData: keepPreviousData,
        });

    const download = useMutation({
        mutationFn: async (file: StoredFile) => {
            const link = await createDownloadLink(file.id);
            // Lien présigné (attachment) : le navigateur télécharge sans quitter la page.
            const anchor = document.createElement('a');
            anchor.href = link.downloadUrl;
            anchor.rel = 'noopener';
            anchor.click();
        },
        onError: (err) => toast.error(errorMessage(err)),
    });

    const remove = useMutation({
        mutationFn: (file: StoredFile) => deleteFile(file.id),
        onSuccess: async (_data, file) => {
            toast.success(t('files.deleted', { name: file.fileName }));
            setToDelete(null);
            // Si l'on vient de vider la dernière page, on recule d'une page.
            if (data && data.items.length === 1 && page > 0) {
                setPage((current) => current - 1);
            }
            await queryClient.invalidateQueries({ queryKey: ['files'] });
            await reloadUser().catch(() => undefined);
        },
        onError: (err) => {
            toast.error(errorMessage(err));
            setToDelete(null);
        },
    });

    if (isPending) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                    {errorMessage(error)}
                </p>
                <Button variant="outline" onClick={() => void refetch()}>
                    {t('common.retry')}
                </Button>
            </div>
        );
    }

    if (data.totalItems === 0) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
                {/* Visuel facultatif : public/images/empty-vault.webp (800×800, fond transparent). */}
                <ArtImage
                    src="/images/empty-vault.webp"
                    width={800}
                    height={800}
                    className="size-40 object-contain"
                    fallback={
                        <FolderOpen className="size-8 text-muted-foreground" />
                    }
                />
                <p className="font-medium">{t('files.emptyTitle')}</p>
                <p className="text-sm text-muted-foreground">
                    {t('files.emptyText')}
                </p>
            </div>
        );
    }

    // Barre de taille relative au plus gros fichier de la page.
    const largest = Math.max(1, ...data.items.map((file) => file.sizeBytes));

    return (
        <div className="space-y-3">
            <div
                aria-busy={isPlaceholderData}
                className="space-y-2 transition-opacity aria-busy:opacity-60"
            >
                <div
                    aria-hidden="true"
                    className="hidden grid-cols-[minmax(0,1fr)_9rem_11rem_6rem] items-center gap-4 px-5 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid"
                >
                    <span>{t('files.colName')}</span>
                    <span>{t('files.colSize')}</span>
                    <span className="hidden md:block">{t('files.colDate')}</span>
                    <span />
                </div>

                <ul className="space-y-2">
                    {data.items.map((file) => {
                        const extension = extensionOf(file.fileName);
                        const share = Math.max(
                            4,
                            Math.round((file.sizeBytes / largest) * 100),
                        );

                        return (
                            <li
                                key={file.id}
                                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-2xl border bg-card px-4 py-3 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-primary hover:shadow-soft motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:grid-cols-[minmax(0,1fr)_9rem_6rem] sm:px-5 md:grid-cols-[minmax(0,1fr)_9rem_11rem_6rem]"
                            >
                                <div className="flex min-w-0 items-center gap-4">
                                    <FileIcon
                                        fileName={file.fileName}
                                        contentType={file.contentType}
                                        className="shrink-0 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
                                    />
                                    <div className="min-w-0">
                                        <p
                                            className="truncate font-semibold"
                                            title={file.fileName}
                                        >
                                            {file.fileName}
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                            {extension && (
                                                <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium tracking-wide text-foreground/70 uppercase">
                                                    {extension}
                                                </span>
                                            )}
                                            <span className="tabular-nums sm:hidden">
                                                {formatBytes(file.sizeBytes)}
                                            </span>
                                            <span className="truncate md:hidden">
                                                · {formatDate(file.createdAt)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium tabular-nums">
                                        {formatBytes(file.sizeBytes)}
                                    </p>
                                    <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${share}%` }}
                                        />
                                    </div>
                                </div>

                                <p className="hidden text-sm text-muted-foreground md:block">
                                    {formatDate(file.createdAt)}
                                </p>

                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t('files.download', { name: file.fileName })}
                                        className="rounded-full hover:bg-primary hover:text-primary-foreground"
                                        disabled={
                                            download.isPending &&
                                            download.variables?.id === file.id
                                        }
                                        onClick={() => download.mutate(file)}
                                    >
                                        <Download />
                                    </Button>
                                    {can(PERMISSIONS.filesDelete) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t('files.delete', { name: file.fileName })}
                                            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setToDelete(file)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {data.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {t('files.pageInfo', {
                            page: data.page + 1,
                            total: data.totalPages,
                            count: tn('files.count', data.totalItems),
                        })}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 0}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            <ChevronLeft /> {t('common.previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page + 1 >= data.totalPages}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            {t('common.next')} <ChevronRight />
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => !open && setToDelete(null)}
                title={t('files.deleteTitle')}
                description={t('files.deleteText', {
                    name: toDelete?.fileName ?? '',
                })}
                confirmLabel={t('files.deleteConfirm')}
                destructive
                pending={remove.isPending}
                onConfirm={() => toDelete && remove.mutate(toDelete)}
            />
        </div>
    );
}
