import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { EXPORT_ACCESS_COOKIE } from "@/lib/export-access";
import { isEnglishPath, localizeHref, stripLocale } from "@/lib/locale-path";

const { auth } = NextAuth(authConfig);

const authMiddleware = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin =
    (req.auth?.user as { role?: string } | undefined)?.role === "admin";
  const path = req.nextUrl.pathname;
  const bare = stripLocale(path);
  const lang = isEnglishPath(path) ? "en" : "ko";

  if (
    !isAdmin &&
    (bare === "/export" || bare.startsWith("/export/"))
  ) {
    const subscribed = req.cookies.get(EXPORT_ACCESS_COOKIE)?.value === "1";
    if (!subscribed) {
      const dest = new URL(localizeHref("/newsletter", "en"), req.nextUrl.origin);
      dest.searchParams.set("next", path + req.nextUrl.search);
      return NextResponse.redirect(dest);
    }
  }

  if (bare.startsWith("/royalties") && !isLoggedIn) {
    const login = new URL(localizeHref("/login", lang), req.nextUrl.origin);
    login.searchParams.set("callbackUrl", path + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

function redirectEnglishQuery(req: NextRequest): NextResponse | null {
  const url = req.nextUrl;
  if (url.searchParams.get("lang") !== "en") return null;
  if (isEnglishPath(url.pathname)) return null;
  const dest = url.clone();
  dest.pathname = localizeHref(url.pathname, "en");
  dest.searchParams.delete("lang");
  const next = dest.searchParams.get("next");
  if (next && next.startsWith("/export")) {
    dest.searchParams.set("next", localizeHref(next, "en"));
  }
  return NextResponse.redirect(dest);
}

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const englishQuery = redirectEnglishQuery(req);
  if (englishQuery) return englishQuery;

  const bare = stripLocale(req.nextUrl.pathname);
  const gated =
    bare.startsWith("/royalties") ||
    bare === "/export" ||
    bare.startsWith("/export/");
  if (gated) {
    const handle = authMiddleware as unknown as (
      request: NextRequest,
      ev: NextFetchEvent
    ) => ReturnType<typeof NextResponse.next>;
    return handle(req, event);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
