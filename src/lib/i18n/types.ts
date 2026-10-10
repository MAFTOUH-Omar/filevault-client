import type { fr } from './dictionaries/fr';

/** Catégories de pluriel d'`Intl.PluralRules` ; `other` est obligatoire (repli). */
export type PluralForms = {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
};

type Shape<T> = {
    [K in keyof T]: T[K] extends string
        ? string
        : T[K] extends { other: string }
          ? PluralForms
          : Shape<T[K]>;
};

/** Forme que chaque langue doit respecter, déduite du dictionnaire français. */
export type Translation = Shape<typeof fr>;

type StringKeys<T> = {
    [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends { other: string }
          ? never
          : `${K}.${StringKeys<T[K]>}`;
}[keyof T & string];

type PluralKeys<T> = {
    [K in keyof T & string]: T[K] extends string
        ? never
        : T[K] extends { other: string }
          ? K
          : `${K}.${PluralKeys<T[K]>}`;
}[keyof T & string];

/** Clé de texte simple, ex. `files.title` (vérifiée à la compilation). */
export type TextKey = StringKeys<typeof fr>;

/** Clé de pluriel, ex. `files.count`. */
export type PluralKey = PluralKeys<typeof fr>;

export type Params = Record<string, string | number>;
