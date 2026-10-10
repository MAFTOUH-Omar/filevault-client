import { useId } from 'react';

const taille_maille_px = 40;

/**
 * Quadrillage SVG estompé depuis le haut (repris de player_portail), à poser dans un parent
 * `relative overflow-hidden`.
 */
export default function GridPattern() {
    const id_pattern = useId();

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]"
        >
            <svg className="pointer-events-none absolute inset-0 size-full stroke-foreground/20">
                <defs>
                    <pattern
                        id={id_pattern}
                        width={taille_maille_px}
                        height={taille_maille_px}
                        patternUnits="userSpaceOnUse"
                        x={20}
                        y={-1}
                    >
                        <path
                            d={`M.5 ${taille_maille_px}V.5H${taille_maille_px}`}
                            fill="none"
                        />
                    </pattern>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    strokeWidth={0}
                    fill={`url(#${id_pattern})`}
                />
            </svg>
        </div>
    );
}
