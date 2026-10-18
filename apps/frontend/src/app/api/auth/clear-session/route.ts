import { NextResponse } from 'next/server';

const expiredCookie = (path: string) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path,
    ...(process.env.NODE_ENV === 'production' ? { domain: '.allplan.net.tr' } : {}),
    expires: new Date(0),
    maxAge: 0,
});

export async function POST(request: Request) {
    const expectedOrigin = new URL(request.url).origin;
    const origin = request.headers.get('origin');
    const requestedWith = request.headers.get('x-requested-with');
    if (origin !== expectedOrigin || requestedWith !== 'XMLHttpRequest') {
        return NextResponse.json({ success: false }, {
            status: 403,
            headers: { 'Cache-Control': 'no-store' },
        });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('alu_session', '', expiredCookie('/'));
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
