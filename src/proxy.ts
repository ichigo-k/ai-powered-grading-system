import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/admin",
  LECTURER: "/lecturer",
  STUDENT: "/student",
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
  const token = await getToken({ req: request, secret })

  const isAuthenticated = !!token
  const role = token?.role as string | undefined

  // Authenticated user on login page → redirect to their dashboard
  if (pathname === "/" && isAuthenticated && role) {
    return NextResponse.redirect(
      new URL(ROLE_DASHBOARDS[role] ?? "/", request.url)
    )
  }

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/lecturer") ||
    pathname.startsWith("/student")

  if (!isProtected) return NextResponse.next()

  // Unauthenticated → login page
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Cross-role access → own dashboard
  const allowedPrefix = role ? ROLE_DASHBOARDS[role] : null
  if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(
      new URL(allowedPrefix ?? "/", request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/lecturer/:path*",
    "/student/:path*",
  ],
}
