import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
var __dirname = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
    build: {
        outDir: resolve(__dirname, '../dist-electron'),
        lib: {
            entry: {
                main: resolve(__dirname, 'main.ts'),
                preload: resolve(__dirname, 'preload.ts'),
            },
            formats: ['cjs'],
        },
        rollupOptions: {
            external: [
                'electron',
                'path',
                'url',
                'fs',
                'os',
                'crypto',
                'util',
                'stream',
                'events',
                'buffer',
            ],
            output: {
                entryFileNames: '[name].cjs',
            },
        },
    },
});
