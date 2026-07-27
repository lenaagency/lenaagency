import * as XLSX from "xlsx";
import type { RoyaltyContract } from "@/lib/royalty-types";

/** Split original / Korean titles from sheet title (supports [], ［］, 【】) */
export function splitBookTitles(c: Pick<RoyaltyContract, "title" | "titleKo">) {
  const raw = (c.title || "").trim();
  let korean = (c.titleKo && c.titleKo.trim()) || "";
  let original = raw;

  if (!korean) {
    const m =
      raw.match(/\[([^\]]+)\]\s*$/) ||
      raw.match(/［([^］]+)］\s*$/) ||
      raw.match(/【([^】]+)】\s*$/);
    if (m) korean = m[1].trim();
  }

  original =
    raw
      .replace(/\s*\[[^\]]+\]\s*$/, "")
      .replace(/\s*［[^］]+］\s*$/, "")
      .replace(/\s*【[^】]+】\s*$/, "")
      .trim() || raw;

  if (!korean && raw && !/[A-Za-z]{3,}/.test(raw)) {
    korean = raw;
    original = "";
  }

  return { korean: korean || "", original: original || "" };
}

/**
 * Excel headers: English only.
 * Korean title values stay in Korean (content exception).
 */
const EXCEL_HEADERS = [
  "Contract Date",
  "Original Title",
  "Korean Title",
  "Publisher",
  "Royalty Rate",
  "Advance",
  "Currency",
  "FX Rate",
  "Publication Deadline",
  "Contract Expiration",
  "Publication Date",
  "First Print Run",
  "Retail Price",
  "Ebook/Audiobook Net Receipts",
  "Previous Year Stock",
  "Year Printed Copies",
  "Year Destroyed/Giveaway",
  "Year Sales Copies",
  "Cumulative Sales",
  "Current Stock",
  "Year Royalty Amount",
  "Remaining Advance",
  "Excess Royalty Amount",
] as const;

function cell(v: string | number | null | undefined): string | number {
  if (v == null || v === "") return "";
  return v;
}

export function contractsToExcelRows(contracts: RoyaltyContract[]): (string | number)[][] {
  const rows: (string | number)[][] = [Array.from(EXCEL_HEADERS)];

  for (const c of contracts) {
    const { original, korean } = splitBookTitles(c);
    rows.push([
      cell(c.contractDate),
      cell(original),
      cell(korean), // Korean title content — only non-English values
      cell(c.publisher || c.org),
      cell(c.royaltyRate),
      cell(c.advance),
      cell(c.currency),
      cell(c.fxRate),
      cell(c.pubDeadline),
      cell(c.expiration),
      cell(c.pubDate),
      cell(c.firstPrintRun),
      cell(c.retailPrice),
      cell(c.ebookNetReceipts),
      cell(c.prevStock),
      cell(c.printed2025),
      cell(c.destroyed2025),
      cell(c.salesQty),
      cell(c.totalSold),
      cell(c.currentStock),
      cell(c.royaltyAmount),
      cell(c.remainingAdvance),
      cell(c.paymentDue),
    ]);
  }

  return rows;
}

/** Build .xlsx buffer for download */
export function buildRoyaltyExcelBuffer(contracts: RoyaltyContract[]): Buffer {
  const rows = contractsToExcelRows(contracts);
  const sheet = XLSX.utils.aoa_to_sheet(rows);

  // Reasonable column widths
  sheet["!cols"] = EXCEL_HEADERS.map((h) => ({
    wch: Math.min(36, Math.max(12, h.length + 2)),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Royalty Reports");

  const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return out;
}

export function royaltyExcelFilename(org: string, role: string): string {
  const safe = (org || role || "royalties")
    .replace(/[^\w가-힣\-]+/g, "_")
    .slice(0, 40);
  const day = new Date().toISOString().slice(0, 10);
  return `lena-royalty-reports_${safe}_${day}.xlsx`;
}
