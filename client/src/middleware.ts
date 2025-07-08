import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/signin', '/signup', '/learn-more', '/', '/join-chatroom', '/join-meeting'];
const PRIVATE_PREFIXES = ['/dashboard', '/meeting', '/chatroom'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public routes without auth
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    // Check if the route starts with a private prefix
    const isPrivate = PRIVATE_PREFIXES.some(prefix => pathname.startsWith(prefix));

    // If it's a private route and no JWT token, redirect to signin
    if (isPrivate) {
        const jwt = req.cookies.get('jwt');

        if (!jwt) {
            const loginUrl = new URL('/signin', req.url);
            loginUrl.searchParams.set('redirectedFrom', pathname); // Optional: track original destination
            return NextResponse.redirect(loginUrl);
        }
    }

    // Otherwise, allow access
    return NextResponse.next();
}

// Temporarily disabled to prevent conflicts with AuthGuard
export const config = {
    matcher: ['/dashboard/:path*', '/meeting/:path*', '/chatroom/:path*'],
};
