import { stripRichText } from "@/lib/sheet-rich-text";
import type { ExportTitle } from "@/lib/types";

/** Placeholder / empty values that should not count as a sold territory. */
const EMPTY_SOLD = /^(?:[-–—]+|n\/?a|none|없음|해당\s*없음|미판매)$/i;

function soldPlain(value: string | undefined | null): string {
  return stripRichText(value).replace(/\s+/g, " ").trim();
}

/** True when the sheet records at least one overseas rights sale. */
export function hasOverseasRightsSold(
  book: Pick<ExportTitle, "rightsSold" | "rightsSoldKo">
): boolean {
  const en = soldPlain(book.rightsSold);
  const ko = soldPlain(book.rightsSoldKo);
  const meaningful = (s: string) => Boolean(s) && !EMPTY_SOLD.test(s);
  return meaningful(en) || meaningful(ko);
}

export function withExportListing(book: ExportTitle): ExportTitle {
  return { ...book, listed: hasOverseasRightsSold(book) };
}

/**
 * Public catalog: titles that have had overseas rights sold.
 * Admins see the rest too (forthcoming / not yet listed).
 */
export function visibleExportTitles(
  titles: ExportTitle[],
  isAdmin: boolean
): ExportTitle[] {
  const marked = titles.map(withExportListing);
  return isAdmin ? marked : marked.filter((t) => t.listed);
}

export function isExportAdmin(role: string | undefined | null): boolean {
  return role === "admin";
}
