module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', { isolatedModules: true }],
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/../test/setup.ts'],
    transformIgnorePatterns: [
        '/node_modules/(?!(langfuse|turndown)/)',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    workerIdleMemoryLimit: '512MB',
    // Workaround for ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG in some environments
    // but the real fix is passing the flag to the node process.
};
