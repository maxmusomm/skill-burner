import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { pathname } = req.nextUrl

    // Allow access to login page and auth routes
    if (pathname === "/login" || pathname.startsWith("/api/auth")) {
        return NextResponse.next()
    }

    // Redirect to login if not authenticated
    if (!req.auth) {
        const loginUrl = new URL("/login", req.url)
        return NextResponse.redirect(loginUrl)
    }

    // Allow access to protected routes if authenticated
    return NextResponse.next()
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth.js routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
    ],
}