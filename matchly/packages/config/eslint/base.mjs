import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Socle ESLint commun à tous les paquets Matchly.
 *
 * Deux règles sont volontairement bloquantes et non négociables :
 *   - `@typescript-eslint/no-explicit-any` : la charte interdit `any` ;
 *   - `@typescript-eslint/consistent-type-imports` : garde les imports de types
 *     effaçables au build, ce qui évite les cycles à l'exécution.
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export const baseConfig = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/build/**',
      '**/generated/**',
      '**/*.min.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // ---- Charte Matchly : zéro `any` ----------------------------------
      '@typescript-eslint/no-explicit-any': 'error',

      // ---- Hygiène TypeScript -------------------------------------------
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-non-null-assertion': 'error',

      // ---- Imports déterministes ----------------------------------------
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // ---- Qualité générale ---------------------------------------------
      eqeqeq: ['error', 'smart'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-implicit-coercion': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'object-shorthand': ['error', 'always'],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration[const=true]',
          message:
            'Les `const enum` ne survivent pas à `isolatedModules`. Utilisez un objet `as const` ou une union littérale.',
        },
      ],
    },
  },
  {
    // Les fichiers de configuration tournent hors du graphe applicatif.
    files: ['**/*.config.{js,mjs,cjs,ts}', '**/scripts/**/*.{js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },
  prettier,
);

export default baseConfig;
