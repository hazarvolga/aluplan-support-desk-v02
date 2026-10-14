import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { IncomingMessage, request as httpRequest } from 'node:http';
import { Agent, request as httpsRequest } from 'node:https';
import { OutboundUrlSafetyService } from '../../knowledge-pool/outbound-url-safety.service';

export const OUTBOUND_HTTP_TRANSPORT = Symbol('OUTBOUND_HTTP_TRANSPORT');
export type OutboundHttpTransport = (
    url: string,
    init: RequestInit,
    pinnedAgent?: Agent,
) => Promise<Response>;

const DEFAULT_MAX_RESPONSE_BYTES = 16 * 1024 * 1024;

function createBoundedResponseBody(incoming: IncomingMessage, maxResponseBytes: number): ReadableStream<Uint8Array> {
    let controller: ReadableStreamDefaultController<Uint8Array>;
    let receivedBytes = 0;
    let settled = false;
    const cleanup = () => {
        incoming.off('data', onData);
        incoming.off('end', onEnd);
        incoming.off('error', onError);
    };
    const onData = (chunk: Buffer) => {
        if (settled) return;
        receivedBytes += chunk.length;
        if (receivedBytes > maxResponseBytes) {
            settled = true;
            cleanup();
            const error = new Error(`Outbound response exceeds ${maxResponseBytes} bytes`);
            controller.error(error);
            incoming.destroy(error);
            return;
        }
        controller.enqueue(new Uint8Array(chunk));
        if ((controller.desiredSize ?? 1) <= 0) incoming.pause();
    };
    const onEnd = () => {
        if (settled) return;
        settled = true;
        cleanup();
        controller.close();
    };
    const onError = (error: Error) => {
        if (settled) return;
        settled = true;
        cleanup();
        controller.error(error);
    };

    return new ReadableStream<Uint8Array>({
        start(streamController) {
            controller = streamController;
            incoming.on('data', onData);
            incoming.once('end', onEnd);
            incoming.once('error', onError);
        },
        pull() {
            incoming.resume();
        },
        cancel() {
            if (settled) return;
            settled = true;
            cleanup();
            incoming.destroy();
        },
    });
}

export const createNodeHttpTransport = (maxResponseBytes = DEFAULT_MAX_RESPONSE_BYTES): OutboundHttpTransport => (
    value,
    init,
    pinnedAgent,
) => new Promise((resolve, reject) => {
    const url = new URL(value);
    const request = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const safeHeaders = new Headers(init.headers);
    safeHeaders.set('accept-encoding', 'identity');
    const headers = Object.fromEntries(safeHeaders.entries());
    const body = typeof init.body === 'string' || Buffer.isBuffer(init.body) || init.body instanceof Uint8Array
        ? init.body
        : undefined;
    if (init.body != null && body == null) {
        reject(new TypeError('Unsupported outbound request body type'));
        return;
    }

    const outgoing = request(url, {
        method: init.method ?? 'GET',
        headers,
        agent: url.protocol === 'https:' ? pinnedAgent : undefined,
    }, incoming => {
        try {
            const status = incoming.statusCode ?? 500;
            if (status < 200 || status > 599) {
                incoming.destroy();
                reject(new Error(`Invalid upstream HTTP status: ${status}`));
                return;
            }
            const contentEncoding = incoming.headers['content-encoding'];
            if (contentEncoding && contentEncoding.toLowerCase() !== 'identity') {
                incoming.destroy();
                reject(new Error('Unsupported outbound response content encoding'));
                return;
            }
            const declaredLength = Number(incoming.headers['content-length']);
            if (Number.isFinite(declaredLength) && declaredLength > maxResponseBytes) {
                incoming.destroy();
                reject(new Error(`Outbound response exceeds ${maxResponseBytes} bytes`));
                return;
            }
            const responseHeaders = new Headers();
            for (const [name, headerValue] of Object.entries(incoming.headers)) {
                for (const item of Array.isArray(headerValue) ? headerValue : [headerValue]) {
                    if (item != null) responseHeaders.append(name, item);
                }
            }
            const responseBody = status === 204 || status === 304
                ? null
                : createBoundedResponseBody(incoming, maxResponseBytes);
            resolve(new Response(responseBody, {
                status,
                statusText: incoming.statusMessage,
                headers: responseHeaders,
            }));
        } catch (error) {
            incoming.destroy();
            reject(error);
        }
    });

    outgoing.once('error', reject);
    if (init.signal) {
        const abort = () => outgoing.destroy(init.signal?.reason instanceof Error
            ? init.signal.reason
            : new DOMException('The operation was aborted', 'AbortError'));
        if (init.signal.aborted) abort();
        else init.signal.addEventListener('abort', abort, { once: true });
    }
    if (body != null) outgoing.write(body);
    outgoing.end();
});

export const NODE_HTTP_TRANSPORT = createNodeHttpTransport();

export async function cancelResponseBody(response: Response): Promise<void> {
    try {
        await response.body?.cancel();
    } catch {
        // Cancellation is best-effort; the caller still preserves its safe error path.
    }
}

/**
 * Validates every outbound target immediately before transport and prevents
 * automatic redirect handling from reaching an unvalidated destination.
 */
@Injectable()
export class OutboundHttpService {
    constructor(
        private readonly urlSafety: OutboundUrlSafetyService,
        @Optional() @Inject(OUTBOUND_HTTP_TRANSPORT)
        private readonly transport: OutboundHttpTransport = NODE_HTTP_TRANSPORT,
    ) {}

    async fetch(url: string, init: RequestInit = {}): Promise<Response> {
        const { httpsAgent } = await this.urlSafety.validatePublicHttpsUrl(url);
        return this.execute(url, init, httpsAgent);
    }

    private async execute(url: string, init: RequestInit, pinnedAgent?: Agent): Promise<Response> {
        const response = await this.transport(url, init, pinnedAgent);
        if (response.status >= 300 && response.status < 400) {
            await cancelResponseBody(response);
            throw new ForbiddenException('Outbound HTTP redirects are not allowed');
        }
        return response;
    }

}
