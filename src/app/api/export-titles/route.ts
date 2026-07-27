import { NextResponse } from "next/server";
import { LENA } from "@/lib/data";
import {
  EXPORT_CATEGORIES,
  withNormalizedCategories,
} from "@/lib/export-categories";
import { withLocalPreviews } from "@/lib/local-previews";
import {
  fetchExportCatalogFromSheet,
  getSheetsCsvUrl,
} from "@/lib/sheets-export";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/export-titles
 * Returns For-sales books + category pills from Google Sheet when configured,
 * otherwise falls back to static data in src/lib/data.ts
 */
export async function GET() {
  const sheetConfigured = Boolean(getSheetsCsvUrl());

  try {
    if (sheetConfigured) {
      const catalog = await fetchExportCatalogFromSheet();
      if (catalog && catalog.titles.length > 0) {
        const titles = withLocalPreviews(catalog.titles).map(
          withNormalizedCategories
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
          {
            headers: {
              "Cache-Control": "no-store, max-age=0",
            },
          }
        );
      }
    }

    const staticTitles = withLocalPreviews(LENA.exportTitles).map(
      withNormalizedCategories
    );
    return NextResponse.json({
      source: "static",
      count: staticTitles.length,
      titles: staticTitles,
      categories: EXPORT_CATEGORIES,
      categoriesSource: "static",
      updatedAt: new Date().toISOString(),
      note: sheetConfigured
        ? "Sheet empty or unreadable — using static fallback"
        : "Set GOOGLE_SHEETS_ID or GOOGLE_SHEETS_EXPORT_CSV_URL to use Google Sheets",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[export-titles]", message);
    return NextResponse.json({
      source: "static",
      count: LENA.exportTitles.length,
      titles: withLocalPreviews(LENA.exportTitles).map(withNormalizedCategories),
      categories: EXPORT_CATEGORIES,
      categoriesSource: "static",
      updatedAt: new Date().toISOString(),
      error: message,
    });
  }
}
