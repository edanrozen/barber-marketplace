import { I18nManager } from 'react-native';
import { he, type StringKey } from './he';

const dictionaries = { he };
type Locale = keyof typeof dictionaries;
let current: Locale = 'he';

/** V1 is Hebrew-only with full RTL. Call once at startup. */
export function initI18n(): void {
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }
}
export function setLocale(locale: Locale): void {
  current = locale;
}
export function t(key: StringKey): string {
  return dictionaries[current][key];
}
