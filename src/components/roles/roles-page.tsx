'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { Forbidden } from '@/components/forbidden';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { listRoles } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { PERMISSIONS } from '@/lib/api/types';
import type { Role } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { RoleAssignDialog } from './role-assign-dialog';
import { RoleDeleteDialog } from './role-delete-dialog';
import { RoleFormDialog } from './role-form-dialog';
import { RolePermissionsSheet } from './role-permissions-sheet';

const PAGE_SIZE = 15;

function IconAction({
    label,
    onClick,
    children,
    destructive = false,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
    destructive?: boolean;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={label}
                    className={destructive ? 'text-destructive hover:text-destructive' : undefined}
                    onClick={onClick}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

export function RolesPage() {
    const { can } = useAuth();
    const { t, tn, formatBytes } = useI18n();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const debouncedSearch = useDebouncedValue(search.trim());
    const [formRole, setFormRole] = useState<Role | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [toDelete, setToDelete] = useState<Role | null>(null);
    const [toAssign, setToAssign] = useState<Role | null>(null);
    const [toInspect, setToInspect] = useState<Role | null>(null);

    const allowed = can(PERMISSIONS.rolesRead);

    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: ['roles', { search: debouncedSearch, page }],
        queryFn: () =>
            listRoles({ search: debouncedSearch, page, size: PAGE_SIZE }),
        placeholderData: keepPreviousData,
        enabled: allowed,
    });

    if (!allowed) {
        return <Forbidden permission={PERMISSIONS.rolesRead} />;
    }

    const openForm = (role: Role | null) => {
        setFormRole(role);
        setFormKey((current) => current + 1);
        setIsFormOpen(true);
    };

    return (
        <>
            <PageHeader
                title={t('roles.title')}
                description={t('roles.description')}
                actions={
                    can(PERMISSIONS.rolesCreate) && (
                        <Button variant="lime" onClick={() => openForm(null)}>
                            <Plus /> {t('roles.newRole')}
                        </Button>
                    )
                }
            />

            <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(0);
                    }}
                    placeholder={t('roles.search')}
                    aria-label={t('roles.searchAria')}
                    className="ps-9"
                />
            </div>

            {isPending && (
                <div className="space-y-2">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        {errorMessage(error)}
                    </p>
                    <Button variant="outline" onClick={() => void refetch()}>
                        {t('common.retry')}
                    </Button>
                </div>
            )}

            {data && data.items.length === 0 && (
                <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    {t('roles.noResult')}
                </p>
            )}

            {data && data.items.length > 0 && (
                <div className="overflow-hidden rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>{t('roles.colRole')}</TableHead>
                                <TableHead>{t('roles.colQuota')}</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    {t('roles.colPermissions')}
                                </TableHead>
                                <TableHead className="text-end">
                                    <span className="sr-only">{t('files.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.items.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">
                                        {role.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground tabular-nums">
                                        {role.storageQuotaBytes === null ? (
                                            <Badge variant="lime">{t('roles.unlimited')}</Badge>
                                        ) : (
                                            formatBytes(role.storageQuotaBytes)
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden text-muted-foreground md:table-cell">
                                        {tn(
                                            'roles.permissionsCount',
                                            role.permissions.length,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-0.5">
                                            <IconAction
                                                label={t('roles.view')}
                                                onClick={() => setToInspect(role)}
                                            >
                                                <Eye />
                                            </IconAction>
                                            {can(PERMISSIONS.rolesAssign) && (
                                                <IconAction
                                                    label={t('roles.assign')}
                                                    onClick={() => setToAssign(role)}
                                                >
                                                    <UserPlus />
                                                </IconAction>
                                            )}
                                            {can(PERMISSIONS.rolesUpdate) && (
                                                <IconAction
                                                    label={t('roles.edit')}
                                                    onClick={() => openForm(role)}
                                                >
                                                    <Pencil />
                                                </IconAction>
                                            )}
                                            {can(PERMISSIONS.rolesDelete) && (
                                                <IconAction
                                                    label={t('roles.remove')}
                                                    destructive
                                                    onClick={() => setToDelete(role)}
                                                >
                                                    <Trash2 />
                                                </IconAction>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {t('roles.pageInfo', {
                            page: data.page + 1,
                            total: data.totalPages,
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

            <RoleFormDialog
                key={formKey}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                role={formRole}
            />
            <RoleDeleteDialog
                key={`delete-${toDelete?.id}`}
                role={toDelete} onClose={() => setToDelete(null)} />
            <RoleAssignDialog
                key={`assign-${toAssign?.id}`}
                role={toAssign} onClose={() => setToAssign(null)} />
            <RolePermissionsSheet
                role={toInspect}
                onClose={() => setToInspect(null)}
            />
        </>
    );
}
