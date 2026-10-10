import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "fc_token";

/**
 * Lightweight JWT payload decoder safe for Edge middleware runtime.
 */
function parseJwtPayload(token: string): { id?: string; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "";

  // Handle CORS preflight for API routes
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    const preflightHeaders = new Headers();
    const isAllowedOrigin = !origin || origin.startsWith("http://localhost:") || (allowedOrigin && origin === allowedOrigin);
    if (isAllowedOrigin) {
      preflightHeaders.set("Access-Control-Allow-Origin", origin || "*");
      preflightHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      preflightHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      preflightHeaders.set("Access-Control-Allow-Credentials", "true");
      preflightHeaders.set("Access-Control-Max-Age", "86400");
    }
    return new NextResponse(null, { status: 204, headers: preflightHeaders });
  }

  // Token retrieval (cookie or Bearer header)
  let token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  const session = token ? parseJwtPayload(token) : null;

  // 1. API Route Protection: /api/admin/*
  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Administrator privileges required" }, { status: 403 });
    }
  }

  // 2. API Route Protection: /api/delivery/*
  if (pathname.startsWith("/api/delivery")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }
    if (session.role !== "DELIVERY_AGENT" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Delivery Agent privileges required" }, { status: 403 });
    }
  }

  // 3. UI Admin Portal Protection (/admin & /admin/*)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      if (session.role === "DELIVERY_AGENT") {
        return NextResponse.redirect(new URL("/delivery", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 4. UI Delivery Partner Portal Protection (/delivery & /delivery/*)
  if (pathname.startsWith("/delivery")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "DELIVERY_AGENT" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 5. UI Customer Account Pages (/account & /account/*)
  if (pathname.startsWith("/account")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Attach Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

  // Add CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const isAllowedOrigin = !origin || origin.startsWith("http://localhost:") || (allowedOrigin && origin === allowedOrigin);
    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin || "*");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/delivery/:path*",
    "/account/:path*",
    "/api/admin/:path*",
    "/api/delivery/:path*",
  ],
};
