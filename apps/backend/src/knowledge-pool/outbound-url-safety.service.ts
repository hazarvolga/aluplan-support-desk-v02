import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { lookup as dnsLookup } from 'node:dns/promises';
import { Agent } from 'node:https';
import { BlockList, isIP } from 'node:net';

export const OUTBOUND_DNS_LOOKUP = Symbol('OUTBOUND_DNS_LOOKUP');
type LookupResult = { address: string; family: number };
export type OutboundDnsLookup = (hostname: string) => Promise<LookupResult[]>;
export type ValidatedOutboundUrl = { httpsAgent: Agent };

const SYSTEM_LOOKUP: OutboundDnsLookup = hostname => dnsLookup(hostname, { all: true, verbatim: true });
const NON_PUBLIC_ADDRESSES = new BlockList();
for (const [network, prefix] of [
    ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
    ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
    ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
    ['224.0.0.0', 4], ['240.0.0.0', 4],
] as Array<[string, number]>) {
    NON_PUBLIC_ADDRESSES.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
    ['::', 128], ['::1', 128], ['100::', 64], ['2001:db8::', 32],
    ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
] as Array<[string, number]>) {
    NON_PUBLIC_ADDRESSES.addSubnet(network, prefix, 'ipv6');
}

@Injectable()
export class OutboundUrlSafetyService {
    constructor(
        @Optional() @Inject(OUTBOUND_DNS_LOOKUP)
        private readonly lookup: OutboundDnsLookup = SYSTEM_LOOKUP,
    ) {}

    async validateLearnNowUrl(value: string): Promise<ValidatedOutboundUrl> {
        const url = this.parseHttpsUrl(value);
        if (url.hostname.toLowerCase() !== 'learnnow.allplan.com') {
            throw new ForbiddenException('Learn Now URLs must use the exact learnnow.allplan.com host');
        }
        return this.validateAndPin(url.hostname);
    }

    async validatePublicHttpsUrl(value: string): Promise<ValidatedOutboundUrl> {
        const url = this.parseHttpsUrl(value);
        return this.validateAndPin(url.hostname);
    }

    async validateVimeoUrl(value: string): Promise<ValidatedOutboundUrl> {
        const url = this.parseHttpsUrl(value);
        const hostname = url.hostname.toLowerCase();
        const owned = hostname === 'vimeo.com'
            || hostname.endsWith('.vimeo.com')
            || hostname === 'vimeocdn.com'
            || hostname.endsWith('.vimeocdn.com');
        if (!owned) {
            throw new ForbiddenException('Vimeo transcript URLs must remain on a Vimeo-owned HTTPS host');
        }
        return this.validateAndPin(hostname);
    }

    private parseHttpsUrl(value: string): URL {
        let url: URL;
        try {
            url = new URL(value);
        } catch {
            throw new ForbiddenException('Invalid outbound URL');
        }
        if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) {
            throw new ForbiddenException('Outbound URLs must use public HTTPS without credentials or custom ports');
        }
        return url;
    }

    private async validateAndPin(hostname: string): Promise<ValidatedOutboundUrl> {
        const literalFamily = isIP(hostname);
        const addresses = literalFamily
            ? [{ address: hostname, family: literalFamily }]
            : await this.lookup(hostname);
        if (addresses.length === 0 || addresses.some(({ address }) => this.isNonPublicAddress(address))) {
            throw new ForbiddenException(`Outbound hostname must resolve only to a public IP: ${hostname}`);
        }
        return { httpsAgent: this.createPinnedAgent(hostname, addresses) };
    }

    private isNonPublicAddress(address: string): boolean {
        const family = isIP(address);
        if (family === 0) return true;
        return NON_PUBLIC_ADDRESSES.check(address, family === 6 ? 'ipv6' : 'ipv4');
    }

    private createPinnedAgent(hostname: string, addresses: LookupResult[]): Agent {
        const normalizedHost = hostname.toLowerCase();
        return new Agent({
            keepAlive: false,
            lookup: ((requestedHost: string, options: any, callback: (...args: any[]) => void) => {
                if (requestedHost.toLowerCase() !== normalizedHost) {
                    callback(new Error('Pinned outbound agent host mismatch'));
                    return;
                }
                const requestedFamily = typeof options === 'number' ? options : options?.family;
                const eligible = requestedFamily
                    ? addresses.filter(item => item.family === requestedFamily)
                    : addresses;
                if (eligible.length === 0) {
                    callback(new Error('Pinned outbound agent has no address for the requested family'));
                    return;
                }
                if (typeof options === 'object' && options?.all) {
                    callback(null, eligible);
                    return;
                }
                callback(null, eligible[0].address, eligible[0].family);
            }) as any,
        });
    }
}
