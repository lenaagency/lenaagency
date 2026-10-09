/**
 * Series names on the live Titles sheet are often stored with a UI label
 * prefix ("Series: …" / "시리즈: …"). That prefix must not be part of the
 * catalog filter query, or sibling volumes with a clean series name drop out.
 */

const SERIES_LABEL_PREFIX = /^(?:series|시리즈)\s*[:：\-–—]\s*/i;

export function stripSeriesLabelPrefix(
  value: string | undefined | null
): string {
  if (!value) return "";
  return value.trim().replace(SERIES_LABEL_PREFIX, "").trim();
}

export function normalizeSeriesKey(
  value: string | undefined | null
): string {
  return stripSeriesLabelPrefix(value).replace(/\s+/g, " ").toLowerCase();
}

export function withNormalizedSeries<
  T extends { series?: string; seriesKo?: string },
>(book: T): T {
  const series = stripSeriesLabelPrefix(book.series) || undefined;
  const seriesKo = stripSeriesLabelPrefix(book.seriesKo) || undefined;
  if (series === book.series && seriesKo === book.seriesKo) return book;
  return {
    ...book,
    series: series || seriesKo,
    seriesKo: seriesKo || series,
  };
}

export function bookMatchesSeriesFilter(
  book: { series?: string; seriesKo?: string },
  query: string
): boolean {
  const q = normalizeSeriesKey(query);
  if (!q) return true;
  const keys = [book.series, book.seriesKo]
    .map((s) => normalizeSeriesKey(s))
    .filter(Boolean);
  return keys.some((k) => k === q);
}

export function booksShareSeries(
  a: { series?: string; seriesKo?: string },
  b: { series?: string; seriesKo?: string }
): boolean {
  const aKeys = [a.series, a.seriesKo]
    .map((s) => normalizeSeriesKey(s))
    .filter(Boolean);
  if (!aKeys.length) return false;
  const bKeys = new Set(
    [b.series, b.seriesKo].map((s) => normalizeSeriesKey(s)).filter(Boolean)
  );
  return aKeys.some((k) => bKeys.has(k));
}

/** Catalog query value: Korean name when present, always without the label prefix. */
export function seriesFilterValue(book: {
  series?: string;
  seriesKo?: string;
}): string {
  return stripSeriesLabelPrefix(book.seriesKo || book.series || "");
}

export function seriesCatalogHref(book: {
  series?: string;
  seriesKo?: string;
}): string {
  const value = seriesFilterValue(book);
  if (!value) return "/export";
  return `/export?series=${encodeURIComponent(value)}`;
}
