import {
    File,
    FileArchive,
    FileAudio,
    FileImage,
    FileText,
    FileVideo,
} from 'lucide-react';

export function FileIcon({
    contentType,
    className,
}: {
    contentType: string;
    className?: string;
}) {
    if (contentType.startsWith('image/')) {
        return <FileImage className={className} />;
    }

    if (contentType.startsWith('video/')) {
        return <FileVideo className={className} />;
    }

    if (contentType.startsWith('audio/')) {
        return <FileAudio className={className} />;
    }

    if (contentType === 'application/pdf' || contentType.startsWith('text/')) {
        return <FileText className={className} />;
    }

    if (/zip|rar|tar|7z|gzip/.test(contentType)) {
        return <FileArchive className={className} />;
    }

    return <File className={className} />;
}
