"use client";

import { useCallback, useEffect, useState } from "react";
import { LENA } from "@/lib/data";
import { EXPORT_CATEGORIES, type ExportCategory } from "@/lib/export-categories";
import type { ExportTitle } from "@/lib/types";

type Source = "static" | "google_sheets" | "loading";

type State = {
  titles: ExportTitle[];
  categories: ExportCategory[];
  loading: boolean;
  source: Source;
  categoriesSource?: "static" | "google_sheets";
  error?: string;
  refreshedAt?: string;
};

export function useExportTitles() {
  const [state, setState] = useState<State>({
    titles: LENA.exportTitles,
    categories: EXPORT_CATEGORIES,
    loading: true,
    source: "loading",
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/export-titles", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        titles: ExportTitle[];
        categories?: ExportCategory[];
        source: Source;
        categoriesSource?: "static" | "google_sheets";
        error?: string;
        updatedAt?: string;
      };
      setState({
        titles:
          Array.isArray(data.titles) && data.titles.length
            ? data.titles
            : LENA.exportTitles,
        categories:
          Array.isArray(data.categories) && data.categories.length
            ? data.categories
            : EXPORT_CATEGORIES,
        loading: false,
        source: data.source === "google_sheets" ? "google_sheets" : "static",
        categoriesSource: data.categoriesSource,
        error: data.error,
        refreshedAt: data.updatedAt,
      });
    } catch (e) {
      setState((prev) => ({
        ...prev,
        titles: prev.titles.length ? prev.titles : LENA.exportTitles,
        categories: prev.categories.length ? prev.categories : EXPORT_CATEGORIES,
        loading: false,
        source: "static",
        error: e instanceof Error ? e.message : "Failed to load titles",
      }));
    }
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    // Soft refresh every 60s while tab is open
    const timer = window.setInterval(load, 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, [load]);

  return { ...state, refresh: load };
}
