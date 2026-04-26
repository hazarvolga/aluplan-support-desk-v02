import { validateEnv } from './env-validation';

const VALID_ENV = {
    NODE_ENV: 'test',
    PORT: '4000',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'a'.repeat(32),
    JWT_REFRESH_SECRET: 'b'.repeat(32),
    ENCRYPTION_KEY: 'c'.repeat(32),
    FRONTEND_URL: 'http://localhost:3000',
};

describe('validateEnv', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    function setEnv(env: Record<string, string | undefined>) {
        for (const k of [
            'NODE_ENV', 'PORT', 'DATABASE_URL', 'REDIS_URL',
            'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY',
            'FRONTEND_URL', 'SWAGGER_PASSWORD',
        ]) {
            delete process.env[k];
        }
        Object.assign(process.env, env);
    }

    it('returns parsed env when all required variables are present', () => {
        setEnv(VALID_ENV);
        const result = validateEnv();
        expect(result).toMatchObject({
            NODE_ENV: 'test',
            PORT: 4000,
            DATABASE_URL: VALID_ENV.DATABASE_URL,
            JWT_SECRET: 'a'.repeat(32),
        });
    });

    it('coerces PORT from string to number', () => {
        setEnv({ ...VALID_ENV, PORT: '5555' });
        expect(validateEnv()?.PORT).toBe(5555);
    });

    it('rejects JWT_SECRET shorter than 32 chars', () => {
        // Outside production mode it logs a warning and returns undefined data.
        const exitSpy = jest
            .spyOn(process, 'exit')
            .mockImplementation(() => { throw new Error('process.exit called'); });
        setEnv({ ...VALID_ENV, JWT_SECRET: 'too-short' });
        const result = validateEnv();
        expect(result).toBeUndefined();
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it('exits the process when DATABASE_URL is missing in production', () => {
        const exitSpy = jest
            .spyOn(process, 'exit')
            .mockImplementation(() => { throw new Error('process.exit called'); });
        setEnv({ ...VALID_ENV, NODE_ENV: 'production', DATABASE_URL: undefined });
        expect(() => validateEnv()).toThrow('process.exit called');
        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('accepts SWAGGER_PASSWORD as optional', () => {
        setEnv(VALID_ENV);
        expect(validateEnv()?.SWAGGER_PASSWORD).toBeUndefined();

        setEnv({ ...VALID_ENV, SWAGGER_PASSWORD: 'super-secret' });
        expect(validateEnv()?.SWAGGER_PASSWORD).toBe('super-secret');
    });
});
