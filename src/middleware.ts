import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import { EXPORT_ACCESS_COOKIE } from "@/lib/export-access";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  if (
    path === "/export" ||
    path.startsWith("/export/")
  ) {
    const subscribed = req.cookies.get(EXPORT_ACCESS_COOKIE)?.value === "1";
    if (!subscribed) {
      const dest = new URL("/newsletter", req.nextUrl.origin);
      dest.searchParams.set("lang", "en");
      dest.searchParams.set("next", path + req.nextUrl.search);
      return NextResponse.redirect(dest);
    }
  }

  if (path.startsWith("/royalties") && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/royalties/:path*", "/export", "/export/:path*"],
};
