/** Shared category ids for For sales / export catalog */

export type ExportCategory = {
  id: string;
  label: string;
  labelKo: string;
};

/**
 * Static fallback when Google Sheet Categories tab is unavailable.
 * Keep in sync with Categories tab on the live For-sales sheet.
 */
export const EXPORT_CATEGORY_META: Record<
  string,
  { label: string; labelKo: string }
> = {
  fiction: { label: "Fiction", labelKo: "소설" },
  nonfiction: { label: "Nonfiction", labelKo: "비소설" },
  business: { label: "Business/Economics", labelKo: "경제경영" },
  "self-help": { label: "Self-help", labelKo: "자기계발" },
  professional: { label: "Professional", labelKo: "직업/실무" },
  "science-tech": { label: "Science/Technology", labelKo: "과학/기술" },
  humanities: {
    label: "Humanities/Social Science",
    labelKo: "인문/사회",
  },
  biography: { label: "Biography", labelKo: "인물전기" },
  arts: { label: "Arts", labelKo: "예술/미술" },
  lifestyle: { label: "Lifestyle/Health", labelKo: "실용/건강" },
  parenting: { label: "Parenting", labelKo: "자녀교육" },
  picturebook: { label: "Picture Books", labelKo: "그림책" },
  baby: { label: "Baby/Toddler", labelKo: "아동(0-6)" },
  early: { label: "Early Grade", labelKo: "아동(7-9)" },
  middle: { label: "Middle Grade", labelKo: "아동(10-12)" },
  ya: { label: "YA", labelKo: "청소년" },
  "all-ages": { label: "All Ages", labelKo: "전연령" },
  series: { label: "Series", labelKo: "시리즈" },
  comics: { label: "Comics", labelKo: "만화" },

  // Legacy sheet ids (mapped at resolve time; kept for label fallback)
  "business-selfhelp": {
    label: "Business/Economics",
    labelKo: "경제경영",
  },
  "science-technology": {
    label: "Science/Technology",
    labelKo: "과학/기술",
  },
  "history-biography": { label: "Biography", labelKo: "인물전기" },
  health: { label: "Lifestyle/Health", labelKo: "실용/건강" },
  "children-fiction": { label: "Middle Grade", labelKo: "아동(10-12)" },
  "children-nonfiction": { label: "Middle Grade", labelKo: "아동(10-12)" },
  "children-selphelp": { label: "Early Grade", labelKo: "아동(7-9)" },
  "children-selfhelp": { label: "Early Grade", labelKo: "아동(7-9)" },
  selfhelp: { label: "Self-help", labelKo: "자기계발" },
  practical: { label: "Lifestyle/Health", labelKo: "실용/건강" },
  essay: { label: "Nonfiction", labelKo: "비소설" },
  children: { label: "Middle Grade", labelKo: "아동(10-12)" },
};

/** Preferred display order = live Categories sheet order */
export const EXPORT_CATEGORY_ORDER = [
  "fiction",
  "nonfiction",
  "business",
  "self-help",
  "professional",
  "science-tech",
  "humanities",
  "biography",
  "arts",
  "lifestyle",
  "parenting",
  "picturebook",
  "baby",
  "early",
  "middle",
  "ya",
  "all-ages",
  "series",
  "comics",
] as const;

/** Age-band category ids (shown as a separate filter row) */
export const AGE_CATEGORY_IDS = [
  "baby",
  "early",
  "middle",
  "ya",
  "all-ages",
] as const;

export type AgeCategoryId = (typeof AGE_CATEGORY_IDS)[number];

export function isAgeCategoryId(id: string): boolean {
  return (AGE_CATEGORY_IDS as readonly string[]).includes(id);
}

/** Content / other category ids (not age bands) */
export function isContentCategoryId(id: string): boolean {
  return Boolean(id) && id !== "all" && !isAgeCategoryId(id);
}

/** Old / alternate id → current sheet id */
export const CATEGORY_ID_ALIASES: Record<string, string> = {
  fiction: "fiction",
  nonfiction: "nonfiction",
  business: "business",
  "business-selfhelp": "business",
  businessselfhelp: "business",
  "self-help": "self-help",
  selfhelp: "self-help",
  professional: "professional",
  profession: "professional",
  "science-tech": "science-tech",
  sciencetech: "science-tech",
  "science-technology": "science-tech",
  sciencetechnology: "science-tech",
  science: "science-tech",
  humanities: "humanities",
  biography: "biography",
  "history-biography": "biography",
  historybiography: "biography",
  history: "biography",
  arts: "arts",
  lifestyle: "lifestyle",
  health: "lifestyle",
  parenting: "parenting",
  picturebook: "picturebook",
  picturebooks: "picturebook",
  baby: "baby",
  toddler: "baby",
  early: "early",
  "early-grade": "early",
  earlygrade: "early",
  middle: "middle",
  "middle-grade": "middle",
  middlegrade: "middle",
  ya: "ya",
  "young-adult": "ya",
  youngadult: "ya",
  "all-ages": "all-ages",
  allages: "all-ages",
  series: "series",
  comics: "comics",
  // legacy content
  practical: "lifestyle",
  essay: "nonfiction",
  children: "middle",
  childrens: "middle",
  "children-fiction": "middle",
  childrenfiction: "middle",
  "children-nonfiction": "middle",
  childrennonfiction: "middle",
  "children-selphelp": "early",
  "children-selfhelp": "early",
  // Korean labels (normalized without spaces / slashes / parens)
  소설: "fiction",
  논픽션: "nonfiction",
  비소설: "nonfiction",
  인문비소설: "nonfiction",
  인문에세이: "nonfiction",
  경제경영: "business",
  자기계발: "self-help",
  자기계발경영: "self-help",
  직업실무: "professional",
  직업: "professional",
  실무: "professional",
  과학기술: "science-tech",
  과학: "science-tech",
  인문사회: "humanities",
  인물전기: "biography",
  역사전기: "biography",
  역사: "biography",
  예술미술: "arts",
  예술: "arts",
  실용건강: "lifestyle",
  취미건강요리여행: "lifestyle",
  취미요리여행: "lifestyle",
  건강: "lifestyle",
  자녀교육: "parenting",
  육아: "parenting",
  그림책: "picturebook",
  아동06: "baby",
  아동0_6: "baby",
  "아동0-6": "baby",
  아동79: "early",
  아동7_9: "early",
  "아동7-9": "early",
  아동1012: "middle",
  아동10_12: "middle",
  "아동10-12": "middle",
  청소년: "ya",
  전연령: "all-ages",
  시리즈: "series",
  만화그래픽노블: "comics",
  만화: "comics",
  아동픽션: "middle",
  아동논픽션: "middle",
  인성감정교육: "early",
};

export const EXPORT_CATEGORIES: ExportCategory[] = [
  { id: "all", label: "All", labelKo: "전체" },
  ...EXPORT_CATEGORY_ORDER.map((id) => ({
    id,
    label: EXPORT_CATEGORY_META[id].label,
    labelKo: EXPORT_CATEGORY_META[id].labelKo,
  })),
];

/** Build pill list: All + categories (sheet order preserved) */
export function withAllCategory(categories: ExportCategory[]): ExportCategory[] {
  const rest = categories.filter((c) => c.id && c.id !== "all");
  return [{ id: "all", label: "All", labelKo: "전체" }, ...rest];
}

export function categoryMetaMap(
  categories: ExportCategory[]
): Record<string, { label: string; labelKo: string }> {
  const map: Record<string, { label: string; labelKo: string }> = {
    ...EXPORT_CATEGORY_META,
  };
  for (const c of categories) {
    if (!c.id || c.id === "all") continue;
    map[c.id] = {
      label: c.label.trim(),
      labelKo: c.labelKo.trim(),
    };
  }
  return map;
}

/** Flatten labels/ids for fuzzy match (spaces, slashes, parens, hyphens) */
function flattenCatToken(s: string): string {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\/()[\]（）·・]/g, "")
    .replace(/[–—−]/g, "-");
}

/** Normalize one category token to a canonical id */
export function normalizeCategoryId(
  raw: string,
  metaMap: Record<string, { label: string; labelKo: string }> = EXPORT_CATEGORY_META
): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!key) return "";

  if (CATEGORY_ID_ALIASES[key]) return CATEGORY_ID_ALIASES[key];
  if (metaMap[key] || EXPORT_CATEGORY_META[key]) return key;

  const keyFlat = flattenCatToken(raw);
  if (CATEGORY_ID_ALIASES[keyFlat]) return CATEGORY_ID_ALIASES[keyFlat];

  // Match English/Korean labels from meta
  for (const [id, m] of Object.entries(metaMap)) {
    const en = flattenCatToken(m.label);
    const ko = flattenCatToken(m.labelKo);
    if (keyFlat === en || keyFlat === ko || key === id || keyFlat === flattenCatToken(id)) {
      return id;
    }
  }

  // Hyphenless match against known ids
  const noHyphen = key.replace(/-/g, "");
  for (const id of Object.keys(metaMap)) {
    if (id.replace(/-/g, "") === noHyphen) return id;
  }

  return key;
}

/**
 * Parse sheet category cell: multi-select via comma / | / · / ;
 * Returns unique canonical ids (order preserved).
 */
export function parseCategoryIds(
  raw: string,
  metaMap: Record<string, { label: string; labelKo: string }> = EXPORT_CATEGORY_META
): string[] {
  if (!raw?.trim()) return [];
  const parts = raw
    .split(/[,|·;/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    const id = normalizeCategoryId(p, metaMap);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Category ids for a title (supports multi + legacy single field) */
export function bookCategoryIds(book: {
  category?: string;
  categories?: string[];
}): string[] {
  if (book.categories?.length) {
    return book.categories.map((id) => normalizeCategoryId(id)).filter(Boolean);
  }
  if (book.category) {
    const id = normalizeCategoryId(book.category);
    return id ? [id] : [];
  }
  return [];
}

/**
 * Infer age-band ids from free-text age cell (e.g. "12+", "Ages 7–9").
 * Does NOT infer `all-ages` — that pill only matches category id `all-ages`.
 */
export function ageBandIdsFromText(age: string | undefined | null): string[] {
  const raw = String(age || "").trim();
  if (!raw) return [];
  const a = raw.toLowerCase().replace(/\s+/g, "");
  const out: string[] = [];

  if (
    /baby|toddler|0\s*[-–~to]?\s*6|영아|유아|0-6|0–6|아동\(0/.test(a) ||
    /0\s*~\s*6/.test(a)
  ) {
    out.push("baby");
  }
  if (
    /early|7\s*[-–~to]?\s*9|초등저|아동\(7|7-9|7–9/.test(a) ||
    /7\s*~\s*9/.test(a)
  ) {
    out.push("early");
  }
  if (
    /middle|10\s*[-–~to]?\s*12|초등고|아동\(10|10-12|10–12/.test(a) ||
    /10\s*~\s*12/.test(a)
  ) {
    out.push("middle");
  }
  if (
    /\bya\b|young.?adult|teen|청소년|12\+|13\+|14\+|15\+|16\+|17\+|18\+|중고등/.test(
      a
    ) ||
    /12\s*\+/.test(a)
  ) {
    out.push("ya");
  }
  // Adult-only free text does not map to child age bands
  return [...new Set(out)];
}

/**
 * Whether a book matches an age-band filter id.
 * `all-ages` matches only when the book has category id `all-ages`
 * (not other age bands, not free-text age cell).
 */
export function bookMatchesAgeFilter(
  book: { age?: string; category?: string; categories?: string[] },
  ageId: string
): boolean {
  const id = normalizeCategoryId(ageId);
  if (!isAgeCategoryId(id)) return false;
  const cats = bookCategoryIds(book);
  if (cats.includes(id)) return true;
  // All Ages: explicit category id only — no "any age band" or age-text fallback
  if (id === "all-ages") return false;
  return ageBandIdsFromText(book.age).includes(id);
}

/** Ensure static/API titles always have categories[] */
export function withNormalizedCategories<
  T extends {
    category: string;
    categoryLabel: string;
    categoryLabelKo: string;
    categories?: string[];
    categoryLabels?: string[];
    categoryLabelsKo?: string[];
  },
>(book: T): T {
  const ids = bookCategoryIds(book);
  const list = ids.length ? ids : ["nonfiction"];
  const labels = list.map(
    (id) => EXPORT_CATEGORY_META[id]?.label || book.categoryLabel || id
  );
  const labelsKo = list.map(
    (id) => EXPORT_CATEGORY_META[id]?.labelKo || book.categoryLabelKo || id
  );
  return {
    ...book,
    category: list[0],
    categoryLabel: labels[0],
    categoryLabelKo: labelsKo[0],
    categories: list,
    categoryLabels: labels,
    categoryLabelsKo: labelsKo,
  };
}
