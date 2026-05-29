import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.nextUrl.hostname;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  // 1. Enforce HTTPS in production
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (
    process.env.NODE_ENV === "production" &&
    !isLocalHost &&
    forwardedProto &&
    forwardedProto !== "https"
  ) {
    const secureUrl = new URL(request.url);
    secureUrl.protocol = "https:";
    return NextResponse.redirect(secureUrl.toString(), 301);
  }

  // 2. Protected paths check
  const protectedPrefixes = ["/admin", "/employer", "/me", "/cv-builder"];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    const sessionCookie = request.cookies.get("jojobs_session");
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      const redirectPath = pathname + search;
      loginUrl.searchParams.set("redirect", redirectPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.webmanifest (metadata files)
     * - images, icons (static asset folders)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|images|icons).*)",
  ],
};
