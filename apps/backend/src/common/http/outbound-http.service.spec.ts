import { ForbiddenException } from '@nestjs/common';
import { createServer } from 'node:http';
import { OutboundUrlSafetyService } from '../../knowledge-pool/outbound-url-safety.service';
import {
    cancelResponseBody,
    createNodeHttpTransport,
    NODE_HTTP_TRANSPORT,
    OutboundHttpService,
} from './outbound-http.service';

const createResponse = (status = 200, location?: string): Response => ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(location ? { location } : {}),
} as Response);

describe('OutboundHttpService', () => {
    afterEach(() => jest.restoreAllMocks());

    it('resolves all addresses immediately before fetching a valid public target', async () => {
        const lookup = jest.fn().mockResolvedValue([
            { address: '8.8.8.8', family: 4 },
            { address: '2001:4860:4860::8888', family: 6 },
        ]);
        const transport = jest.fn().mockResolvedValue(createResponse());
        const service = new OutboundHttpService(new OutboundUrlSafetyService(lookup), transport);

        await expect(service.fetch('https://provider.example/v1/models', {
            headers: { Authorization: 'Bearer secret' },
        })).resolves.toEqual(expect.objectContaining({ status: 200 }));

        expect(lookup).toHaveBeenCalledWith('provider.example');
        expect(transport).toHaveBeenCalledWith(
            'https://provider.example/v1/models',
            expect.objectContaining({ headers: { Authorization: 'Bearer secret' } }),
            expect.anything(),
        );
    });

    it.each([
        ['127.0.0.1', 4],
        ['10.0.0.5', 4],
        ['169.254.169.254', 4],
        ['::1', 6],
        ['fe80::1', 6],
    ])('blocks a hostname resolving to %s before fetch', async (address, family) => {
        const transport = jest.fn();
        const service = new OutboundHttpService(new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address, family }]),
        ), transport);

        await expect(service.fetch('https://attacker.example/v1'))
            .rejects.toBeInstanceOf(ForbiddenException);
        expect(transport).not.toHaveBeenCalled();
    });

    it('never follows a redirect to a private or metadata destination', async () => {
        const lookup = jest.fn().mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
        const cancel = jest.fn().mockResolvedValue(undefined);
        const transport = jest.fn().mockResolvedValue(
            {
                ...createResponse(302, 'http://169.254.169.254/latest/meta-data'),
                body: { cancel },
            } as unknown as Response,
        );
        const service = new OutboundHttpService(new OutboundUrlSafetyService(lookup), transport);

        await expect(service.fetch('https://provider.example/v1/models'))
            .rejects.toThrow('redirect');
        expect(transport).toHaveBeenCalledTimes(1);
        expect(lookup).toHaveBeenCalledTimes(1);
        expect(cancel).toHaveBeenCalledTimes(1);
    });

    it('cannot be overridden to automatic redirect mode by a caller', async () => {
        const transport = jest.fn().mockResolvedValue(createResponse());
        const service = new OutboundHttpService(new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '8.8.8.8', family: 4 }]),
        ), transport);

        await service.fetch('https://provider.example/v1', { redirect: 'follow' });

        expect(transport).toHaveBeenCalledWith(
            'https://provider.example/v1',
            expect.objectContaining({ redirect: 'follow' }),
            expect.anything(),
        );
    });

    it('passes the pinned agent to transport and never performs a second DNS lookup', async () => {
        const lookup = jest.fn().mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
        const transport = jest.fn(async (_url, _init, agent) => {
            const pinnedLookup = (agent as any).options.lookup;
            await new Promise<void>((resolve, reject) => {
                pinnedLookup('provider.example', {}, (error: Error | null, address: string) => {
                    if (error) return reject(error);
                    expect(address).toBe('8.8.8.8');
                    resolve();
                });
            });
            return createResponse();
        });
        const service = new OutboundHttpService(new OutboundUrlSafetyService(lookup), transport);

        await service.fetch('https://provider.example/v1');

        expect(lookup).toHaveBeenCalledTimes(1);
        expect(transport).toHaveBeenCalledWith(
            'https://provider.example/v1',
            {},
            expect.anything(),
        );
    });

    it('rejects an invalid upstream HTTP status without throwing outside the promise', async () => {
        let closed = false;
        const server = createServer((_request, response) => {
            response.statusCode = 700;
            response.on('close', () => { closed = true; });
            response.write('invalid status');
        });
        await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected TCP server address');

        try {
            await expect(NODE_HTTP_TRANSPORT(`http://127.0.0.1:${address.port}`, {}, undefined))
                .rejects.toThrow('Invalid upstream HTTP status');
            await new Promise(resolve => setTimeout(resolve, 25));
            expect(closed).toBe(true);
        } finally {
            server.closeAllConnections();
            await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        }
    });

    it('rejects declared response bodies larger than the configured byte ceiling', async () => {
        const server = createServer((_request, response) => {
            response.setHeader('Content-Length', '9');
            response.end('123456789');
        });
        await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected TCP server address');

        try {
            await expect(createNodeHttpTransport(8)(`http://127.0.0.1:${address.port}`, {}, undefined))
                .rejects.toThrow('response exceeds 8 bytes');
        } finally {
            await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        }
    });

    it('aborts chunked response bodies when streamed bytes cross the ceiling', async () => {
        const server = createServer((_request, response) => {
            response.write('12345');
            response.end('6789');
        });
        await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected TCP server address');

        try {
            const response = await createNodeHttpTransport(8)(`http://127.0.0.1:${address.port}`, {}, undefined);
            await expect(response.text()).rejects.toThrow('response exceeds 8 bytes');
        } finally {
            await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        }
    });

    it('forces identity response encoding at the native transport boundary', async () => {
        const seenEncoding = jest.fn();
        const server = createServer((request, response) => {
            seenEncoding(request.headers['accept-encoding']);
            response.end('ok');
        });
        await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected TCP server address');

        try {
            const response = await NODE_HTTP_TRANSPORT(`http://127.0.0.1:${address.port}`, {
                headers: { 'Accept-Encoding': 'gzip, br' },
            }, undefined);
            await expect(response.text()).resolves.toBe('ok');
            expect(seenEncoding).toHaveBeenCalledWith('identity');
        } finally {
            await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        }
    });

    it('rejects an unexpectedly encoded response rather than parsing compressed bytes as text', async () => {
        const server = createServer((_request, response) => {
            response.setHeader('Content-Encoding', 'gzip');
            response.end('not-really-gzip');
        });
        await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected TCP server address');

        try {
            await expect(NODE_HTTP_TRANSPORT(`http://127.0.0.1:${address.port}`, {}, undefined))
                .rejects.toThrow('Unsupported outbound response content encoding');
        } finally {
            await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        }
    });

    it.each([200, 503])('cancels a non-ending HTTP %s response and closes the peer socket', async (status) => {
        let closed = false;
        const server = createServer((_request, response) => {
            response.statusCode = status;
            response.on('close', () => { closed = true; });
            response.write('partial');
        });
        await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected TCP server address');

        try {
            const response = await NODE_HTTP_TRANSPORT(`http://127.0.0.1:${address.port}`, {}, undefined);
            await cancelResponseBody(response);
            await new Promise(resolve => setTimeout(resolve, 25));
            expect(closed).toBe(true);
        } finally {
            server.closeAllConnections();
            await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        }
    });
});
