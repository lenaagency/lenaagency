import type { ExportTitle } from "@/lib/types";
import { normalizeCoverUrl, parseImageUrlList } from "@/lib/cover-url";
import {
  EXPORT_CATEGORIES,
  EXPORT_CATEGORY_META,
  categoryMetaMap,
  parseCategoryIds,
  type ExportCategory,
  withAllCategory,
} from "@/lib/export-categories";

export { normalizeCoverUrl } from "@/lib/cover-url";

/** Minimal CSV parser (handles quotes, commas, newlines in fields) */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };
  const pushRow = () => {
    // skip completely empty trailing rows
    if (row.length === 1 && row[0] === "" && rows.length > 0) {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      pushCell();
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      pushCell();
      pushRow();
      i++;
      continue;
    }
    cell += ch;
    i++;
  }
  if (cell.length > 0 || row.length > 0) {
    pushCell();
    pushRow();
  }
  return rows;
}

function normHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "_")
    // Keep Latin + Hangul so headers like 시리즈명 / 저자소개 map correctly
    .replace(/[^a-z0-9가-힣_]/g, "");
}

/** Map common Korean / alternate headers → canonical keys */
const HEADER_ALIASES: Record<string, string> = {
  id: "id",
  slug: "id",
  아이디: "id",
  title: "title",
  title_en: "title",
  영문제목: "title",
  titleko: "titleKo",
  title_ko: "titleKo",
  한국어제목: "titleKo",
  제목: "titleKo",
  author: "author",
  author_ko: "author",
  authorko: "author",
  author1: "author",
  author_1: "author",
  저자: "author",
  저자1: "author",
  저자한글: "author",
  한국어저자: "author",
  authoren: "authorEn",
  author_en: "authorEn",
  author1en: "authorEn",
  author_1_en: "authorEn",
  저자영문: "authorEn",
  영문저자: "authorEn",
  // 2nd co-author on the same title
  author2: "author2",
  author_2: "author2",
  저자2: "author2",
  공저자: "author2",
  공저: "author2",
  author2en: "author2En",
  author_2_en: "author2En",
  author2_en: "author2En",
  저자2영문: "author2En",
  공저자영문: "author2En",
  category: "category",
  카테고리: "category",
  publisher: "publisher",
  출판사: "publisher",
  publisheren: "publisherEn",
  publisher_en: "publisherEn",
  country: "country",
  format: "format",
  포맷: "format",
  rightsnote: "rightsNote",
  rights_note: "rightsNote",
  rightsnoteko: "rightsNoteKo",
  rights_note_ko: "rightsNoteKo",
  territories: "territories",
  territoriesko: "territoriesKo",
  territories_ko: "territoriesKo",
  rightssold: "rightsSold",
  rights_sold: "rightsSold",
  계약언어: "rightsSold",
  rightssoldko: "rightsSoldKo",
  rights_sold_ko: "rightsSoldKo",
  pages: "pages",
  페이지: "pages",
  pubyear: "pubYear",
  pub_year: "pubYear",
  year: "pubYear",
  출간연도: "pubYear",
  age: "age",
  대상: "age",
  연령: "age",
  연령대: "age",
  agerange: "age",
  age_range: "age",
  // English series name
  series: "series",
  series_en: "series",
  seriesen: "series",
  seriesname: "series",
  series_name: "series",
  seriesnameen: "series",
  series_name_en: "series",
  영문시리즈: "series",
  영문시리즈명: "series",
  시리즈영문: "series",
  시리즈명영문: "series",
  // Korean series name
  seriesko: "seriesKo",
  series_ko: "seriesKo",
  seriesnameko: "seriesKo",
  series_name_ko: "seriesKo",
  시리즈: "seriesKo",
  시리즈명: "seriesKo",
  한국어시리즈: "seriesKo",
  한국어시리즈명: "seriesKo",
  covercopy: "coverCopy",
  cover_copy: "coverCopy",
  covercopyko: "coverCopyKo",
  cover_copy_ko: "coverCopyKo",
  synopsis: "synopsis",
  소개: "synopsisKo",
  synopsisko: "synopsisKo",
  synopsis_ko: "synopsisKo",
  authorbio: "authorBio",
  author_bio: "authorBio",
  authorbioen: "authorBio",
  author_bio_en: "authorBio",
  authorbio1: "authorBio",
  저자소개영문: "authorBio",
  저자소개en: "authorBio",
  authorbioko: "authorBioKo",
  author_bio_ko: "authorBioKo",
  저자소개: "authorBioKo",
  저자소개한글: "authorBioKo",
  저자소개ko: "authorBioKo",
  // 2nd co-author bios
  authorbio2: "authorBio2",
  author_bio_2: "authorBio2",
  authorbio2en: "authorBio2",
  저자2소개: "authorBio2",
  저자2소개영문: "authorBio2",
  공저자소개: "authorBio2",
  authorbio2ko: "authorBio2Ko",
  author_bio_2_ko: "authorBio2Ko",
  authorbio2_ko: "authorBio2Ko",
  저자2소개한글: "authorBio2Ko",
  공저자소개한글: "authorBio2Ko",
  color1: "color1",
  color2: "color2",
  colors: "colors",
  featured: "featured",
  추천: "featured",
  new: "new",
  신규: "new",
  cover: "cover",
  표지: "cover",
  cover_url: "cover",
  // Interior / sample pages (3–4 images)
  preview: "preview",
  previews: "preview",
  previewimages: "preview",
  preview_images: "preview",
  본문미리보기: "preview",
  미리보기: "preview",
  preview1: "preview1",
  preview2: "preview2",
  preview3: "preview3",
  preview4: "preview4",
  preview_1: "preview1",
  preview_2: "preview2",
  preview_3: "preview3",
  preview_4: "preview4",
  본문1: "preview1",
  본문2: "preview2",
  본문3: "preview3",
  본문4: "preview4",
  본문미리보기1: "preview1",
  본문미리보기2: "preview2",
  본문미리보기3: "preview3",
  본문미리보기4: "preview4",
  published: "published",
  공개: "published",
  active: "published",
};

function truthy(v: string | undefined): boolean {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "y" || s === "o" || s === "공개";
}

/**
 * Preserve spacing from Google Sheets cells:
 * - keep internal spaces / blank lines as typed
 * - normalize line endings (Alt+Enter in Sheets → \n)
 * - trim only outer edges so 띄어쓰기 inside the value is unchanged
 */
export function sheetText(raw: unknown): string {
  return String(raw ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u000b/g, "\n") // vertical tab (occasional Sheets export)
    .replace(/[\u00a0\u202f]/g, " ") // nbsp / narrow nbsp → normal space for web
    .replace(/^\n+|\n+$/g, "")
    .replace(/^[ \t]+|[ \t]+$/g, "");
}

function isBlankCell(raw: unknown): boolean {
  return !sheetText(raw).trim();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `title-${Date.now()}`;
}

function resolveCategories(
  raw: string,
  metaMap: Record<string, { label: string; labelKo: string }> = EXPORT_CATEGORY_META
): {
  /** Primary category (first) — backward compatible */
  category: string;
  categoryLabel: string;
  categoryLabelKo: string;
  /** All categories (multi-select from sheet) */
  categories: string[];
  categoryLabels: string[];
  categoryLabelsKo: string[];
} {
  let ids = parseCategoryIds(raw, metaMap);
  if (!ids.length) ids = ["nonfiction"];

  const labels: string[] = [];
  const labelsKo: string[] = [];
  for (const id of ids) {
    const meta = metaMap[id] ||
      EXPORT_CATEGORY_META[id] || {
        label: id,
        labelKo: id,
      };
    labels.push(meta.label.trim());
    labelsKo.push(meta.labelKo.trim());
  }

  return {
    category: ids[0],
    categoryLabel: labels[0],
    categoryLabelKo: labelsKo[0],
    categories: ids,
    categoryLabels: labels,
    categoryLabelsKo: labelsKo,
  };
}

export function rowsToExportCategories(rows: string[][]): ExportCategory[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normHeader);
  const idIdx = headers.findIndex((h) =>
    ["id", "category", "slug", "key"].includes(h)
  );
  const enIdx = headers.findIndex((h) =>
    ["label_en", "labelen", "label", "en", "name_en", "nameen", "english"].includes(
      h
    )
  );
  const koIdx = headers.findIndex((h) =>
    ["label_ko", "labelko", "ko", "name_ko", "nameko", "korean", "한글"].includes(
      h
    )
  );

  // Fallback: id | label_en | label_ko column order
  const iId = idIdx >= 0 ? idIdx : 0;
  const iEn = enIdx >= 0 ? enIdx : 1;
  const iKo = koIdx >= 0 ? koIdx : 2;

  const out: ExportCategory[] = [];
  const seen = new Set<string>();

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r] || [];
    const id = String(cells[iId] ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
    if (!id || id === "all" || seen.has(id)) continue;
    const label = String(cells[iEn] ?? "").trim() || id;
    const labelKo = String(cells[iKo] ?? "").trim() || label;
    if (!label && !labelKo) continue;
    seen.add(id);
    out.push({ id, label, labelKo });
  }
  return out;
}

export function rowsToExportTitles(
  rows: string[][],
  categories?: ExportCategory[]
): ExportTitle[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normHeader).map((h) => HEADER_ALIASES[h] || h);
  const metaMap = categories?.length
    ? categoryMetaMap(categories)
    : EXPORT_CATEGORY_META;

  const titles: ExportTitle[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (!cells || cells.every((c) => isBlankCell(c))) continue;

    const get = (key: string) => {
      const idx = headers.indexOf(key);
      if (idx < 0) return "";
      return sheetText(cells[idx]);
    };

    // Skip drafts: published empty = true (default public); published=false hides
    const publishedRaw = get("published");
    if (publishedRaw && !truthy(publishedRaw)) continue;

    const titleKo = get("titleKo") || get("title");
    const titleEn = get("title") || titleKo;
    if (!titleKo.trim() && !titleEn.trim()) continue;

    const id = get("id") || slugify(titleEn || titleKo);
    const {
      category,
      categoryLabel,
      categoryLabelKo,
      categories,
      categoryLabels,
      categoryLabelsKo,
    } = resolveCategories(get("category") || "nonfiction", metaMap);

    // Empty format → [] (show blank on detail; do not default to "print")
    const formatRaw = get("format");
    const format = formatRaw
      ? formatRaw
          .split(/[,|·;/]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    let colors: string[] = ["#c41e3a", "#5c1524"];
    const colorsJoined = get("colors");
    if (colorsJoined) {
      colors = colorsJoined
        .split(/[,|]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      const c1 = get("color1");
      const c2 = get("color2");
      if (c1 || c2) colors = [c1 || "#c41e3a", c2 || "#5c1524"];
    }

    // 0 = empty (do not invent defaults for blank sheet cells)
    const pagesRaw = get("pages").trim();
    const pages = pagesRaw ? parseInt(pagesRaw, 10) || 0 : 0;
    const yearRaw = get("pubYear").trim();
    const pubYear = yearRaw ? parseInt(yearRaw, 10) || 0 : 0;

    // Interior previews: preview1–4 and/or combined `preview` cell
    const previewFromParts = ["preview1", "preview2", "preview3", "preview4"]
      .map((k) => normalizeCoverUrl(get(k)))
      .filter((u): u is string => Boolean(u));
    const previewFromJoined = parseImageUrlList(get("preview"), 8);
    const previewImages = [
      ...previewFromParts,
      ...previewFromJoined.filter((u) => !previewFromParts.includes(u)),
    ].slice(0, 8);

    const author = get("author").trim();
    const publisher = get("publisher").trim();
    const country = get("country").trim();
    const rightsNote = get("rightsNote").trim();
    const rightsNoteKo = get("rightsNoteKo").trim();
    const territories = get("territories").trim();
    const territoriesKo = get("territoriesKo").trim();

    const book: ExportTitle = {
      id,
      title: titleEn,
      titleKo: titleKo || titleEn,
      author: author || "",
      authorEn: get("authorEn") || undefined,
      author2: get("author2") || undefined,
      author2En: get("author2En") || undefined,
      category,
      categoryLabel,
      categoryLabelKo,
      categories,
      categoryLabels,
      categoryLabelsKo,
      publisher: publisher || "",
      publisherEn: get("publisherEn") || undefined,
      country: country || "",
      format,
      // Empty sheet cells stay empty — UI hides blank fields
      rightsNote: rightsNote || "",
      rightsNoteKo: rightsNoteKo || "",
      territories: territories || "",
      territoriesKo: territoriesKo || "",
      rightsSold: get("rightsSold") || undefined,
      rightsSoldKo: get("rightsSoldKo") || undefined,
      pages,
      pubYear,
      age: get("age") || "",
      // series = English, seriesKo/시리즈명 = Korean (fallback to the other if one empty)
      series: get("series") || get("seriesKo") || undefined,
      seriesKo: get("seriesKo") || get("series") || undefined,
      coverCopy: get("coverCopy") || undefined,
      coverCopyKo: get("coverCopyKo") || undefined,
      synopsis: get("synopsis") || get("synopsisKo") || "",
      synopsisKo: get("synopsisKo") || get("synopsis") || "",
      authorBio: get("authorBio") || undefined,
      authorBioKo: get("authorBioKo") || undefined,
      authorBio2: get("authorBio2") || undefined,
      authorBio2Ko: get("authorBio2Ko") || undefined,
      colors,
      featured: truthy(get("featured")),
      new: truthy(get("new")),
      cover: normalizeCoverUrl(get("cover")),
      previewImages: previewImages.length ? previewImages : undefined,
    };

    titles.push(book);
  }

  // Sheet rows are top→bottom (old→new when appending).
  // Website lists newest first.
  return titles.reverse();
}

/** Candidate CSV URLs for For-sales Titles (first success wins). */
export function getSheetsCsvUrls(): string[] {
  const full = process.env.GOOGLE_SHEETS_EXPORT_CSV_URL?.trim();
  if (full) return [full];

  const id = process.env.GOOGLE_SHEETS_ID?.trim();
  if (!id) return [];

  const tab =
    process.env.GOOGLE_SHEETS_TAB?.trim() ||
    process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() ||
    "Titles";
  const gid = process.env.GOOGLE_SHEETS_GID?.trim();

  const urls: string[] = [
    // Most reliable for “anyone with the link” + named Titles tab
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`,
  ];
  if (gid) {
    urls.push(
      `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`,
      `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
    );
  }
  // Last resort: first tab (often 사용법 — avoid if possible)
  urls.push(
    `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=0`
  );
  return urls;
}

export function getCategoriesCsvUrls(): string[] {
  const full = process.env.GOOGLE_SHEETS_CATEGORIES_CSV_URL?.trim();
  if (full) return [full];

  const id = process.env.GOOGLE_SHEETS_ID?.trim();
  if (!id) return [];

  const tab =
    process.env.GOOGLE_SHEETS_CATEGORIES_TAB?.trim() || "Categories";
  const gid =
    process.env.GOOGLE_SHEETS_CATEGORIES_GID?.trim() || "1347612289";

  return [
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`,
    `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`,
  ];
}

export function getSheetsCsvUrl(): string | null {
  return getSheetsCsvUrls()[0] ?? null;
}

async function fetchCsvText(url: string): Promise<string> {
  // Bust Google CDN / Next fetch cache so new columns show up quickly
  const bust = url.includes("?") ? `&_=${Date.now()}` : `?_=${Date.now()}`;
  const res = await fetch(url + bust, {
    cache: "no-store",
    headers: {
      "User-Agent": "LENA-Agency-Site/1.0",
      "Cache-Control": "no-cache",
    },
  });

  if (!res.ok) {
    throw new Error(`Google Sheet fetch failed: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  if (
    text.trimStart().startsWith("<!DOCTYPE") ||
    text.trimStart().startsWith("<html")
  ) {
    throw new Error(
      "Google Sheet returned HTML instead of CSV. Share the sheet as “Anyone with the link can view”."
    );
  }
  return text;
}

export async function fetchExportCategoriesFromSheet(): Promise<
  ExportCategory[] | null
> {
  const urls = getCategoriesCsvUrls();
  if (!urls.length) return null;

  for (const url of urls) {
    try {
      const text = await fetchCsvText(url);
      const rows = parseCsv(text);
      const cats = rowsToExportCategories(rows);
      if (cats.length > 0) return cats;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function fetchExportTitlesFromSheet(
  categories?: ExportCategory[]
): Promise<ExportTitle[] | null> {
  const urls = getSheetsCsvUrls();
  if (!urls.length) return null;

  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      const text = await fetchCsvText(url);
      const rows = parseCsv(text);
      const titles = rowsToExportTitles(rows, categories);
      if (titles.length > 0) return titles;
      // Empty/wrong tab — try next URL
      lastError = new Error("Sheet returned no published titles");
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  if (lastError) throw lastError;
  return null;
}

/** Load categories + titles; categories drive filter pills & labels */
export async function fetchExportCatalogFromSheet(): Promise<{
  titles: ExportTitle[];
  categories: ExportCategory[];
  categoriesSource: "google_sheets" | "static";
} | null> {
  if (!getSheetsCsvUrl()) return null;

  const sheetCats = await fetchExportCategoriesFromSheet();
  const categories = sheetCats?.length
    ? withAllCategory(sheetCats)
    : EXPORT_CATEGORIES;
  const categoriesSource = sheetCats?.length ? "google_sheets" : "static";

  const titles = await fetchExportTitlesFromSheet(
    sheetCats ?? undefined
  );
  if (!titles?.length) return null;

  return { titles, categories, categoriesSource };
}
