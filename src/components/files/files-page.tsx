'use client';

import { Forbidden } from '@/components/forbidden';
import { PageHeader } from '@/components/page-header';
import { PERMISSIONS } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { useI18n } from '@/lib/i18n/use-i18n';
import { FileList } from './file-list';
import { UploadZone } from './upload-zone';
import { StorageMeter } from '@/components/layout/storage-meter';

export function FilesPage() {
    const { user, can } = useAuth();
    const { t } = useI18n();

    if (!can(PERMISSIONS.filesRead)) {
        return <Forbidden permission={PERMISSIONS.filesRead} />;
    }

    return (
        <>
            <PageHeader
                title={t('files.title')}
                description={t('files.description')}
            />

            {user && (
                <div className="rounded-xl border bg-card p-4 shadow-soft">
                    <StorageMeter user={user} />
                </div>
            )}

            {can(PERMISSIONS.filesUpload) && <UploadZone />}
            <FileList />
        </>
    );
}
