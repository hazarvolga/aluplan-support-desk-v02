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

    if (isDashboardRoute) {
        const token = request.cookies.get('access_token')?.value;

        if (!token) {
            // Determine locale to redirect to login
            const locale = routing.locales.find(l => pathname.startsWith(`/${l}/`)) || routing.defaultLocale;
            const loginUrl = new URL(`/${locale}/login`, request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(tr|en|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
