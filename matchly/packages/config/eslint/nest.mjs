import globals from 'globals';
import tseslint from 'typescript-eslint';

import { baseConfig } from './base.mjs';

/**
 * Configuration ESLint de l'API NestJS.
 *
 * NestJS repose massivement sur les décorateurs et l'injection par constructeur.
 * On assouplit donc deux règles qui, appliquées telles quelles, produiraient un
 * bruit permanent sans bénéfice :
 *   - `@typescript-eslint/no-extraneous-class` (modules Nest vides par nature) ;
 *   - `@typescript-eslint/no-empty-object-type` sur les interfaces de marquage.
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export const nestConfig = tseslint.config(...baseConfig, {
  files: ['**/*.ts'],
  languageOptions: {
    globals: {
      ...globals.node,
    },
    parserOptions: {
      emitDecoratorMetadata: true,
    },
  },
  rules: {
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    /**
     * `consistent-type-imports` est DÉSACTIVÉ ici, et c'est délibéré.
     *
     * NestJS résout ses dépendances en lisant les types des paramètres de
     * constructeur via `emitDecoratorMetadata`. Un `import type` est effacé à
     * la compilation : les métadonnées `design:paramtypes` tombent alors sur
     * `Object`, et le conteneur ne sait plus quoi injecter.
     *
     * Le piège est que le code continue de compiler et de passer le lint —
     * l'échec ne survient qu'au démarrage, sous la forme d'un « Nest can't
     * resolve dependencies » sans rapport apparent avec un import. Appliquer
     * `--fix` sur cette règle dans un projet Nest est donc une façon fiable de
     * casser la production.
     *
     * La règle reste active dans `base.mjs`, donc sur le web et les paquets
     * partagés, où aucune métadonnée d'exécution n'est en jeu.
     */
    '@typescript-eslint/consistent-type-imports': 'off',
  },
});

export default nestConfig;
