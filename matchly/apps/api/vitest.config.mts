import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * NestJS repose sur les décorateurs et sur `emitDecoratorMetadata`.
 * L'esbuild embarqué dans Vite ne sait pas produire ces métadonnées : sans le
 * plugin SWC, tout test instanciant un module Nest échouerait sur une
 * dépendance non résolue.
 */
export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**', 'src/main.ts', 'src/**/*.test.ts', 'src/**/*.module.ts'],
    },
  },
});
