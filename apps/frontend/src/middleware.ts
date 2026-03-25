import { routing } from './i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
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
        pathname.startsWith(`/${locale}/profile`)
    );

    let response: NextResponse;

    if (isDashboardRoute) {
        const token = request.cookies.get('access_token')?.value;

        if (!token) {
            const locale = routing.locales.find(l => pathname.startsWith(`/${l}/`)) || routing.defaultLocale;
            const loginUrl = new URL(`/${locale}/login`, request.url);
            response = NextResponse.redirect(loginUrl);
        } else {
            response = intlMiddleware(request);
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
