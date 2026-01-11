// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths yang tidak perlu auth
  const publicPaths = [
    "/login",
    "/auth/callback",
    "/",
    "/_next",
    "/favicon.ico",
  ];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Cek session dari cookie
  const sessionCookie = request.cookies.get("sb-access-token");
  const hasSession = !!sessionCookie?.value;

  // Jika tidak ada session dan bukan public path, redirect ke login
  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika ada session dan akses login page, redirect ke chat
  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
