import type { ExportTitle } from "@/lib/types";

/**
 * Catalog order is already bottom-of-sheet first.
 * Hide unpublished drafts only. Every remaining title is public (`listed: true`).
 * Rights-sold status does not hide a title or mark it admin-only.
 */
export function visibleExportTitles(titles: ExportTitle[]): ExportTitle[] {
  return titles
    .filter((book) => book.published !== false)
    .map((book) => ({ ...book, listed: true }));
}
