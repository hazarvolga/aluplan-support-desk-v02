import tseslint from 'typescript-eslint';

export default tseslint.config(
    ...tseslint.configs.recommended,
    {
        rules: {
            'no-console': 'error',
            '@typescript-eslint/no-require-imports': 'warn',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_',
                'caughtErrorsIgnorePattern': '^_'
            }],
        },
    },
    {
        ignores: [
            'dist/*',
            'node_modules/*',
            '**/*.spec.ts',
            'coverage/*',
            'test/**',
            '**/src/scripts/**',
            '**/src/ai/tests/**',
            '**/src/check-*.ts',
            '**/src/check_*.ts',
            '**/src/debug-*.ts',
            '**/src/debug_*.ts',
            '**/src/deploy-prep.ts',
            '**/src/direct-sync.ts',
            '**/src/fix-imported-customers.ts',
            '**/src/restore-runner.ts',
            '**/src/knowledge-base/utils/test-*.ts',
        ]
    }
);
