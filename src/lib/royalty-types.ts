/**
 * admin — full access, all contracts, edit + export
 * publisher — filter by 출판사, edit royalty report fields
 * rights_holder — filter by 저작권사, view-only + Excel export (no input)
 * partner — legacy alias treated as publisher
 */
export type MemberRole = "admin" | "publisher" | "rights_holder" | "partner";

export type RoyaltyMember = {
  email: string;
  name: string;
  role: MemberRole;
  /**
   * Filter key:
   * - publisher/partner → 계약목록 `출판사` column
   * - rights_holder → 계약목록 `저작권사` column
   * Example: "전나무숲" or "Chelsea Green"
   */
  org: string;
  passwordHash?: string;
  passwordPlain?: string;
};

/** True when the role may submit royalty report edits */
export function canEditRoyalties(role: string | undefined | null): boolean {
  return role === "admin" || role === "publisher" || role === "partner";
}

/** True when the role is a rights-holder (view + export only) */
export function isRightsHolder(role: string | undefined | null): boolean {
  return role === "rights_holder";
}

/** Normalize legacy `partner` → `publisher` for UI labels */
export function normalizeMemberRole(role: string | undefined | null): MemberRole {
  if (role === "admin") return "admin";
  if (role === "rights_holder") return "rights_holder";
  if (role === "publisher" || role === "partner") return "publisher";
  return "publisher";
}

/**
 * Fields editable on the web 인세보고 form (matches 계약목록 columns).
 */
export type RoyaltyEditableFields = {
  contractDate?: string;
  rightsHolder?: string;
  country?: string;
  /** 출판사 — also stored as org for filtering */
  org?: string;
  publisher?: string;
  title?: string;
  royaltyRate?: string;
  advance?: number | null;
  currency?: string;
  fxRate?: number | null;
  pubDeadline?: string;
  expiration?: string;
  sellOff?: string;
  pubDate?: string;
  firstPrintRun?: number | null;
  retailPrice?: number | null;
  ebookNetReceipts?: number | null;
  prevStock?: number | null;
  /** 해당년도 인쇄부수 */
  printed2025?: number | null;
  /** 해당년도 증정 및 파기부수 */
  destroyed2025?: number | null;
  /** 해당년도 판매부수 */
  salesQty?: number | null;
  /** 누적 판매부수 (자동: 직전 누적 + 해당년도 판매) */
  totalSold?: number | null;
  /**
   * 해당년도 판매 직전 누적 부수 (시트 로드 시 고정, 웹 비표시·미저장)
   * 누적 = prevCumulativeBase + salesQty
   */
  prevCumulativeBase?: number | null;
  currentStock?: number | null;
  /** 해당년도 로열티 발생금액 */
  royaltyAmount?: number | null;
  remainingAdvance?: number | null;
  /** 초과 인세 발생금액 */
  paymentDue?: number | null;
  /**
   * 인세보고 완료 여부 (회원 선택)
   * incomplete | complete
   */
  reportComplete?: "incomplete" | "complete" | "";
};

export type RoyaltyContract = {
  id: string;
  /** 1-based row index in the rights sheet (for write-back) */
  sheetRow?: number;
  /** 파일 번호 e.g. A1, E151 */
  fileNo?: string;
  title: string;
  titleKo?: string;
  author?: string;
  /** Filter key — 출판사(publisher) */
  org: string;
  publisher?: string;
  rightsHolder?: string;
  country?: string;
  partnerSide?: string;
  counterparty?: string;
  offerDate?: string;
  contractDate?: string;
  royaltyRate?: string;
  advance?: number | null;
  currency?: string;
  fxRate?: number | null;
  commission?: number | null;
  progressFee?: number | null;
  revenue?: number | null;
  status?: string;
  pubDeadline?: string;
  expiration?: string;
  sellOff?: string;
  pubDate?: string;
  firstPrintRun?: number | null;
  retailPrice?: number | null;
  ebookNetReceipts?: number | null;
  prevStock?: number | null;
  printed2025?: number | null;
  destroyed2025?: number | null;
  salesQty?: number | null;
  totalSold?: number | null;
  currentStock?: number | null;
  royaltyAmount?: number | null;
  remainingAdvance?: number | null;
  paymentDue?: number | null;
  /** 인세보고 완료 여부 */
  reportComplete?: "incomplete" | "complete" | "";
  pdfUrl?: string;
  notes?: string;
  territory?: string;
  rightsType?: string;
  periodStart?: string;
  periodEnd?: string;
};

export type RoyaltySessionUser = {
  email: string;
  name: string;
  role: MemberRole;
  org: string;
};

/** String fields in the edit form */
export const ROYALTY_STRING_KEYS: (keyof RoyaltyEditableFields)[] = [
  "contractDate",
  "rightsHolder",
  "country",
  "org",
  "publisher",
  "title",
  "royaltyRate",
  "currency",
  "pubDeadline",
  "expiration",
  "sellOff",
  "pubDate",
  "reportComplete",
];

/** Number fields in the edit form */
export const ROYALTY_NUMBER_KEYS: (keyof RoyaltyEditableFields)[] = [
  "advance",
  "fxRate",
  "firstPrintRun",
  "retailPrice",
  "ebookNetReceipts",
  "prevStock",
  "printed2025",
  "destroyed2025",
  "salesQty",
  "totalSold",
  "currentStock",
  "royaltyAmount",
  "remainingAdvance",
  "paymentDue",
];
