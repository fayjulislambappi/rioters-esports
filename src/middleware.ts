import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the user's session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isAdmin = token?.role === "ADMIN";
    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminLogin = pathname === "/admin-login";
    const isApiRoute = pathname.startsWith("/api");
    const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname === "/admin-login";
    const isPublicAsset = pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.includes(".");

    // Allow access to public assets and API routes
    if (isPublicAsset || isApiRoute) {
        return NextResponse.next();
    }

    // Allow access to auth routes (login, register, admin-login) for everyone
    if (isAuthRoute) {
        return NextResponse.next();
    }

    // If user is an admin
    if (isAdmin) {
        // Allow access to admin routes
        if (isAdminRoute) {
            return NextResponse.next();
        }

        // Redirect admin users trying to access public routes to admin dashboard
        const adminUrl = new URL("/admin", request.url);
        return NextResponse.redirect(adminUrl);
    }

    // If user is not an admin but trying to access admin routes
    if (isAdminRoute && !isAdmin) {
        const loginUrl = new URL("/admin-login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Allow all other requests (public routes for non-admin users)
    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api/auth (NextAuth API routes)
         * - Files with extensions (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ],
};
