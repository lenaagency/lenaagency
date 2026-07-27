import { readFileSync, existsSync } from "fs";
import path from "path";
import { parseCsv } from "@/lib/sheets-export";
import type { RoyaltyContract } from "@/lib/royalty-types";

/** Live Google Sheet — 계약목록 (Sujin Drive) */
export const CONTRACTS_SHEET_ID_DEFAULT =
  "1YqGUGhG3k7mAencYCVzusWpUqEQ8ZFyt8fey1PFEH7k";

function normHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "_")
    .replace(/[^a-z0-9_가-힣]/g, "");
}

/**
 * Map 계약목록 / English template headers → RoyaltyContract keys.
 * Real sheet headers from rights tab.
 */
const HEADER_MAP: Record<string, keyof RoyaltyContract | "file" | "raw"> = {
  // file no (column A often unnamed or "파일")
  파일: "fileNo",
  file: "fileNo",
  file_no: "fileNo",
  fileno: "fileNo",
  id: "id",
  contract_id: "id",

  오퍼일: "offerDate",
  offer_date: "offerDate",
  offerdate: "offerDate",

  계약일agreement_date: "contractDate",
  계약일: "contractDate",
  agreement_date: "contractDate",
  contract_date: "contractDate",
  contractdate: "contractDate",

  저작권사: "rightsHolder",
  rights_holder: "rightsHolder",
  rightsholder: "rightsHolder",
  licensor: "rightsHolder",

  국가: "country",
  country: "country",

  출판사publisher: "org",
  출판사: "org",
  publisher: "org",
  org: "org",
  organization: "org",

  제목title: "title",
  제목: "title",
  title: "title",
  book_title: "title",

  인세율royalty_rates: "royaltyRate",
  인세율: "royaltyRate",
  royalty_rates: "royaltyRate",
  royalty_rate: "royaltyRate",
  royaltyrate: "royaltyRate",
  rate: "royaltyRate",

  선인세advance: "advance",
  선인세: "advance",
  advance: "advance",

  통화: "currency",
  currency: "currency",

  환율currency_rate: "fxRate",
  환율: "fxRate",
  currency_rate: "fxRate",
  fx_rate: "fxRate",

  커미션: "commission",
  commission: "commission",

  진행료: "progressFee",
  progress_fee: "progressFee",

  매출금액: "revenue",
  revenue: "revenue",

  계약_진행상황: "status",
  계약진행상황: "status",
  status: "status",

  출간기한_publication_deadline: "pubDeadline",
  출간기한publication_deadline: "pubDeadline",
  출간기한: "pubDeadline",
  publication_deadline: "pubDeadline",
  pub_deadline: "pubDeadline",

  계약만료일expiration_date: "expiration",
  계약만료일: "expiration",
  expiration_date: "expiration",
  expiration: "expiration",

  selloff: "sellOff",
  sell_off: "sellOff",
  "sell-off": "sellOff",

  출간일_publication_date: "pubDate",
  출간일publication_date: "pubDate",
  출간일: "pubDate",
  publication_date: "pubDate",
  pub_date: "pubDate",

  초판부수_first_printrun: "firstPrintRun",
  초판부수first_printrun: "firstPrintRun",
  초판부수: "firstPrintRun",
  first_print_run: "firstPrintRun",

  정가_retail_price_krw: "retailPrice",
  정가retail_price_krw: "retailPrice",
  정가: "retailPrice",
  retail_price: "retailPrice",

  전자책오디오북_순수입ebookaudiobook_net_receipts_krw: "ebookNetReceipts",
  ebook_net: "ebookNetReceipts",

  전년도_재고부수_no_of_copies_in_previous_stock: "prevStock",
  전년도재고부수: "prevStock",

  "2025_인쇄부수_no_of_copies_printed_in_2025": "printed2025",
  "2025인쇄부수": "printed2025",

  "2025_증정_및_파기부수_no_of_copies_destroyedgiveaway_in_2025": "destroyed2025",
  "2025증정및파기부수": "destroyed2025",

  "2025_판매부수_no_of_copies_sold_in_2025": "salesQty",
  "2025판매부수": "salesQty",
  sales_qty: "salesQty",
  sales: "salesQty",
  판매부수: "salesQty",

  누적_판매부수_total_no_of_copies_sold_since_publication: "totalSold",
  누적판매부수: "totalSold",
  total_sold: "totalSold",

  당기_재고부수_no_of_copies_in_current_stock: "currentStock",
  당기재고부수: "currentStock",

  "2025_로열티_발생금액_royalties_in_2025_krw": "royaltyAmount",
  "2025로열티발생금액": "royaltyAmount",
  "2025_로열티_발생금액_royalties_in_2025_krw_": "royaltyAmount",
  royalty_amount: "royaltyAmount",
  royalties_2025: "royaltyAmount",
  인세: "royaltyAmount",
  인세금액: "royaltyAmount",

  선인세_잔여금액_previously_ramaining_royalties_krw: "remainingAdvance",
  선인세잔여금액: "remainingAdvance",
  remaining_advance: "remainingAdvance",

  초과_로열티_발생금액_royalties_payment_due_krw: "paymentDue",
  초과로열티발생금액: "paymentDue",
  payment_due: "paymentDue",

  pdf_url: "pdfUrl",
  pdf: "pdfUrl",
  drive_url: "pdfUrl",
  notes: "notes",
  비고: "notes",
  title_ko: "titleKo",
  author: "author",
  저자: "author",

  report_complete: "reportComplete",
  reportcomplete: "reportComplete",
  완료여부: "reportComplete",
  인세보고완료: "reportComplete",
  인세완료: "reportComplete",
  completion: "reportComplete",
  complete: "reportComplete",
};

function mapHeader(h: string): string {
  const raw = h.replace(/^\uFEFF/, "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  const n = normHeader(raw);
  // Try progressive keys for bilingual headers like "계약일(agreement date)"
  const candidates = [
    n,
    lower,
    raw,
    normHeader(raw.replace(/\([^)]*\)/g, "")),
    normHeader(raw.replace(/@.*$/, "")),
  ];
  for (const c of candidates) {
    if (c && HEADER_MAP[c]) return HEADER_MAP[c] as string;
  }
  // Fuzzy: contain key fragments
  if (/판매부수.*2025|2025.*판매/.test(raw)) return "salesQty";
  if (/로열티.*2025|2025.*로열티|royalties in 2025/i.test(raw))
    return "royaltyAmount";
  if (/선인세.*잔여|remaining royalt/i.test(raw)) return "remainingAdvance";
  if (/초과.*로열티|payment due/i.test(raw)) return "paymentDue";
  if (/출판사|publisher/i.test(raw)) return "org";
  if (/^제목|title/i.test(raw)) return "title";
  if (/인세율|royalty rate/i.test(raw)) return "royaltyRate";
  if (/저작권사/i.test(raw)) return "rightsHolder";
  if (/계약일|agreement date/i.test(raw)) return "contractDate";
  if (/출간기한|publication deadline/i.test(raw)) return "pubDeadline";
  if (/출간일|publication date/i.test(raw)) return "pubDate";
  if (/sell-?off/i.test(raw)) return "sellOff";
  if (/계약.*진행|status/i.test(raw)) return "status";
  if (/^통화$|currency/i.test(raw)) return "currency";
  if (/선인세|advance/i.test(raw) && !/잔여/.test(raw)) return "advance";
  if (/누적.*판매|total no of copies sold/i.test(raw)) return "totalSold";
  if (/당기.*재고|current stock/i.test(raw)) return "currentStock";
  if (/국가|country/i.test(raw)) return "country";
  if (/계약만료|expiration/i.test(raw)) return "expiration";
  if (/초과.*인세|초과.*로열티|payment due/i.test(raw)) return "paymentDue";
  if (/완료여부|인세보고.?완료|report.?complete/i.test(raw)) return "reportComplete";
  return n;
}

/** Normalize sheet/web values → incomplete | complete | "" */
export function parseReportComplete(
  raw: string | undefined
): "incomplete" | "complete" | "" {
  if (!raw || !String(raw).trim()) return "";
  const s = String(raw).trim().toLowerCase();
  if (
    s === "complete" ||
    s === "done" ||
    s === "yes" ||
    s === "y" ||
    s === "완료" ||
    s === "완료함" ||
    s === "o" ||
    s === "true" ||
    s === "1"
  ) {
    return "complete";
  }
  if (
    s === "incomplete" ||
    s === "pending" ||
    s === "no" ||
    s === "n" ||
    s === "미완료" ||
    s === "미입력" ||
    s === "작성중" ||
    s === "false" ||
    s === "0"
  ) {
    return "incomplete";
  }
  // Korean bare
  if (raw.includes("완료") && !raw.includes("미")) return "complete";
  if (raw.includes("미완료") || raw.includes("미입력")) return "incomplete";
  return "";
}

/** Value written to Google Sheet AI column */
export function reportCompleteToSheet(
  v: "incomplete" | "complete" | "" | undefined
): string {
  if (v === "complete") return "완료";
  if (v === "incomplete") return "미완료";
  return "";
}

function parseNumber(raw: string | undefined): number | null {
  if (raw == null || !String(raw).trim()) return null;
  const s = String(raw).replace(/,/g, "").replace(/원/g, "").trim();
  if (!s || s === "-" || s === "—" || s.toLowerCase() === "n/a") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatRate(raw: string): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  const t = raw.trim();
  const n = Number(t);
  if (Number.isFinite(n) && n > 0 && n <= 1) return `${Math.round(n * 100)}%`;
  return t;
}

function formatDateCell(raw: string): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  const t = raw.trim();
  // Excel serial as number string e.g. 20190729
  if (/^\d{8}$/.test(t)) {
    return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`;
  }
  return t;
}

function extractTitleKo(title: string): string | undefined {
  const m = title.match(/\[([^\]]+)\]\s*$/);
  return m?.[1]?.trim() || undefined;
}

export function parseContractsCsv(text: string): RoyaltyContract[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  // Skip leading empty header cells; map columns
  const headers = rows[0].map(mapHeader);

  // If first data-looking header is empty, column 0 is fileNo
  if (!headers[0] || headers[0] === "") {
    headers[0] = "fileNo";
  }

  const out: RoyaltyContract[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const get = (key: string) => {
      const i = headers.indexOf(key);
      return i >= 0 ? (cells[i] ?? "").trim() : "";
    };

    const title = get("title");
    if (!title) continue;

    const org = get("org") || get("publisher") || "";
    const fileNo = get("fileNo") || get("id") || "";
    // CSV row index r (0=header) → Google Sheet 1-based row = r + 1
    const sheetRow = r + 1;
    const id = fileNo ? `${fileNo}-r${sheetRow}` : `row-${sheetRow}`;

    const royaltyRateRaw = get("royaltyRate");

    out.push({
      id,
      sheetRow,
      fileNo: fileNo || undefined,
      title,
      titleKo: extractTitleKo(title) || get("titleKo") || undefined,
      author: get("author") || undefined,
      org,
      publisher: org || undefined,
      rightsHolder: get("rightsHolder") || undefined,
      country: get("country") || undefined,
      partnerSide: "licensee",
      counterparty: get("rightsHolder") || undefined,
      offerDate: formatDateCell(get("offerDate")),
      contractDate: formatDateCell(get("contractDate")),
      royaltyRate: formatRate(royaltyRateRaw),
      advance: parseNumber(get("advance")),
      currency: get("currency") || undefined,
      fxRate: parseNumber(get("fxRate")),
      commission: parseNumber(get("commission")),
      progressFee: parseNumber(get("progressFee")),
      revenue: parseNumber(get("revenue")),
      status: get("status") || undefined,
      pubDeadline: get("pubDeadline") || undefined,
      expiration: get("expiration") || undefined,
      sellOff: get("sellOff") || undefined,
      pubDate: formatDateCell(get("pubDate")),
      firstPrintRun: parseNumber(get("firstPrintRun")),
      retailPrice: parseNumber(get("retailPrice")),
      ebookNetReceipts: parseNumber(get("ebookNetReceipts")),
      prevStock: parseNumber(get("prevStock")),
      printed2025: parseNumber(get("printed2025")),
      destroyed2025: parseNumber(get("destroyed2025")),
      salesQty: parseNumber(get("salesQty")),
      totalSold: parseNumber(get("totalSold")),
      currentStock: parseNumber(get("currentStock")),
      royaltyAmount: parseNumber(get("royaltyAmount")),
      remainingAdvance: parseNumber(get("remainingAdvance")),
      paymentDue: parseNumber(get("paymentDue")),
      reportComplete: parseReportComplete(get("reportComplete") || get("notes")),
      pdfUrl: get("pdfUrl") || undefined,
      notes: get("notes") || undefined,
      territory: get("country") || undefined,
    });
  }
  return out;
}

export function getContractsCsvUrl(): string | null {
  const full = process.env.GOOGLE_CONTRACTS_CSV_URL?.trim();
  if (full) return full;
  const id =
    process.env.GOOGLE_CONTRACTS_SHEETS_ID?.trim() ||
    CONTRACTS_SHEET_ID_DEFAULT;
  const gid = process.env.GOOGLE_CONTRACTS_GID?.trim() || "0";
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

function loadLocalCache(): {
  contracts: RoyaltyContract[];
  syncedAt?: string;
} | null {
  try {
    const p = path.join(process.cwd(), "data", "contracts-cache.json");
    if (!existsSync(p)) return null;
    const raw = readFileSync(p, "utf8");
    const data = JSON.parse(raw) as {
      contracts?: RoyaltyContract[];
      syncedAt?: string;
    };
    if (!data.contracts?.length) return null;
    return { contracts: data.contracts, syncedAt: data.syncedAt };
  } catch {
    return null;
  }
}

export async function fetchContractsFromSheet(opts?: {
  fresh?: boolean;
}): Promise<{
  contracts: RoyaltyContract[];
  source: "google_sheets" | "local_cache" | "sample";
  error?: string;
  syncedAt?: string;
}> {
  const url = getContractsCsvUrl();
  const fresh = Boolean(opts?.fresh);

  // 1) Live Google Sheet CSV (link viewer or better)
  if (url) {
    try {
      const bust = fresh ? `&_=${Date.now()}` : "";
      const res = await fetch(url + bust, {
        headers: { "User-Agent": "LENA-Agency-Royalties/1.0" },
        ...(fresh
          ? { cache: "no-store" as RequestCache }
          : { next: { revalidate: 60 } }),
      });
      if (res.ok) {
        const text = await res.text();
        if (!text.trimStart().startsWith("<!")) {
          const contracts = parseContractsCsv(text);
          if (contracts.length) {
            return { contracts, source: "google_sheets" };
          }
        }
      } else if (res.status === 401 || res.status === 403) {
        // fall through with hint
      }
    } catch {
      /* fall through to cache */
    }
  }

  // 2) Local cache from 계약목록.xlsx
  const cache = loadLocalCache();
  if (cache) {
    return {
      contracts: cache.contracts,
      source: "local_cache",
      syncedAt: cache.syncedAt,
      error:
        "Live sheet unavailable. Showing local export. Check sharing, or run npm run sync-contracts.",
    };
  }

  return {
    contracts: [],
    source: "sample",
    error: "No contract data. Connect Google Sheet or run npm run sync-contracts.",
  };
}

function orgMatches(userOrg: string, target: string): boolean {
  const key = normOrg(userOrg || "");
  const val = normOrg(target || "");
  if (!key || !val) return false;
  return val === key || val.includes(key) || key.includes(val);
}

export function userCanEditContract(
  role: string,
  userOrg: string,
  contract: RoyaltyContract
): boolean {
  // Rights holders are view-only
  if (role === "rights_holder") return false;
  if (role === "admin") return true;
  // publisher / partner (legacy)
  if (role !== "publisher" && role !== "partner") return false;
  const pub = contract.org || contract.publisher || "";
  return orgMatches(userOrg, pub);
}

/** Normalize publisher / rights-holder names for filtering */
function normOrg(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()（）]/g, "")
    .replace(/,/g, "");
}

/**
 * Admin → all rows.
 * Publisher (or legacy partner) → 출판사 matches member.org.
 * Rights holder → 저작권사 matches member.org.
 */
export function filterContractsForUser(
  contracts: RoyaltyContract[],
  role: string,
  org: string
): RoyaltyContract[] {
  if (role === "admin") return contracts;
  const key = normOrg(org || "");
  if (!key) return [];

  if (role === "rights_holder") {
    return contracts.filter((c) =>
      orgMatches(org, c.rightsHolder || c.counterparty || "")
    );
  }

  // publisher / partner / unknown → match 출판사
  return contracts.filter((c) =>
    orgMatches(org, c.org || c.publisher || "")
  );
}
