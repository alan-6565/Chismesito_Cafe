import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login" || req.nextUrl.pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const session = req.cookies.get("admin_session")?.value;
  if (session !== process.env.ADMIN_PASSWORD) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
