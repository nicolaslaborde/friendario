import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnLoginPage = req.nextUrl.pathname.startsWith("/login")
    const isOnRegisterPage = req.nextUrl.pathname.startsWith("/register")
    const isPublicAsset = req.nextUrl.pathname.includes(".") // Simple check for files like images, etc.

    if (isPublicAsset) {
        return NextResponse.next()
    }

    if (!isLoggedIn && !isOnLoginPage && !isOnRegisterPage) {
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
        return NextResponse.redirect(new URL("/timeline", req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
