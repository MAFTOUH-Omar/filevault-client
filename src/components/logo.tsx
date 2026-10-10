import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Pictogramme : un coffre (carré arrondi) fermé par une serrure lime. */
export function LogoMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={className}
        >
            <rect width="100" height="100" rx="22" className="fill-night" />
            <rect
                x="27"
                y="44"
                width="46"
                height="34"
                rx="8"
                className="fill-lime"
            />
            <path
                d="M36 44V35a14 14 0 0 1 28 0v9"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className="stroke-lime"
            />
            <circle cx="50" cy="60" r="5" className="fill-night" />
        </svg>
    );
}

export default function Logo({
    className,
    href = '/',
}: {
    className?: string;
    href?: string;
}) {
    return (
        <Link
            href={href}
            aria-label="FileVault — accueil"
            className={cn('inline-flex items-center gap-2', className)}
        >
            <LogoMark className="size-8 rounded-[22%] dark:ring-1 dark:ring-border" />
            <span className="font-display text-2xl font-extrabold tracking-tight">
                FileVault
            </span>
        </Link>
    );
}
