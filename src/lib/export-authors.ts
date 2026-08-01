import type { ExportTitle } from "@/lib/types";
import { hasRichMarkup } from "@/lib/sheet-rich-text";

/** Stable URL slug from a person / org name (keeps Hangul). */
export function slugifyName(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "author"
  );
}

/** One credited person on a title (co-authors supported via author2 columns). */
export type BookAuthor = {
  /** 1 = author/authorEn, 2 = author2/author2En */
  slot: 1 | 2;
  name: string;
  nameEn?: string;
  bio?: string;
  bioKo?: string;
  slug: string;
};

function cleanName(raw: string | undefined | null): string {
  const s = String(raw ?? "").trim();
  if (!s || s === "—" || s === "-") return "";
  return s;
}

/**
 * Authors credited on a book (up to 2 people).
 * Sheet: author + authorEn (1st), author2 + author2En (2nd).
 */
export function bookAuthors(book: ExportTitle): BookAuthor[] {
  const list: BookAuthor[] = [];

  const n1 = cleanName(book.author);
  const e1 = cleanName(book.authorEn);
  if (n1 || e1) {
    list.push({
      slot: 1,
      name: n1 || e1,
      nameEn: e1 || undefined,
      bio: book.authorBio,
      bioKo: book.authorBioKo,
      slug: slugifyName(e1 || n1 || "author"),
    });
  }

  const n2 = cleanName(book.author2);
  const e2 = cleanName(book.author2En);
  if (n2 || e2) {
    list.push({
      slot: 2,
      name: n2 || e2,
      nameEn: e2 || undefined,
      bio: book.authorBio2,
      bioKo: book.authorBio2Ko,
      slug: slugifyName(e2 || n2 || "author"),
    });
  }

  return list;
}

/** Preferred slug for primary author (first credit). */
export function authorSlugFromBook(book: ExportTitle): string {
  const authors = bookAuthors(book);
  return authors[0]?.slug || "author";
}

export function authorHref(author: BookAuthor | ExportTitle): string {
  if ("slug" in author && "slot" in author) {
    return `/export/author/${encodeURIComponent(author.slug)}`;
  }
  return `/export/author/${encodeURIComponent(authorSlugFromBook(author))}`;
}

/** Match book if any credited author matches the page slug. */
export function bookMatchesAuthorSlug(
  book: ExportTitle,
  slug: string
): boolean {
  if (!slug) return false;
  return bookAuthors(book).some((a) => {
    const candidates = [a.nameEn, a.name]
      .filter(Boolean)
      .map((n) => slugifyName(String(n)));
    return candidates.includes(slug) || a.slug === slug;
  });
}

/** Display label for lists (lang-aware caller uses t()). */
export function formatAuthorsLine(
  book: ExportTitle,
  t: (en: string, ko: string) => string
): string {
  return bookAuthors(book)
    .map((a) => t(a.nameEn || a.name, a.name))
    .join(" · ");
}

export type AuthorProfile = {
  slug: string;
  name: string;
  nameEn?: string;
  bio?: string;
  bioKo?: string;
  books: ExportTitle[];
};

function pickBestBio(
  candidates: (string | undefined)[]
): string | undefined {
  const filled = candidates
    .map((s) => (s || "").trim())
    .filter(Boolean);
  if (!filled.length) return undefined;
  const rich = filled.find((s) => hasRichMarkup(s));
  if (rich) return rich;
  return filled.sort((a, b) => b.length - a.length)[0];
}

/**
 * Names/bios for this slug taken from each book's matching author slot
 * (author1 vs author2).
 */
function authorCreditOnBook(
  book: ExportTitle,
  slug: string
): BookAuthor | null {
  return bookAuthors(book).find((a) => {
    const candidates = [a.nameEn, a.name]
      .filter(Boolean)
      .map((n) => slugifyName(String(n)));
    return candidates.includes(slug) || a.slug === slug;
  }) || null;
}

/**
 * Build author profile from catalog titles for a given slug.
 * Supports co-authors: a book with author2 still appears under both people.
 */
export function getAuthorProfile(
  titles: ExportTitle[],
  slug: string
): AuthorProfile | null {
  const books = titles.filter((b) => bookMatchesAuthorSlug(b, slug));
  if (!books.length) return null;

  const credits = books
    .map((b) => authorCreditOnBook(b, slug))
    .filter((c): c is BookAuthor => Boolean(c));

  const nameKo =
    credits.map((c) => c.name).find((n) => n) ||
    books[0].author ||
    "";
  const nameEn =
    credits.map((c) => c.nameEn).find((n) => n && n.trim()) || undefined;

  const bio = pickBestBio(credits.map((c) => c.bio));
  const bioKo = pickBestBio(credits.map((c) => c.bioKo));

  return {
    slug,
    name: nameKo,
    nameEn,
    bio,
    bioKo,
    books,
  };
}

/** Korean publisher label for sort / filter (prefer KO `publisher`). */
export function publisherSortKey(book: ExportTitle): string {
  return (book.publisher || book.publisherEn || "").trim().toLowerCase();
}

export function authorSortKey(book: ExportTitle): string {
  const a = bookAuthors(book)[0];
  return (a?.name || a?.nameEn || "").trim().toLowerCase();
}

/**
 * Unique author profiles (co-authors counted separately).
 */
export function listAuthorProfiles(titles: ExportTitle[]): AuthorProfile[] {
  const bySlug = new Map<string, true>();
  for (const book of titles) {
    for (const a of bookAuthors(book)) {
      if (a.slug && a.slug !== "author") bySlug.set(a.slug, true);
    }
  }

  const profiles: AuthorProfile[] = [];
  for (const slug of bySlug.keys()) {
    const profile = getAuthorProfile(titles, slug);
    if (profile) profiles.push(profile);
  }

  profiles.sort((a, b) => {
    const an = (a.nameEn || a.name || "").toLowerCase();
    const bn = (b.nameEn || b.name || "").toLowerCase();
    return an.localeCompare(bn, "en");
  });
  return profiles;
}
