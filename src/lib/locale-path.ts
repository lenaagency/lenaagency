import type { Lang } from "@/lib/types";

export function isEnglishPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

/** Path without an /en prefix. */
export function stripLocale(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) {
    const rest = pathname.slice(3);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname || "/";
}

function prefixPath(pathname: string, lang: Lang): string {
  const bare = stripLocale(pathname);
  if (lang === "ko") return bare || "/";
  if (bare === "/") return "/en";
  return `/en${bare}`;
}

function isUntouchedPath(pathname: string): boolean {
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) return true;
  const last = pathname.split("/").pop() || "";
  return last.includes(".");
}

/** Prefix in-site page links when the visitor is reading English. */
export function localizeHref(href: string, lang: Lang): string {
  if (!href) return href;
  let hash = "";
  let rest = href;
  const hashAt = rest.indexOf("#");
  if (hashAt >= 0) {
    hash = rest.slice(hashAt);
    rest = rest.slice(0, hashAt);
  }

  if (/^https?:\/\//i.test(rest)) {
    try {
      const url = new URL(rest);
      const host = url.hostname;
      const local =
        host === "localhost" ||
        host === "www.lenaagency.com" ||
        host === "lenaagency.com";
      if (!local) return href;
      url.pathname = isUntouchedPath(url.pathname)
        ? url.pathname
        : prefixPath(url.pathname, lang);
      return `${url.pathname}${url.search}${hash}`;
    } catch {
      return href;
    }
  }

  if (!rest.startsWith("/") || rest.startsWith("//")) return href;
  const queryAt = rest.indexOf("?");
  const path = queryAt >= 0 ? rest.slice(0, queryAt) : rest;
  const search = queryAt >= 0 ? rest.slice(queryAt) : "";
  if (isUntouchedPath(path)) return href;
  return `${prefixPath(path, lang)}${search}${hash}`;
}
