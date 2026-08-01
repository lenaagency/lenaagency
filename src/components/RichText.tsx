import {
  hasRichMarkup,
  sanitizeSheetHtml,
  stripRichText,
} from "@/lib/sheet-rich-text";

type Props = {
  text: string | undefined | null;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
  className?: string;
};

/**
 * Renders Google Sheet text with bold / italic / color markup.
 * Safe HTML subset only (see sheet-rich-text.ts).
 *
 * Always runs sanitize for multi-line or marked-up text so
 * synopsis / coverCopy / authorBio from Titles show sheet formatting
 * on export detail and author pages.
 */
export function RichText({ text, as = "span", className }: Props) {
  const raw = text ?? "";
  const Tag = as;

  if (!raw) return null;

  const needsHtml =
    hasRichMarkup(raw) ||
    raw.includes("\n") ||
    /<br\s*\/?>/i.test(raw);

  if (!needsHtml) {
    return <Tag className={className}>{raw}</Tag>;
  }

  // Always sanitize when markup or line breaks exist — keeps <i>/<b>/color safe
  const html = sanitizeSheetHtml(raw);
  const classes = ["rich-text", className].filter(Boolean).join(" ");

  return (
    <Tag
      className={classes}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Plain string for attributes / search */
export function plainText(text: string | undefined | null): string {
  return stripRichText(text);
}
