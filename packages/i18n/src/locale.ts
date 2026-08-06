/** Supported locales. English/Arabic are added here later WITHOUT refactoring consumers. */
export const LOCALES = ['he'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'he';

/** RTL scripts. Hebrew (and future Arabic) are right-to-left. */
export const isRtlLocale = (locale: Locale): boolean => locale === 'he' || (locale as string) === 'ar';
