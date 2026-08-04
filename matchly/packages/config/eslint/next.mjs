import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

import { reactConfig } from './react.mjs';

/**
 * Configuration ESLint de l'application Next.js.
 *
 * On enregistre le plugin `@next/next` manuellement plutôt que d'étendre
 * `eslint-config-next` : ce dernier reste au format eslintrc et sa forme n'est
 * pas garantie stable entre versions majeures.
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export const nextConfig = tseslint.config(...reactConfig, {
  files: ['**/*.{ts,tsx,js,jsx}'],
  plugins: {
    '@next/next': nextPlugin,
  },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
  },
});

export default nextConfig;
