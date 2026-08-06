import { I18nManager } from 'react-native';
import { setLocale } from '@barber-marketplace/i18n';

export { t } from '@barber-marketplace/i18n';

/** V1 is Hebrew-only with full RTL. Call once at startup. */
export function initI18n(): void {
  setLocale('he');
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }
}
