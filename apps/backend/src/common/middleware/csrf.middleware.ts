import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as csurf from 'csurf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    constructor(private configService: ConfigService) {
        const domain = this.configService.get<string>('COOKIE_DOMAIN');
        if (domain) {
            console.log(`[CSRF Middleware] Initialized with Domain: ${domain}`);
        } else {
            console.warn(`[CSRF Middleware] Initialized WITHOUT Domain (COOKIE_DOMAIN not set)`);
        }
    }

    private handler = csurf({
        cookie: {
            httpOnly: false, // Must be false so frontend JS can read it for X-XSRF-TOKEN header
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined,
        },
        value: (req: Request) => {
            // Look for the token in the X-XSRF-TOKEN header
            return req.headers['x-xsrf-token'] as string;
        },
    });

    use(req: Request, res: Response, next: NextFunction) {
        // Detailed logging for debugging CSRF failures in production
        const path = req.path || req.originalUrl || req.url;
        const method = req.method;
        const hasToken = !!req.headers['x-xsrf-token'];

        // Internal exclusion list to bypass CSRF for public endpoints and webhooks
        const isPublic =
            path.includes('/auth/login') ||
            path.includes('/auth/lookup') ||
            path.includes('/auth/forgot-password') ||
            path.includes('/auth/reset-password') ||
            path.includes('/omni-channel/webhook') ||
            path.includes('/whatsapp/webhook') ||
            path.includes('/crm/webhooks') ||
            path.includes('/webhooks/');

        if (isPublic && method === 'POST') {
            // Optional: console.log(`[CSRF] Bypassing ${method} ${path}`);
            return next();
        }

        this.handler(req, res, (err) => {
            if (err) {
                console.error(`[CSRF Error] Failed for ${method} ${path}. Token present: ${hasToken}. URL: ${req.url}, Original: ${req.originalUrl}`);
                return next(err);
            }

            // Set the XSRF-TOKEN cookie on every request if it's not set or needs update
            // This is what the frontend expects
            const token = req.csrfToken();
            const domain = this.configService.get<string>('COOKIE_DOMAIN');

            res.cookie('XSRF-TOKEN', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                domain: domain || undefined,
            });

            next();
        });
    }
}
