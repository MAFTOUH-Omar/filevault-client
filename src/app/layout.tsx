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

const SITE_NAME = 'FileVault';
const SITE_TITLE = 'FileVault — Votre coffre-fort de fichiers';
const SITE_DESCRIPTION =
    'Stockez, retrouvez et partagez vos fichiers en toute sécurité. Envoi direct et chiffré, quota clair, accès contrôlé.';

// Image de partage (réseaux sociaux, messageries) servie depuis /public.
const OG_IMAGE = {
    url: '/og-image.webp',
    width: 1400,
    height: 876,
    type: 'image/webp',
    alt: 'FileVault — aperçu de l’application',
};

export const metadata: Metadata = {
    // Rend les URLs relatives (og:image…) absolues : à définir en prod via NEXT_PUBLIC_SITE_URL.
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    ),
    applicationName: SITE_NAME,
    title: {
        default: SITE_TITLE,
        template: '%s · FileVault',
    },
    description: SITE_DESCRIPTION,
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        siteName: SITE_NAME,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: [OG_IMAGE],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: [OG_IMAGE.url],
    },
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
