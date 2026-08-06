import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t, setLocale, getLocale } from './translate';
import { isRtlLocale, DEFAULT_LOCALE } from './locale';

test('resolves Hebrew strings from the catalog', () => {
  setLocale('he');
  assert.equal(getLocale(), 'he');
  assert.equal(t('auth.phoneCta'), 'שליחת קוד אימות');
  assert.equal(t('profile.saved'), 'הפרטים נשמרו בהצלחה');
});
test('default locale is Hebrew and RTL', () => {
  assert.equal(DEFAULT_LOCALE, 'he');
  assert.equal(isRtlLocale('he'), true);
});
