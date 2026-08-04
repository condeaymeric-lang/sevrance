import { baseConfig } from '@matchly/config/eslint/base';

/**
 * Configuration ESLint racine du monorepo.
 *
 * Chaque application ou paquet fournit sa propre configuration adaptée à son
 * environnement (React, Next, Nest). Celle-ci ne couvre que les fichiers
 * outillage restés à la racine.
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export default [
  ...baseConfig,
  {
    ignores: ['apps/**', 'packages/**', 'infra/**'],
  },
];
