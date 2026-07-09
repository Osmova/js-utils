import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/arrays/index.ts',
        'src/async/index.ts',
        'src/browser/index.ts',
        'src/colors/index.ts',
        'src/dates/index.ts',
        'src/functions/index.ts',
        'src/numbers/index.ts',
        'src/objects/index.ts',
        'src/random/index.ts',
        'src/strings/index.ts',
        'src/validation/index.ts'
    ],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: true,
    treeshake: true,
    clean: true,
    sourcemap: false,
    target: 'es2020',
    outDir: 'dist'
});
