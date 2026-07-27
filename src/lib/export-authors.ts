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

/** Preferred slug for an author (English name if present, else Korean). */
export function authorSlugFromBook(book: ExportTitle): string {
  return slugifyName(book.authorEn || book.author || "author");
}

/** Match book to an author page slug (handles KO/EN variants). */
export function bookMatchesAuthorSlug(
  book: ExportTitle,
  slug: string
): boolean {
  if (!slug) return false;
  const candidates = [book.authorEn, book.author]
    .filter(Boolean)
    .map((n) => slugifyName(String(n)));
  return candidates.includes(slug) || authorSlugFromBook(book) === slug;
}

export type AuthorProfile = {
  slug: string;
  /** Korean / primary display name */
  name: string;
  /** English display name when available */
  nameEn?: string;
  bio?: string;
  bioKo?: string;
  books: ExportTitle[];
};

/** Prefer a bio cell that already has sheet HTML / markup. */
function pickBestBio(
  candidates: (string | undefined)[]
): string | undefined {
  const filled = candidates
    .map((s) => (s || "").trim())
    .filter(Boolean);
  if (!filled.length) return undefined;
  const rich = filled.find((s) => hasRichMarkup(s));
  // Prefer longer text when no markup (more complete intro)
  if (rich) return rich;
  return filled.sort((a, b) => b.length - a.length)[0];
}

/**
 * Build author profile from catalog titles for a given slug.
 * Bio is taken from authorBio / authorBioKo (prefers HTML-formatted cells).
 */
export function getAuthorProfile(
  titles: ExportTitle[],
  slug: string
): AuthorProfile | null {
  const books = titles.filter((b) => bookMatchesAuthorSlug(b, slug));
  if (!books.length) return null;

  const nameKo =
    books.map((b) => b.author).find((n) => n && n !== "—") || books[0].author;
  const nameEn =
    books.map((b) => b.authorEn).find((n) => n && n.trim()) || undefined;

  const bio = pickBestBio(books.map((b) => b.authorBio));
  const bioKo = pickBestBio(books.map((b) => b.authorBioKo));

  return {
    slug,
    name: nameKo,
    nameEn,
    bio,
    bioKo,
    books,
  };
}

export function authorHref(book: ExportTitle): string {
  return `/export/author/${encodeURIComponent(authorSlugFromBook(book))}`;
}

/** Korean publisher label for sort / filter (prefer KO `publisher`). */
export function publisherSortKey(book: ExportTitle): string {
  return (book.publisher || book.publisherEn || "").trim().toLowerCase();
}

export function authorSortKey(book: ExportTitle): string {
  return (book.author || book.authorEn || "").trim().toLowerCase();
}
