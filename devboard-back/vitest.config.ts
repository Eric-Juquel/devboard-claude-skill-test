import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      include: ['src/**'],
      exclude: [
        'src/main.ts',
        'src/**/*.module.ts',
        'src/**/dto/**',
        'src/**/*.entity.ts',
        'src/**/*.schema.ts',
      ],
    },
  },
  plugins: [
    swc.vite({
      // Override .swcrc — do NOT set module.type here so Vitest can handle
      // module resolution as ESM. NestJS CLI uses .swcrc for its own builds.
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
          dynamicImport: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        target: 'es2022',
        keepClassNames: true,
      },
    }),
  ],
});
