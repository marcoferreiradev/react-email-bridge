import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/hbs/index.ts',
    'src/hbs/preview-helpers.ts',
    'src/cli/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
});
