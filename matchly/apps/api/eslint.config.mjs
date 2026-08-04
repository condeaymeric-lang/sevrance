import { nestConfig } from '@matchly/config/eslint/nest';
import tseslint from 'typescript-eslint';

/** @type {import('typescript-eslint').ConfigArray} */
export default tseslint.config(...nestConfig, {
  // Le client Prisma est du code généré : il n'a pas à passer nos règles.
  ignores: ['dist/**', 'src/generated/**', 'coverage/**'],
});
