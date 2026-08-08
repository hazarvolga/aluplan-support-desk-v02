import {
    ArgumentsHost,
    BadRequestException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
    it('preserves a safe machine-readable code from an HttpException response', async () => {
        const reply = jest.fn();
        const httpAdapterHost = {
            httpAdapter: {
                getRequestUrl: jest.fn().mockReturnValue('/api/v1/health/backup'),
                reply,
            },
        } as any;
        const errorLogger = {
            logError: jest.fn().mockResolvedValue(undefined),
        } as any;
        const request = { method: 'POST', user: { id: 'admin-1' } };
        const response = {};
        const host = {
            switchToHttp: () => ({
                getRequest: () => request,
                getResponse: () => response,
            }),
        } as ArgumentsHost;
        const filter = new GlobalExceptionFilter(httpAdapterHost, errorLogger);

        await filter.catch(
            new ServiceUnavailableException({
                statusCode: 200,
                code: 'DATABASE_BACKUP_DISABLED',
                message: 'Operator backup workflow required.',
            }),
            host,
        );

        expect(reply).toHaveBeenCalledWith(
            response,
            expect.objectContaining({
                statusCode: 503,
                path: '/api/v1/health/backup',
                message: 'Operator backup workflow required.',
                code: 'DATABASE_BACKUP_DISABLED',
            }),
            503,
        );
    });

    it('preserves validation message arrays and drops an unsafe response code', async () => {
        const reply = jest.fn();
        const httpAdapterHost = {
            httpAdapter: {
                getRequestUrl: jest.fn().mockReturnValue('/api/v1/products'),
                reply,
            },
        } as any;
        const errorLogger = {
            logError: jest.fn().mockResolvedValue(undefined),
        } as any;
        const response = {};
        const host = {
            switchToHttp: () => ({
                getRequest: () => ({ method: 'POST', user: null }),
                getResponse: () => response,
            }),
        } as ArgumentsHost;
        const filter = new GlobalExceptionFilter(httpAdapterHost, errorLogger);
        const exception = new BadRequestException({
            statusCode: 400,
            code: 'unsafe-code',
            error: 'Bad Request',
            message: ['name must be a string', 'name should not be empty'],
        });

        await filter.catch(exception, host);

        expect(reply).toHaveBeenCalledWith(
            response,
            {
                statusCode: 400,
                timestamp: expect.any(String),
                path: '/api/v1/products',
                message: ['name must be a string', 'name should not be empty'],
                error: 'Bad Request',
            },
            400,
        );
        expect(errorLogger.logError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'name must be a string; name should not be empty',
            }),
        );
    });

    it('redacts unexpected errors and query parameters from responses and audit logs', async () => {
        const reply = jest.fn();
        const httpAdapterHost = {
            httpAdapter: {
                getRequestUrl: jest
                    .fn()
                    .mockReturnValue(
                        '/api/v1/email/oauth/callback?code=oauth-secret&state=state-secret',
                    ),
                reply,
            },
        } as any;
        const errorLogger = {
            logError: jest.fn().mockResolvedValue(undefined),
        } as any;
        const response = {};
        const host = {
            switchToHttp: () => ({
                getRequest: () => ({ method: 'GET', user: null }),
                getResponse: () => response,
            }),
        } as ArgumentsHost;
        const filter = new GlobalExceptionFilter(httpAdapterHost, errorLogger);

        await filter.catch(
            new Error('provider failed with access_token=provider-secret'),
            host,
        );

        expect(reply).toHaveBeenCalledWith(
            response,
            expect.objectContaining({
                statusCode: 500,
                path: '/api/v1/email/oauth/callback',
                message: 'Internal server error',
            }),
            500,
        );
        const persistedAuditPayload = JSON.stringify(
            errorLogger.logError.mock.calls,
        );
        expect(persistedAuditPayload).not.toContain('oauth-secret');
        expect(persistedAuditPayload).not.toContain('state-secret');
        expect(persistedAuditPayload).not.toContain('provider-secret');
    });
});
