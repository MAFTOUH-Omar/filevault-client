/** Faux écran « Mes fichiers » flouté derrière la carte d'authentification (décoratif, sans texte). */
export default function AuthBackdrop() {
    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 blur-[6px] select-none"
            >
                <div className="mx-auto max-w-5xl px-6 pt-10 opacity-25">
                    <div className="h-9 w-56 rounded bg-foreground/50" />
                    <div className="mt-4 h-3 w-[34rem] max-w-full rounded bg-foreground/40" />
                    <div className="mt-2 h-3 w-64 rounded bg-foreground/40" />
                </div>
                <div className="mx-auto mt-8 max-w-5xl px-6 opacity-20">
                    <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-foreground/40">
                        <div className="h-11 w-44 rounded-lg bg-lime" />
                    </div>
                    <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/20">
                        {[0, 1, 2, 3, 4, 5].map((row) => (
                            <div
                                key={row}
                                className="flex items-center gap-4 border-b border-foreground/10 p-4 last:border-0"
                            >
                                <div className="size-6 rounded bg-foreground/40" />
                                <div className="h-3 w-48 rounded bg-foreground/40" />
                                <div className="ms-auto h-3 w-16 rounded bg-foreground/30" />
                                <div className="hidden h-3 w-28 rounded bg-foreground/30 md:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 bg-background/60" />
        </>
    );
}
