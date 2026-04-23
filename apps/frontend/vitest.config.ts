import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.tsx'],
        testTimeout: 20000,
        alias: {
            '@': path.resolve(__dirname, './src'),
            'next/navigation': path.resolve(__dirname, 'node_modules/next/navigation.js'),
        },
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                lines: 45,
                functions: 45,
                branches: 45,
                statements: 45,
            },
        },
        server: {
            deps: {
                inline: [/next-intl/],
            },
        },
    },
});
