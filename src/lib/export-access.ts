/** HttpOnly cookie set after a successful English newsletter subscription. */
export const EXPORT_ACCESS_COOKIE = "lena_export_access";

export const EXPORT_ACCESS_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Only in-site export paths may be used as the post-subscribe return URL.
 */
export function safeExportNext(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  if (
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    decoded.includes("://") ||
    /[\r\n\0]/.test(decoded)
  ) {
    return null;
  }
  try {
    const url = new URL(decoded, "https://www.lenaagency.com");
    if (url.username || url.password) return null;
    const bare = url.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    if (!bare.startsWith("/export")) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
