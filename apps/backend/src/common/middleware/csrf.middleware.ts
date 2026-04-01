import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as csurf from 'csurf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    constructor(private configService: ConfigService) { }

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
        this.handler(req, res, (err) => {
            if (err) {
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
