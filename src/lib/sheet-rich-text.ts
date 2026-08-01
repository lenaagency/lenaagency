/**
 * Sheet → web rich text
 * Supports:
 *  - HTML subset: <b> <strong> <i> <em> <u> <br> <span style="color:…">
 *    also <font color="…">, span font-weight / font-style
 *  - Markdown-lite: **bold** *italic* __bold__ _italic_
 *  - Color: {#c41e3a}text{/} or [color=#c41e3a]text[/color]
 *  - Escaped tags from some CSV paths: &lt;b&gt;…&lt;/b&gt;
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
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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

/**
 * Some exports double-escape markup as &lt;b&gt;. Decode once when that pattern appears.
 */
export function unescapeSheetHtmlEntities(input: string): string {
  if (!input) return "";
  if (!/&lt;\/?(?:b|strong|i|em|u|br|span|font)\b/i.test(input)) {
    return input;
  }
  return input
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&");
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
 * Normalize legacy / Sheets-exported tags before sanitizing.
 * - <font color="…"> → <span style="color:…">
 * - strip disallowed attributes on allowed tags later
 */
function normalizeLegacyTags(html: string): string {
  return html
    .replace(/<font\b([^>]*)>/gi, (_, attrs: string) => {
      const colorMatch = String(attrs).match(
        /color\s*=\s*["']?([^"'\s>]+)/i
      );
      if (!colorMatch) return "<span>";
      const color = normalizeColor(colorMatch[1]);
      if (!color) return "<span>";
      return `<span style="color:${color}">`;
    })
    .replace(/<\/font>/gi, "</span>");
}

/**
 * Sanitize to a safe HTML string for dangerouslySetInnerHTML.
 * Escapes unknown tags; only allows formatting tags above.
 */
export function sanitizeSheetHtml(raw: string): string {
  if (!raw) return "";

  let html = unescapeSheetHtmlEntities(String(raw));
  html = normalizeLegacyTags(html);

  // If no tags / markdown markers, escape and return
  const hasMarkup =
    /<\/?[a-z][\s\S]*>/i.test(html) ||
    /\*\*|__|(?<!\w)_(?!\w)|\*(?!\*)|\{#|\[color=/i.test(html);

  if (!/<\/?[a-z]/i.test(html)) {
    // plain or markdown only — escape first then apply markdown
    html = escapeHtml(html);
    html = markdownLiteToHtml(html);
    return html.replace(/\n/g, "<br />");
  }

  // Has HTML — convert markdown outside tags carefully is hard; apply lite then sanitize
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
    if (name === "font") return "</span>";
    return ALLOWED_TAGS.has(name) && name !== "br" ? `</${name}>` : "";
  }

  const open = tag.match(/^<\s*([a-z0-9]+)(\s[^>]*)?\/?>$/i);
  if (!open) return "";

  const name = open[1].toLowerCase();
  const attrs = open[2] || "";

  if (name === "br") return "<br />";
  if (name === "font") {
    // already normalized usually; keep as fallback
    const colorMatch = attrs.match(/color\s*=\s*["']?([^"'\s>]+)/i);
    if (!colorMatch) return "<span>";
    const color = normalizeColor(colorMatch[1]);
    return color ? `<span style="color:${color}">` : "<span>";
  }

  if (!ALLOWED_TAGS.has(name)) return "";

  if (name === "span") {
    const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i);
    if (!styleMatch) return "<span>";
    const style = styleMatch[1];
    const parts: string[] = [];

    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    if (colorMatch) {
      const color = normalizeColor(colorMatch[1]);
      if (color) parts.push(`color:${color}`);
    }

    const weightMatch = style.match(
      /(?:^|;)\s*font-weight\s*:\s*(bold|[6-9]00)\b/i
    );
    if (weightMatch) parts.push("font-weight:bold");

    const italicMatch = style.match(
      /(?:^|;)\s*font-style\s*:\s*italic\b/i
    );
    if (italicMatch) parts.push("font-style:italic");

    const decoMatch = style.match(
      /(?:^|;)\s*text-decoration\s*:\s*underline\b/i
    );
    if (decoMatch) parts.push("text-decoration:underline");

    if (!parts.length) return "<span>";
    return `<span style="${parts.join(";")}">`;
  }

  // b strong i em u — no attributes
  return `<${name}>`;
}

/** True if string contains formatting worth HTML render */
export function hasRichMarkup(input: string | undefined | null): boolean {
  if (!input) return false;
  const s = String(input);
  return (
    /<\/?(?:b|strong|i|em|u|br|span|font)\b/i.test(s) ||
    /&lt;\/?(?:b|strong|i|em|u|br|span|font)\b/i.test(s) ||
    /\*\*[^*]+\*\*/.test(s) ||
    /\*[^*]+\*/.test(s) ||
    /__[^_]+__/.test(s) ||
    /\{#[0-9a-fA-F]{3,8}\}/.test(s) ||
    /\[color=/i.test(s)
  );
}
