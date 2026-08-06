import { he } from './catalogs/he';

/** The Hebrew catalog is the source of truth for the key set; other locales must match its keys. */
export type StringKey = keyof typeof he;
export type Catalog = Record<StringKey, string>;

const catalogs: Record<'he', Catalog> = { he };
export const getCatalog = (locale: 'he'): Catalog => catalogs[locale];
