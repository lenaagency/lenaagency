/**
 * Google Drive “공유/보기” 링크는 HTML 페이지라 <img src>에 넣으면 깨짐.
 * 파일 id를 뽑아 직접 이미지 URL(lh3)로 바꿉니다.
 *
 * 지원 예:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID&export=download
 * - 이미 lh3 / thumbnail 이면 그대로
 */
export function normalizeCoverUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const url = raw.trim();
  if (!url) return undefined;

  // Local site path or already a direct image host
  if (url.startsWith("/")) return url;
  if (
    url.includes("lh3.googleusercontent.com") ||
    url.includes("googleusercontent.com/d/")
  ) {
    return url;
  }

  let fileId = "";

  // /file/d/FILE_ID/...
  const mFile = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (mFile) fileId = mFile[1];

  // ?id=FILE_ID or &id=FILE_ID
  if (!fileId) {
    const mId = url.match(/[?&]id=([^&#]+)/i);
    if (mId) fileId = decodeURIComponent(mId[1]);
  }

  // thumbnail?id= already usable — prefer stable lh3 form
  if (!fileId) {
    const mThumb = url.match(
      /drive\.google\.com\/thumbnail\?[^#]*id=([^&#]+)/i
    );
    if (mThumb) fileId = decodeURIComponent(mThumb[1]);
  }

  if (fileId) {
    // Direct image endpoint (image/* + CORS *)
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url;
}

/**
 * Parse sheet cell(s) into up to `max` image URLs.
 * Accepts one cell with URLs separated by newlines, `|`, or `;`
 * (commas only when the token looks like a URL, to avoid breaking query strings).
 */
export function parseImageUrlList(
  raw: string | undefined,
  max = 8
): string[] {
  if (!raw?.trim()) return [];
  const text = raw.trim();
  const parts = text
    .split(/[\n\r|;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // If no split happened and value has multiple http links, split on http
  if (parts.length === 1 && (text.match(/https?:\/\//gi) || []).length > 1) {
    const re = /https?:\/\/[^\s|,;]+/gi;
    const found = text.match(re) || [];
    return found
      .map((u) => normalizeCoverUrl(u))
      .filter((u): u is string => Boolean(u))
      .slice(0, max);
  }

  const out: string[] = [];
  for (const p of parts) {
    const n = normalizeCoverUrl(p);
    if (n && !out.includes(n)) out.push(n);
    if (out.length >= max) break;
  }
  return out;
}
