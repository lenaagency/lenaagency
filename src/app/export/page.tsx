"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { ExportCard } from "@/components/CoverCard";
import { useExportTitles } from "@/hooks/useExportTitles";
import { stripRichText } from "@/lib/sheet-rich-text";
import {
  bookCategoryIds,
  bookMatchesAgeFilter,
  isAgeCategoryId,
  isContentCategoryId,
} from "@/lib/export-categories";

function parseSelectedCategories(raw: string | null): string[] {
  if (!raw || raw === "all") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ExportCatalog() {
  const { t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    titles: exportTitles,
    categories: exportCategories,
    loading,
  } = useExportTitles();

  /** Multi-select category filter (empty = all) */
  const selectedCategories = useMemo(
    () => parseSelectedCategories(searchParams.get("category")),
    [searchParams]
  );
  const publisherFilter = searchParams.get("publisher") || "";
  const seriesFilter = searchParams.get("series") || "";
  const qFromUrl = searchParams.get("q") || "";

  // Local draft so Hangul IME composition is not broken by URL/router updates
  const [searchText, setSearchText] = useState(qFromUrl);
  const composingRef = useRef(false);
  const urlSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from URL only when it changes externally (clear filters, back/forward)
  useEffect(() => {
    if (!composingRef.current) {
      setSearchText(qFromUrl);
    }
  }, [qFromUrl]);

  useEffect(() => {
    return () => {
      if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    };
  }, []);

  const contentCategories = useMemo(
    () =>
      exportCategories.filter(
        (c) => c.id === "all" || isContentCategoryId(c.id)
      ),
    [exportCategories]
  );

  const ageCategories = useMemo(
    () => exportCategories.filter((c) => isAgeCategoryId(c.id)),
    [exportCategories]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: exportTitles.length };
    for (const b of exportTitles) {
      for (const id of bookCategoryIds(b)) {
        map[id] = (map[id] || 0) + 1;
      }
      // Free-text age field also counts toward age-band filters
      for (const c of ageCategories) {
        if (bookMatchesAgeFilter(b, c.id) && !bookCategoryIds(b).includes(c.id)) {
          map[c.id] = (map[c.id] || 0) + 1;
        }
      }
    }
    return map;
  }, [exportTitles, ageCategories]);

  const updateParams = useCallback(
    (patch: {
      category?: string;
      q?: string;
      publisher?: string;
      series?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.category !== undefined) {
        if (!patch.category || patch.category === "all") params.delete("category");
        else params.set("category", patch.category);
      }
      if (patch.q !== undefined) {
        // Keep raw query in URL (no trim of mid-typing spaces for shareable state)
        const next = patch.q;
        if (!next.trim()) params.delete("q");
        else params.set("q", next);
      }
      if (patch.publisher !== undefined) {
        const next = patch.publisher.trim();
        if (!next) params.delete("publisher");
        else params.set("publisher", next);
      }
      if (patch.series !== undefined) {
        const next = patch.series.trim();
        if (!next) params.delete("series");
        else params.set("series", next);
      }
      // Drop legacy sort param if present
      params.delete("sort");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  /** Toggle multi-select category / age pill (All clears content only) */
  const toggleCategory = useCallback(
    (id: string) => {
      if (id === "all") {
        // Keep age filters; clear content categories only
        const ages = selectedCategories.filter((c) => isAgeCategoryId(c));
        if (ages.length === 0) updateParams({ category: "all" });
        else updateParams({ category: ages.join(",") });
        return;
      }
      const set = new Set(selectedCategories);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      if (set.size === 0) updateParams({ category: "all" });
      else updateParams({ category: Array.from(set).join(",") });
    },
    [selectedCategories, updateParams]
  );

  const scheduleUrlQ = useCallback(
    (value: string) => {
      if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
      urlSyncTimer.current = setTimeout(() => {
        updateParams({ q: value });
      }, 300);
    },
    [updateParams]
  );

  const onSearchChange = (value: string) => {
    setSearchText(value);
    // During Hangul composition, only update local state — never touch the URL
    if (!composingRef.current) {
      scheduleUrlQ(value);
    }
  };

  const list = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const pubFilter = publisherFilter.trim().toLowerCase();
    const seriesQ = seriesFilter.trim().toLowerCase();

    return exportTitles.filter((b) => {
      if (selectedCategories.length > 0) {
        const contentSel = selectedCategories.filter((c) => !isAgeCategoryId(c));
        const ageSel = selectedCategories.filter((c) => isAgeCategoryId(c));
        const ids = bookCategoryIds(b);

        if (contentSel.length > 0) {
          const hit = contentSel.some((c) => ids.includes(c));
          if (!hit) return false;
        }
        if (ageSel.length > 0) {
          const hit = ageSel.some((c) => bookMatchesAgeFilter(b, c));
          if (!hit) return false;
        }
      }
      if (pubFilter) {
        const pubKo = (b.publisher || "").toLowerCase();
        const pubEn = (b.publisherEn || "").toLowerCase();
        if (pubKo !== pubFilter && pubEn !== pubFilter) return false;
      }
      if (seriesQ) {
        const sEn = (b.series || "").toLowerCase();
        const sKo = (b.seriesKo || "").toLowerCase();
        if (!sEn.includes(seriesQ) && !sKo.includes(seriesQ)) return false;
      }
      if (!query) return true;
      const hay = [
        stripRichText(b.title),
        stripRichText(b.titleKo),
        b.author,
        b.authorEn,
        b.publisher,
        b.publisherEn,
        b.series,
        b.seriesKo,
        b.age,
        b.category,
        b.categoryLabel,
        b.categoryLabelKo,
        ...(b.categories || []),
        ...(b.categoryLabels || []),
        ...(b.categoryLabelsKo || []),
        stripRichText(b.synopsis),
        stripRichText(b.synopsisKo),
        stripRichText(b.coverCopy),
        stripRichText(b.coverCopyKo),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [
    searchText,
    selectedCategories,
    exportTitles,
    publisherFilter,
    seriesFilter,
  ]);

  const activeCategoryLabels = selectedCategories
    .map((id) => {
      const c = exportCategories.find((x) => x.id === id);
      return c ? t(c.label, c.labelKo) : id;
    })
    .filter(Boolean);

  const hasExtraFilters =
    selectedCategories.length > 0 ||
    searchText.trim() ||
    Boolean(publisherFilter.trim()) ||
    Boolean(seriesFilter.trim());

  const clearAll = () => {
    if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    setSearchText("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">{t("Home", "홈")}</Link> /{" "}
            <span>{t("For sales", "수출")}</span>
          </div>
          <h1>{t("Titles for rights sales", "한국 저작물 수출")}</h1>
          <p>
            {t(
              "Click a title for details.",
              "타이틀을 클릭하면 상세소개 페이지로 이동합니다."
            )}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="toolbar catalog-toolbar">
            <div className="search-box">
              <input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                onCompositionStart={() => {
                  composingRef.current = true;
                }}
                onCompositionEnd={(e) => {
                  composingRef.current = false;
                  // Commit composed Hangul, then sync URL
                  const value = e.currentTarget.value;
                  setSearchText(value);
                  scheduleUrlQ(value);
                }}
                placeholder={t(
                  "Search title, author, series name, age…",
                  "제목, 저자, 시리즈명, 연령대 검색…"
                )}
                aria-label={t("Search", "검색")}
              />
            </div>
            <div className="filter-group">
              <div className="filter-group-label">
                {t("Category", "카테고리")}
              </div>
              <div
                className="filter-pills"
                role="group"
                aria-label={t(
                  "Categories (multi-select)",
                  "카테고리 (중복 선택 가능)"
                )}
              >
                {contentCategories.map((c) => {
                  const count = counts[c.id] ?? 0;
                  const isActive =
                    c.id === "all"
                      ? selectedCategories.filter((id) => !isAgeCategoryId(id))
                          .length === 0
                      : selectedCategories.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`pill ${isActive ? "active" : ""}`}
                      onClick={() => toggleCategory(c.id)}
                      aria-pressed={isActive}
                    >
                      <span>{t(c.label, c.labelKo)}</span>
                      <span className="pill-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {ageCategories.length > 0 ? (
              <div className="filter-group">
                <div className="filter-group-label">
                  {t("Age group", "연령대")}
                </div>
                <div
                  className="filter-pills"
                  role="group"
                  aria-label={t("Age groups (multi-select)", "연령대 (중복 선택 가능)")}
                >
                  {ageCategories.map((c) => {
                    const count = counts[c.id] ?? 0;
                    const isActive = selectedCategories.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`pill ${isActive ? "active" : ""}`}
                        onClick={() => toggleCategory(c.id)}
                        aria-pressed={isActive}
                      >
                        <span>{t(c.label, c.labelKo)}</span>
                        <span className="pill-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="results-bar">
            <div className="results-count">
              {loading ? (
                t("Loading…", "불러오는 중…")
              ) : activeCategoryLabels.length > 0 ? (
                <strong>{activeCategoryLabels.join(" · ")}</strong>
              ) : null}
              {publisherFilter.trim() ? (
                <span className="results-query">
                  {activeCategoryLabels.length > 0 ? " · " : ""}
                  {t(
                    `publisher: ${publisherFilter.trim()}`,
                    `출판사: ${publisherFilter.trim()}`
                  )}
                </span>
              ) : null}
              {seriesFilter.trim() ? (
                <span className="results-query">
                  {activeCategoryLabels.length > 0 || publisherFilter.trim()
                    ? " · "
                    : ""}
                  {t(
                    `series: ${seriesFilter.trim()}`,
                    `시리즈: ${seriesFilter.trim()}`
                  )}
                </span>
              ) : null}
              {searchText.trim() ? (
                <span className="results-query">
                  {activeCategoryLabels.length > 0 ||
                  publisherFilter.trim() ||
                  seriesFilter.trim()
                    ? " · "
                    : ""}
                  {t(`“${searchText.trim()}”`, `“${searchText.trim()}”`)}
                </span>
              ) : null}
            </div>
            {hasExtraFilters && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearAll}
              >
                {t("Clear filters", "필터 초기화")}
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="empty-state">
              <p>
                {t(
                  "No titles match your filters.",
                  "조건에 맞는 타이틀이 없습니다."
                )}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 16 }}
                onClick={clearAll}
              >
                {t("Show all titles", "전체 보기")}
              </button>
            </div>
          ) : (
            <div className="title-grid cols-4">
              {list.map((b) => (
                <ExportCard key={b.id} book={b} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>
            {t("Interested in a title?", "관심 있는 타이틀이 있으신가요?")}
          </h2>
          <p>
            {t(
              "Foreign publishers and agents — request materials or discuss territories.",
              "해외 출판사·에이전트 여러분, 자료 요청이나 지역별 권리 상담을 환영합니다."
            )}
          </p>
          <Link className="btn btn-primary" href="/contact">
            {t("Rights inquiry", "권리 문의")}
          </Link>
        </div>
      </section>
    </>
  );
}

export default function ExportPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "48px 0" }}>
          <div className="empty-state">…</div>
        </div>
      }
    >
      <ExportCatalog />
    </Suspense>
  );
}
