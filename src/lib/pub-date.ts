/**
 * Parse publication year/month from sheet `pubYear` cell.
 * Accepts: 2024 | 2024/3 | 2024/03 | 2024-3 | 2024-03 | 2024.3 | 2024년 3월
 */
export function parsePubDate(raw: string): { year: number; month?: number } {
  const s = raw.trim();
  if (!s) return { year: 0 };

  const ko = s.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월?$/);
  if (ko) {
    const year = parseInt(ko[1], 10);
    const month = clampMonth(parseInt(ko[2], 10));
    return month ? { year, month } : { year };
  }

  const split = s.match(/^(\d{4})\s*[/\-.\s]\s*(\d{1,2})\s*$/);
  if (split) {
    const year = parseInt(split[1], 10);
    const month = clampMonth(parseInt(split[2], 10));
    return month ? { year, month } : { year };
  }

  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) return { year: parseInt(yearOnly[1], 10) };

  // Fallback: leading 4-digit year (e.g. Excel serial leftovers still start with year)
  const leading = parseInt(s, 10);
  return Number.isFinite(leading) && leading >= 1000 && leading <= 9999
    ? { year: leading }
    : { year: 0 };
}

function clampMonth(m: number): number | undefined {
  if (!Number.isFinite(m) || m < 1 || m > 12) return undefined;
  return m;
}

/** Display as `2024` or `2024/3` (sheet-friendly year/month). */
export function formatPubDate(
  year: number | null | undefined,
  month?: number | null
): string {
  if (!year || year <= 0) return "";
  const m = month && month >= 1 && month <= 12 ? month : null;
  return m ? `${year}/${m}` : String(year);
}
