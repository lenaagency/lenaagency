/**
 * Sheet → web rich text
 * Supports:
 *  - HTML subset: <b> <strong> <i> <em> <u> <br> <span style="color:…">
 *  - Markdown-lite: **bold** *italic* __bold__ _italic_
 *  - Color: {#c41e3a}text{/} or [color=#c41e3a]text[/color]
 */

const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "br",
  "span",
]);

/** Strip tags for search / plain fallbacks */
export function stripRichText(input: string | undefined | null): string {
  if (!input) return "";
  return String(input)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\{\#[^}]+\}/g, "")
    .replace(/\{\/\}/g, "")
    .replace(/\[color=[^\]]+\]/gi, "")
    .replace(/\[\/color\]/gi, "")
    .replace(/\*\*|__|\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeColor(raw: string): string | null {
  const c = raw.trim().toLowerCase();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(c)) return c;
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(c)) return c;
  // named colors — limited safe set
  const named = [
    "red",
    "blue",
    "green",
    "navy",
    "teal",
    "purple",
    "maroon",
    "orange",
    "coral",
    "crimson",
    "black",
    "gray",
    "grey",
  ];
  if (named.includes(c)) return c;
  return null;
}

/** Convert markdown-lite + color shortcodes to HTML (before sanitize) */
export function markdownLiteToHtml(input: string): string {
  let s = input;
  // {#hex}text{/}
  s = s.replace(
    /\{#([0-9a-fA-F]{3,8})\}([\s\S]*?)\{\/\}/g,
    (_, hex, text) => `<span style="color:#${hex}">${text}</span>`
  );
  // [color=#hex|name]text[/color]
  s = s.replace(
    /\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi,
    (_, col, text) => {
      const safe = normalizeColor(String(col));
      if (!safe) return text;
      return `<span style="color:${safe}">${text}</span>`;
    }
  );
  // **bold** / __bold__ first
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  // *italic* (remaining single asterisks)
  s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  // _italic_ (word-ish underscores)
  s = s.replace(
    /(^|[^a-zA-Z0-9])_([^_\n]+)_(?![a-zA-Z0-9])/g,
    "$1<em>$2</em>"
  );
  return s;
}

/**
 * Sanitize to a safe HTML string for dangerouslySetInnerHTML.
 * Escapes unknown tags; only allows formatting tags above.
 */
export function sanitizeSheetHtml(raw: string): string {
  if (!raw) return "";
  // If no tags / markdown markers, escape and return (newlines kept as text; CSS pre-line)
  const hasMarkup =
    /<\/?[a-z][\s\S]*>/i.test(raw) ||
    /\*\*|__|(?<!\w)_(?!\w)|\*(?!\*)|\{#|\[color=/i.test(raw);

  let html = raw;
  if (!/<\/?[a-z]/i.test(html)) {
    // plain or markdown only — escape first then apply markdown
    html = escapeHtml(html);
    html = markdownLiteToHtml(html);
    // markdownLite may not re-escape content inside — content already escaped
    return html.replace(/\n/g, "<br />");
  }

  // Has HTML — convert markdown first on raw carefully, then sanitize tokens
  html = markdownLiteToHtml(html);

  // Tokenize tags vs text
  const parts = html.split(/(<[^>]+>)/g);
  let out = "";
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("<") && part.endsWith(">")) {
      out += sanitizeTag(part);
    } else {
      out += escapeHtml(part).replace(/\n/g, "<br />");
    }
  }
  return out;
}

function sanitizeTag(tag: string): string {
  const selfCloseBr = /^<br\s*\/?>$/i.test(tag);
  if (selfCloseBr) return "<br />";

  const close = tag.match(/^<\/\s*([a-z0-9]+)\s*>$/i);
  if (close) {
    const name = close[1].toLowerCase();
    return ALLOWED_TAGS.has(name) && name !== "br" ? `</${name}>` : "";
  }

  const open = tag.match(/^<\s*([a-z0-9]+)(\s[^>]*)?\/?>$/i);
  if (!open) return "";

  const name = open[1].toLowerCase();
  if (!ALLOWED_TAGS.has(name)) return "";
  if (name === "br") return "<br />";

  if (name === "span") {
    const styleMatch = (open[2] || "").match(
      /style\s*=\s*["']([^"']*)["']/i
    );
    if (!styleMatch) return "<span>";
    const colorMatch = styleMatch[1].match(
      /(?:^|;)\s*color\s*:\s*([^;]+)/i
    );
    if (!colorMatch) return "<span>";
    const color = normalizeColor(colorMatch[1]);
    if (!color) return "<span>";
    return `<span style="color:${color}">`;
  }

  // b strong i em u — no attributes
  return `<${name}>`;
}

/** True if string contains formatting worth HTML render */
export function hasRichMarkup(input: string | undefined | null): boolean {
  if (!input) return false;
  return (
    /<\/?(?:b|strong|i|em|u|br|span)\b/i.test(input) ||
    /\*\*[^*]+\*\*/.test(input) ||
    /\*[^*]+\*/.test(input) ||
    /__[^_]+__/.test(input) ||
    /\{#[0-9a-fA-F]{3,8}\}/.test(input) ||
    /\[color=/i.test(input)
  );
}
