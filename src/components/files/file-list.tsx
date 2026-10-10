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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border bg-card">
                <Table aria-busy={isPlaceholderData}>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>{t('files.colName')}</TableHead>
                            <TableHead className="hidden sm:table-cell">
                                {t('files.colSize')}
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                                {t('files.colDate')}
                            </TableHead>
                            <TableHead className="w-24 text-end">
                                <span className="sr-only">{t('files.actions')}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.map((file) => (
                            <TableRow key={file.id}>
                                <TableCell className="max-w-0 sm:max-w-xs md:max-w-md">
                                    <div className="flex items-center gap-3">
                                        <FileIcon
                                            contentType={file.contentType}
                                            className="size-5 shrink-0 text-muted-foreground"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {file.fileName}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground sm:hidden">
                                                {formatBytes(file.sizeBytes)}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                                    {formatBytes(file.sizeBytes)}
                                </TableCell>
                                <TableCell className="hidden text-muted-foreground md:table-cell">
                                    {formatDate(file.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t('files.download', { name: file.fileName })}
                                            disabled={
                                                download.isPending &&
                                                download.variables?.id ===
                                                    file.id
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
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setToDelete(file)}
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
