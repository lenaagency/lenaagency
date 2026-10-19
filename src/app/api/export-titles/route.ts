import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { LENA } from "@/lib/data";
import {
  EXPORT_CATEGORIES,
  withNormalizedCategories,
} from "@/lib/export-categories";
import { withPendingExportTitles } from "@/lib/export-pending";
import { withNormalizedSeries } from "@/lib/export-series";
import {
  isExportAdmin,
  visibleExportTitles,
} from "@/lib/export-visibility";
import { withLocalPreviews } from "@/lib/local-previews";
import {
  fetchExportCatalogFromSheet,
  getSheetsCsvUrl,
} from "@/lib/sheets-export";
import type { ExportTitle } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  headers: {
    "Cache-Control": "no-store, max-age=0",
  },
};

function assembleTitles(raw: ExportTitle[]) {
  return withLocalPreviews(withPendingExportTitles(raw))
    .map(withNormalizedCategories)
    .map(withNormalizedSeries);
}

/**
 * GET /api/export-titles
 * Returns For-sales books + category pills from Google Sheet when configured,
 * otherwise falls back to static data in src/lib/data.ts
 *
 * Public: only titles with overseas rights sold.
 * Admin session: full list (unlisted titles stay admin-only until published).
 */
export async function GET() {
  const session = await auth();
  const isAdmin = isExportAdmin(session?.user?.role);
  const sheetConfigured = Boolean(getSheetsCsvUrl());

  try {
    if (sheetConfigured) {
      const catalog = await fetchExportCatalogFromSheet();
      if (catalog && catalog.titles.length > 0) {
        const titles = visibleExportTitles(
          assembleTitles(catalog.titles),
          isAdmin
        );
        const withPreview = titles.filter(
          (t) => t.previewImages && t.previewImages.length > 0
        ).length;
        return NextResponse.json(
          {
            source: "google_sheets",
            count: titles.length,
            titles,
            categories: catalog.categories,
            categoriesSource: catalog.categoriesSource,
            updatedAt: new Date().toISOString(),
            previewHint:
              withPreview === 0
                ? "No preview images yet. Add Titles columns preview1–preview4 (Drive share links), or put files in public/previews/{id}/1.png"
                : undefined,
          },
          NO_STORE
        );
      }
    }

    const staticTitles = visibleExportTitles(
      assembleTitles(LENA.exportTitles),
      isAdmin
    );
    return NextResponse.json(
      {
        source: "static",
        count: staticTitles.length,
        titles: staticTitles,
        categories: EXPORT_CATEGORIES,
        categoriesSource: "static",
        updatedAt: new Date().toISOString(),
        note: sheetConfigured
          ? "Sheet empty or unreadable — using static fallback"
          : "Set GOOGLE_SHEETS_ID or GOOGLE_SHEETS_EXPORT_CSV_URL to use Google Sheets",
      },
      NO_STORE
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[export-titles]", message);
    const fallbackTitles = visibleExportTitles(
      assembleTitles(LENA.exportTitles),
      isAdmin
    );
    return NextResponse.json(
      {
        source: "static",
        count: fallbackTitles.length,
        titles: fallbackTitles,
        categories: EXPORT_CATEGORIES,
        categoriesSource: "static",
        updatedAt: new Date().toISOString(),
        error: message,
      },
      NO_STORE
    );
  }
}
