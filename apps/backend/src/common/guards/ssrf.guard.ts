import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { URL } from 'url';

/**
 * SSRF (Server-Side Request Forgery) Protection Guard
 *
 * Validates all outbound URL requests to prevent internal network probing,
 * metadata service access, and other SSRF attack vectors.
 *
 * Protection Layers:
 * 1. Protocol allowlist (http:, https: only)
 * 2. Host blocklist (localhost, 127.0.0.1, ::1)
 * 3. Private IP range blocking (RFC 1918)
 * 4. DNS rebinding protection (IP literal check)
 * 5. Port restrictions (no privileged ports)
 *
 * Usage:
 *   @UseGuards(SsrfGuard)
 *   @Post('webhook')
 *   async createWebhook(@Body('url') url: string) { ... }
 */
@Injectable()
export class SsrfGuard implements CanActivate {
    private readonly BLOCKED_HOSTS = new Set([
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        '[::1]',
        'metadata.google.internal',
        'metadata',
        '169.254.169.254', // AWS/GCP/Azure metadata
    ]);

    private readonly BLOCKED_PROTOCOLS = new Set([
        'file:',
        'ftp:',
        'ftps:',
        'gopher:',
        'mailto:',
        'data:',
        'javascript:',
        'jar:',
    ]);

    private readonly PRIVILEGED_PORTS = new Set([
        22, 23, 25, 53, 110, 143, 465, 587, 993, 995, 3306, 3389, 5432, 6379, 27017,
    ]);

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const urls = this.extractUrls(request);

        for (const urlStr of urls) {
            this.validateUrl(urlStr);
        }

        return true;
    }

    /**
     * Validate a single URL string.
     */
    validateUrl(urlStr: string): void {
        let parsed: URL;
        try {
            parsed = new URL(urlStr);
        } catch {
            throw new ForbiddenException(`Invalid URL format: ${urlStr}`);
        }

        // 1. Protocol check
        if (this.BLOCKED_PROTOCOLS.has(parsed.protocol)) {
            throw new ForbiddenException(`Blocked protocol: ${parsed.protocol}`);
        }

        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new ForbiddenException(`Only HTTP/HTTPS protocols allowed`);
        }

        // 2. Host check
        const hostname = parsed.hostname.toLowerCase();
        if (this.BLOCKED_HOSTS.has(hostname)) {
            throw new ForbiddenException(`Blocked host: ${hostname}`);
        }

        // 3. IP literal check (IPv4)
        if (this.isIpv4(hostname)) {
            if (this.isPrivateIp(hostname)) {
                throw new ForbiddenException(`Private IP addresses are not allowed: ${hostname}`);
            }
            if (this.isLoopbackIp(hostname)) {
                throw new ForbiddenException(`Loopback addresses are not allowed: ${hostname}`);
            }
        }

        // 4. IPv6 check
        if (this.isIpv6(hostname)) {
            throw new ForbiddenException(`IPv6 literals are not allowed: ${hostname}`);
        }

        // 5. Port check
        const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
        if (this.PRIVILEGED_PORTS.has(port)) {
            throw new ForbiddenException(`Privileged port not allowed: ${port}`);
        }
    }

    /**
     * Extract URLs from request (body, query, params).
     */
    private extractUrls(request: Request): string[] {
        const urls: string[] = [];
        const extract = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            for (const value of Object.values(obj)) {
                if (typeof value === 'string' && this.looksLikeUrl(value)) {
                    urls.push(value);
                } else if (typeof value === 'object') {
                    extract(value);
                }
            }
        };

        extract(request.body);
        extract(request.query);
        extract(request.params);

        return urls;
    }

    private looksLikeUrl(str: string): boolean {
        return /^https?:\/\//i.test(str) || /^ftp:\/\//i.test(str);
    }

    private isIpv4(host: string): boolean {
        return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
    }

    private isIpv6(host: string): boolean {
        return host.startsWith('[') || /:/.test(host);
    }

    private isPrivateIp(ip: string): boolean {
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4) return false;

        // 10.0.0.0/8
        if (parts[0] === 10) return true;
        // 172.16.0.0/12
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
        // 192.168.0.0/16
        if (parts[0] === 192 && parts[1] === 168) return true;
        // 169.254.0.0/16 (link-local)
        if (parts[0] === 169 && parts[1] === 254) return true;
        // 127.0.0.0/8 (loopback)
        if (parts[0] === 127) return true;

        return false;
    }

    private isLoopbackIp(ip: string): boolean {
        const parts = ip.split('.').map(Number);
        return parts[0] === 127;
    }
}
