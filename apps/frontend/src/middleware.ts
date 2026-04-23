import { routing } from './i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is a dashboard route (protected)
    // Matches patterns like /tr/dashboard, /en/settings, etc.
    const isDashboardRoute = routing.locales.some(locale =>
        pathname.startsWith(`/${locale}/dashboard`) ||
        pathname.startsWith(`/${locale}/tickets`) ||
        pathname.startsWith(`/${locale}/customers`) ||
        pathname.startsWith(`/${locale}/teams`) ||
        pathname.startsWith(`/${locale}/settings`) ||
        pathname.startsWith(`/${locale}/reports`) ||
        pathname.startsWith(`/${locale}/profile`) ||
        pathname.startsWith(`/${locale}/admin`) ||
        pathname.startsWith(`/${locale}/ai`) ||
        pathname.startsWith(`/${locale}/faq`) ||
        pathname.startsWith(`/${locale}/faq-learning`) ||
        pathname.startsWith(`/${locale}/knowledge-base`) ||
        pathname.startsWith(`/${locale}/knowledge-pool`) ||
        pathname.startsWith(`/${locale}/kb-approvals`) ||
        pathname.startsWith(`/${locale}/products`) ||
        pathname.startsWith(`/${locale}/users`) ||
        pathname.startsWith(`/${locale}/my-tickets`) ||
        pathname.startsWith(`/${locale}/system-topology`) ||
        pathname.startsWith(`/${locale}/help`)
    );

    let response: NextResponse;

    if (isDashboardRoute) {
        const token = request.cookies.get('access_token')?.value;
        const locale = routing.locales.find(l => pathname.startsWith(`/${l}/`)) || routing.defaultLocale;
        const loginUrl = new URL(`/${locale}/login`, request.url);

        if (!token) {
            response = NextResponse.redirect(loginUrl);
        } else {
            try {
                if (!process.env.JWT_SECRET) {
                    throw new Error('JWT_SECRET is required. Set it in environment variables.');
                }
                const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                // Validates signature and standard claims (like `exp`) automatically
                await jwtVerify(token, secret);

                response = intlMiddleware(request);
            } catch (error) {
                // Token is invalid or expired
                response = NextResponse.redirect(loginUrl);
                // To safely overwrite the cookie, we could delete it, but redirecting to login usually drops it or forces a new auth
            }
        }
    } else {
        response = intlMiddleware(request);
    }

    // Security Headers
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(tr|en|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
