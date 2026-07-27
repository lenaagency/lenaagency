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
 */
export function RichText({ text, as = "span", className }: Props) {
  const raw = text ?? "";
  const Tag = as;

  if (!raw) return null;

  if (!hasRichMarkup(raw) && !raw.includes("\n")) {
    return <Tag className={className}>{raw}</Tag>;
  }

  // Newlines only — still use pre-line via CSS; plain text is fine
  if (!hasRichMarkup(raw)) {
    return <Tag className={className}>{raw}</Tag>;
  }

  const html = sanitizeSheetHtml(raw);
  return (
    <Tag
      className={className ? `${className} rich-text` : "rich-text"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Plain string for attributes / search */
export function plainText(text: string | undefined | null): string {
  return stripRichText(text);
}
