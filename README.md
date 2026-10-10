# FileVault — client web

Front Next.js 16 (App Router, React 19, Tailwind 4) qui consomme l'API `filevault-server`.
Le style (thème lime/night, Ubuntu + Gluten, composants shadcn « new-york », animations `motion`)
est repris de `player_portail`.

## Démarrage

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, 8080 par défaut
npm install
npm run dev                  # http://localhost:3000
```

Côté serveur, `CORS_ORIGINS` doit contenir l'origine du front (`http://localhost:3000` par défaut).
En production : `COOKIE_SECURE=true` et le front en HTTPS.

## Architecture

| Dossier | Rôle |
| --- | --- |
| `src/lib/api/client.ts` | `fetch` + jeton d'accès **en mémoire**, renouvellement via le cookie HttpOnly `/auth/refresh` (mutualisé, verrou Web Locks entre onglets) |
| `src/lib/api/endpoints.ts` | un wrapper typé par endpoint (auth, fichiers, rôles) |
| `src/lib/api/upload*.ts` | flux d'upload : réservation → `PUT` direct vers R2 (progression XHR) → confirmation, file à 3 envois simultanés |
| `src/lib/auth/auth-provider.tsx` | état de session, `can(permission)` lu dans le jeton |
| `src/components/ui` | composants shadcn copiés de `player_portail` |
| `src/app/(marketing)` `(auth)` `(app)` | landing, login/register, espace connecté (façon Reddit : barre du haut + sidebar à couleur inversée du thème, tokens `--sidebar-*` de `globals.css`) |

### Langues (fr · en)

Dictionnaires typés dans `src/lib/i18n/dictionaries` : le français fixe les clés, `en` doit avoir
exactement la même forme (sinon erreur TypeScript). `useI18n()` donne `t`, `tn` (pluriels), `formatBytes`,
`formatDate` ; `translate()` sert hors composant (erreurs API, toasts). Le changement de langue
(`LanguageSwitcher`, ou *Paramètres → Apparence*) révèle le nouveau texte en cercle depuis le bouton,
comme le thème (`lib/view-transition.ts`).
Pour ajouter une langue : un fichier de dictionnaire + une entrée dans `lib/i18n/config.ts`.

### Visuels facultatifs (`public/images/`)

Absents, ils sont simplement masqués (`ArtImage`) : `hero-main.webp` (landing), `auth-cover.webp`
(couverture de la modale d'authentification, à défaut un dessin CSS), `empty-vault.webp` (liste vide).

Routes : `/`, `/login`, `/register`, `/files`, `/admin/roles`, `/settings/{profile,security,appearance}`.

## Choix à connaître

- **Pas de garde côté serveur** : le cookie de session appartient à l'API (autre origine), Next ne peut
  pas le lire. L'espace `(app)` est donc protégé côté client (`AppShell`), d'où `export const instant = false`
  sur ses pages (Cache Components).
- **Aucun appel qui échouerait en 401/403 « attendu »** : côté serveur, chaque refus compte pour la
  mise en liste noire de l'IP (6 refus/heure). L'UI masque les actions sans permission et n'appelle pas
  `/auth/refresh` pour un visiteur anonyme. Un 401 n'est rejoué qu'en `GET`
  (un `PUT /auth/me/*` rejoué consommerait le quota de 3 tentatives/jour).
- **Quota** : `/auth/me` n'expose pas encore le quota de l'utilisateur. Le type `UserSummary` prévoit
  `storageQuotaBytes` (`null` = illimité) : dès que le serveur l'ajoute, la jauge s'affiche.
- Interface en français ; les messages d'erreur de l'API (anglais) sont traduits par code dans `lib/api/errors.ts`.
