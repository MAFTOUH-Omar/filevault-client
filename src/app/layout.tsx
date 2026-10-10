import type { Metadata } from 'next';
import { Gluten, Ubuntu } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/providers';
import { ThemeSync } from '@/components/providers/theme-sync';
import { THEME_INIT_SCRIPT } from '@/lib/theme-init';

// Texte courant. `latin-ext` : au cas où un nom de fichier/utilisateur sort du latin de base.
const ubuntu = Ubuntu({
    variable: '--font-ubuntu',
    subsets: ['latin', 'latin-ext'],
    weight: ['300', '400', '500', '700'],
    style: ['normal', 'italic'],
    display: 'swap',
});

// Titres (variable 100–900 : aucun gras synthétique).
const gluten = Gluten({
    variable: '--font-gluten',
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'FileVault — Votre coffre-fort de fichiers',
        template: '%s · FileVault',
    },
    description:
        'Stockez, retrouvez et partagez vos fichiers en toute sécurité. Envoi direct et chiffré, quota clair, accès contrôlé.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        // `suppressHydrationWarning` : le script inline ci-dessous pose la classe `dark` avant l'hydratation.
        <html
            lang="fr"
            className={`${ubuntu.variable} ${gluten.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <head>
                <script
                    dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
                />
            </head>
            {/* Les extensions (ColorZilla : cz-shortcut-listen, Grammarly…) injectent des attributs sur <body>. */}
            <body className="min-h-full font-sans" suppressHydrationWarning>
                <Providers>
                    <ThemeSync />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
