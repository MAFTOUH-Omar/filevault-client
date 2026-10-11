import { FileIcon as UntitledFileIcon } from '@untitledui/file-icons';

/** Extension du nom de fichier (sans le point, en minuscules), `''` s'il n'y en a pas. */
function extensionOf(fileName: string) {
    const dot = fileName.lastIndexOf('.');

    return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

/**
 * Pastille « type de média » (Untitled UI, variante solide). L'extension donne l'icône la plus
 * précise (pdf, json, xlsx…) ; à défaut, la bibliothèque classe le type MIME par catégorie.
 */
export function FileIcon({
    fileName,
    contentType,
    size = 40,
    className,
}: {
    fileName: string;
    contentType: string;
    size?: number;
    className?: string;
}) {
    return (
        <UntitledFileIcon
            type={extensionOf(fileName) || contentType}
            variant="solid"
            size={size}
            className={className}
            aria-hidden="true"
        />
    );
}
