import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/royalties") && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  if (path === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/royalties", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/royalties/:path*", "/login"],
};
