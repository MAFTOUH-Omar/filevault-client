export type TransitionOrigin = { x: number; y: number };

const duree_transition_ms = 550;
const easing_transition = 'cubic-bezier(0.4, 0, 0.2, 1)';

export type CircleTransitionOptions = {
    duration?: number;
    easing?: string;
};

export const getElementCenter = (element: Element): TransitionOrigin => {
    const rect = element.getBoundingClientRect();

    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * Applique un changement visuel global (thème, langue) avec un cercle qui s'agrandit depuis
 * `origin` (façon Telegram). Sans origine, sans View Transitions API ou avec
 * `prefers-reduced-motion`, le changement est immédiat.
 *
 * `apply` doit mettre le DOM à jour de façon synchrone (utiliser `flushSync` pour un état React).
 *
 * Un changement de thème modifie tous les pixels, donc le cercle se voit sur toute la durée. Un changement
 * de langue ne modifie que le texte : avec l'easing du thème il est révélé en une fraction de la durée
 * (le front part vite), d'où une durée plus longue et un easing quasi linéaire côté appelant.
 */
export function runCircleTransition(
    apply: () => void,
    origin?: TransitionOrigin,
    {
        duration = duree_transition_ms,
        easing = easing_transition,
    }: CircleTransitionOptions = {},
): void {
    const root = document.documentElement;
    const canAnimate =
        origin !== undefined &&
        typeof document.startViewTransition === 'function' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!canAnimate) {
        apply();

        return;
    }

    const rayon_px = Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y),
    );

    root.dataset.themeTransition = '';

    const transition = document.startViewTransition(apply);

    transition.ready
        .then(() =>
            root.animate(
                {
                    clipPath: [
                        `circle(0px at ${origin.x}px ${origin.y}px)`,
                        `circle(${rayon_px}px at ${origin.x}px ${origin.y}px)`,
                    ],
                },
                {
                    duration,
                    easing,
                    pseudoElement: '::view-transition-new(root)',
                },
            ),
        )
        .catch(() => undefined);

    transition.finished
        .catch(() => undefined)
        .finally(() => {
            delete root.dataset.themeTransition;
        });
}
