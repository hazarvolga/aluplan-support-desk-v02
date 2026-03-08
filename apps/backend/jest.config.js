module.exports = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: ".",
    testMatch: ["**/*.spec.ts"],
    transform: {
        "^.+\\.ts$": require.resolve("ts-jest")
    },
    testEnvironment: "node",
    // Eklenen yardımcı ayarlar (NestJS için kritik)
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@aluplan/database$": "<rootDir>/../../packages/database"
    },
    setupFiles: ["<rootDir>/test/setup.ts"],
    collectCoverageFrom: ["src/**/*.(t|j)s"],
    coverageDirectory: "./coverage"
};
