import { DEFAULT_LOCALE, type Locale } from './locale';
import { getCatalog, type StringKey } from './catalog';

let current: Locale = DEFAULT_LOCALE;
export const setLocale = (locale: Locale): void => {
  current = locale;
};
export const getLocale = (): Locale => current;

/** Resolve a key from the active catalog. Missing keys return the key itself (visible in dev, never crashes). */
export const t = (key: StringKey): string => {
  const catalog = getCatalog(current);
  return catalog[key] ?? key;
};
