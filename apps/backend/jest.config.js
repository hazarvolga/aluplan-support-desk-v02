module.exports = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: ".",
    testMatch: ["**/*.spec.ts"],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/test/integration/",
    ],
    transform: {
        "^.+\\.ts$": "@swc/jest"
    },
    testEnvironment: "node",
    // Eklenen yardımcı ayarlar (NestJS için kritik)
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@aluplan/database$": "<rootDir>/../../packages/database"
    },
    setupFiles: ["<rootDir>/test/setup.ts"],
    globalTeardown: "<rootDir>/test/global-teardown.ts",
    // Prevent hanging tests due to open handles
    // Note: This is a safety net - tests should properly clean up in afterAll()
    forceExit: false, // Set to true only if absolutely necessary
    detectOpenHandles: true, // Helps identify leaked connections
    collectCoverageFrom: [
        "src/**/*.(t|j)s",
        "!src/**/*.module.ts",
        "!src/main.ts",
        "!src/**/*.d.ts",
    ],
    coverageDirectory: "./coverage",
    coverageThreshold: {
        global: {
            branches: 20,
            functions: 25,
            lines: 35,
            statements: 35,
        },
    },
};
