import { nextConfig } from '@matchly/config/eslint/next';
import tseslint from 'typescript-eslint';

/** @type {import('typescript-eslint').ConfigArray} */
export default tseslint.config(...nextConfig, {
  ignores: ['.next/**', 'next-env.d.ts', 'coverage/**'],
});
