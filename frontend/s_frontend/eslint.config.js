import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    rules: {
      // Preferred eslint setup
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], // Error on unused variables
      'prefer-const': 'warn', // Warn when const can be used instead
      'comma-dangle': 'warn', // Warn when there's an unnecessary comma
      'semi': ['warn', 'always'] // Warn on missing semi-colon ';'
    }
  }
]);
