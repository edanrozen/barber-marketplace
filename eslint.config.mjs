// ESLint flat config (Sprint 1, T1.2.1).
// Base TypeScript linting. The custom "no hard-coded user-facing strings" rule
// (Hebrew/i18n enforcement) is added in Epic E6 (T6.1.3), not here.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.expo/**', '**/.next/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Constitution: no `any` without a justified, commented exception.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
