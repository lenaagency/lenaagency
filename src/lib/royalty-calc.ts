import type { RoyaltyEditableFields } from "@/lib/royalty-types";

/** Fields members enter on the web (highlighted) */
export const MEMBER_INPUT_KEYS: (keyof RoyaltyEditableFields)[] = [
  "pubDate",
  "firstPrintRun",
  "retailPrice",
  "ebookNetReceipts",
  "printed2025",
  "destroyed2025",
  "salesQty",
];

/** Fields calculated like the 계약목록 sheet formulas (read-only) */
export const AUTO_CALC_KEYS: (keyof RoyaltyEditableFields)[] = [
  "totalSold",
  "currentStock",
  "royaltyAmount",
  "paymentDue",
];

/**
 * One royalty tier on cumulative sales (since publication).
 * `upTo` = cumulative copies at which this rate ends (exclusive upper for next tier).
 * `upTo: null` = applies to all remaining copies.
 *
 * Example: "6% 10000, 7% 20000, 8%"
 * → [{ upTo: 10000, rate: 0.06 }, { upTo: 20000, rate: 0.07 }, { upTo: null, rate: 0.08 }]
 */
export type RoyaltyTier = {
  upTo: number | null;
  rate: number;
};

/**
 * Parse escalating 인세율 strings used in 계약목록:
 * - "6% 10000, 7%"
 * - "6% 5000, 7% 10000, 8%"
 * - "6% 3000, 7% 5000, 8% 10000, 9%"
 * - "5% 10000, 5.5%"
 * - 0.25 / "25%" / 0.07 (flat)
 */
export function parseRoyaltyTiers(
  rateInput: string | number | null | undefined
): RoyaltyTier[] | null {
  if (rateInput == null || rateInput === "") return null;

  if (typeof rateInput === "number") {
    if (!Number.isFinite(rateInput) || rateInput <= 0) return null;
    const rate = rateInput <= 1 ? rateInput : rateInput / 100;
    return [{ upTo: null, rate }];
  }

  const s = String(rateInput).trim();
  if (!s || s === "-" || /one\s*time/i.test(s)) return null;

  // "6% 10000" | "7%" | "5.5% 10000"
  const re = /(\d+(?:\.\d+)?)\s*%(?:\s+(\d+(?:,\d+)*))?/g;
  const parts: { rate: number; threshold?: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    parts.push({
      rate: Number(m[1]) / 100,
      threshold: m[2] ? Number(m[2].replace(/,/g, "")) : undefined,
    });
  }

  if (parts.length === 0) {
    const dec = Number(s.replace(/,/g, ""));
    if (Number.isFinite(dec) && dec > 0) {
      const rate = dec <= 1 ? dec : dec / 100;
      return [{ upTo: null, rate }];
    }
    return null;
  }

  const tiers: RoyaltyTier[] = parts.map((p) => ({
    rate: p.rate,
    upTo: p.threshold ?? null,
  }));

  // Single "7% 5000" with no following rate → treat as flat 7%
  if (tiers.length === 1 && tiers[0].upTo != null) {
    tiers[0].upTo = null;
  }

  // Ensure last open-ended tier when last part had no threshold
  // (already upTo: null). If last still has threshold and there is no
  // following rate, leave as-is only when multi-tier was incomplete —
  // data always pairs thresholds with a following rate except the last.

  // Validate thresholds are increasing; if not, fall back to flat first rate
  let prev = 0;
  for (let i = 0; i < tiers.length - 1; i++) {
    const u = tiers[i].upTo;
    if (u == null || u <= prev) {
      return [{ upTo: null, rate: tiers[0].rate }];
    }
    prev = u;
  }

  return tiers;
}

/** First / flat rate (for ebook net × rate) */
export function parseRoyaltyRate(
  rate: string | number | null | undefined
): number | null {
  const tiers = parseRoyaltyTiers(rate);
  return tiers?.[0]?.rate ?? null;
}

/**
 * Split this year's sales across escalating tiers using cumulative volume.
 * Sheet examples:
 *   =(10000-7038)*X*7%+464*X*8%
 *   =5000*X*6%+1042*X*7%
 */
export function allocateCopiesByTier(
  prevCumulative: number,
  salesThisYear: number,
  tiers: RoyaltyTier[]
): { copies: number; rate: number; from: number; to: number }[] {
  const start = Math.max(0, prevCumulative);
  const end = start + Math.max(0, salesThisYear);
  if (end <= start || !tiers.length) return [];

  const out: { copies: number; rate: number; from: number; to: number }[] = [];
  let low = 0;

  for (const tier of tiers) {
    const high =
      tier.upTo == null || !Number.isFinite(tier.upTo)
        ? Number.POSITIVE_INFINITY
        : tier.upTo;
    // Intersection of (start, end] with (low, high]
    const from = Math.max(start, low);
    const to = Math.min(end, high);
    const copies = Math.max(0, to - from);
    if (copies > 0) {
      out.push({ copies, rate: tier.rate, from, to });
    }
    low = high;
    if (low >= end) break;
  }

  return out;
}

/**
 * Previous cumulative sales before this reporting year.
 * Prefers locked baseline (from sheet at open); else 누적 − 당해판매.
 */
export function prevCumulativeSales(d: RoyaltyEditableFields): number | null {
  if (d.prevCumulativeBase != null && Number.isFinite(d.prevCumulativeBase)) {
    return Math.max(0, d.prevCumulativeBase);
  }
  if (d.salesQty == null) return null;
  if (d.totalSold != null) {
    return Math.max(0, d.totalSold - d.salesQty);
  }
  return 0;
}

/**
 * Baseline cumulative before this year's sales (locked when form opens).
 * totalSold_sheet − salesQty_sheet
 */
export function baselinePrevCumulative(
  totalSold: number | null | undefined,
  salesQty: number | null | undefined
): number {
  if (totalSold == null && salesQty == null) return 0;
  return Math.max(0, n(totalSold) - n(salesQty));
}

/**
 * 누적 판매부수 = 직전 누적 + 해당년도 판매
 */
export function calcTotalSold(d: RoyaltyEditableFields): number | null {
  if (d.salesQty == null && d.prevCumulativeBase == null) {
    return d.totalSold ?? null;
  }
  const prev = prevCumulativeSales(d);
  if (prev == null && d.salesQty == null) return null;
  return n(prev) + n(d.salesQty);
}

export function isEbookLike(
  d: Pick<
    RoyaltyEditableFields,
    "title" | "retailPrice" | "ebookNetReceipts" | "salesQty"
  >
): boolean {
  const t = (d.title || "").toLowerCase();
  if (/ebook|e-book|audiobook|audio\b|전자책|오디오/.test(t)) return true;
  const net = d.ebookNetReceipts;
  const price = d.retailPrice;
  const sales = d.salesQty;
  if (net != null && net !== 0 && (price == null || price === 0)) return true;
  if (
    net != null &&
    net !== 0 &&
    (sales == null || sales === 0) &&
    (price == null || price === 0)
  )
    return true;
  return false;
}

function n(v: number | null | undefined): number {
  return v == null || Number.isNaN(v) ? 0 : v;
}

/**
 * 당기 재고 = 전년도 재고 + 해당년도 인쇄 − 증정·파기 − 판매
 * Sheet: =Z+AA-AB-AC
 */
export function calcCurrentStock(d: RoyaltyEditableFields): number | null {
  const hasAny =
    d.prevStock != null ||
    d.printed2025 != null ||
    d.destroyed2025 != null ||
    d.salesQty != null;
  if (!hasAny) return null;
  if (
    isEbookLike(d) &&
    d.prevStock == null &&
    d.printed2025 == null &&
    d.destroyed2025 == null
  ) {
    return null;
  }
  return n(d.prevStock) + n(d.printed2025) - n(d.destroyed2025) - n(d.salesQty);
}

export type RoyaltyCalcDetail = {
  amount: number;
  mode: "ebook" | "print_flat" | "print_escalating";
  prevCumulative?: number;
  allocations?: { copies: number; rate: number; amount: number }[];
};

/**
 * 해당년도 인세 발생금액 (escalating rates on cumulative sales).
 *
 * Print: sum over tiers of (copies_in_tier × 정가 × rate)
 *   where this year's sales straddle tiers based on (누적 − 당해판매) … 누적
 * Ebook: 순수입 × rate (flat; ebooks are almost always a single %)
 */
export function calcRoyaltyAmount(d: RoyaltyEditableFields): number | null {
  return calcRoyaltyAmountDetailed(d)?.amount ?? null;
}

export function calcRoyaltyAmountDetailed(
  d: RoyaltyEditableFields
): RoyaltyCalcDetail | null {
  const tiers = parseRoyaltyTiers(d.royaltyRate);
  if (!tiers?.length) return null;

  // —— Ebook / audio: net receipts × rate (no copy escalation in sheet) ——
  if (isEbookLike(d)) {
    if (d.ebookNetReceipts == null) return null;
    const rate = tiers[0].rate;
    return {
      amount: Math.round(d.ebookNetReceipts * rate),
      mode: "ebook",
      allocations: [
        {
          copies: 0,
          rate,
          amount: Math.round(d.ebookNetReceipts * rate),
        },
      ],
    };
  }

  if (d.salesQty == null || d.retailPrice == null) {
    // Fallback: net receipts only
    if (d.ebookNetReceipts != null) {
      const rate = tiers[0].rate;
      return {
        amount: Math.round(d.ebookNetReceipts * rate),
        mode: "ebook",
      };
    }
    return null;
  }

  const price = d.retailPrice;
  const sales = d.salesQty;
  const prev = prevCumulativeSales(d);
  if (prev == null) return null;

  const flat = tiers.length === 1 && tiers[0].upTo == null;
  if (flat) {
    const amount = Math.round(sales * price * tiers[0].rate);
    return {
      amount,
      mode: "print_flat",
      prevCumulative: prev,
      allocations: [
        { copies: sales, rate: tiers[0].rate, amount },
      ],
    };
  }

  const chunks = allocateCopiesByTier(prev, sales, tiers);
  if (!chunks.length && sales === 0) {
    return {
      amount: 0,
      mode: "print_escalating",
      prevCumulative: prev,
      allocations: [],
    };
  }

  const allocations = chunks.map((c) => ({
    copies: c.copies,
    rate: c.rate,
    amount: Math.round(c.copies * price * c.rate),
  }));
  const amount = allocations.reduce((s, a) => s + a.amount, 0);

  return {
    amount,
    mode: "print_escalating",
    prevCumulative: prev,
    allocations,
  };
}

/**
 * 추가(초과) 인세 발생금액 = 해당년도 인세 − 선인세 잔여
 * Sheet: =AF-AG
 */
export function calcPaymentDue(
  royaltyAmount: number | null | undefined,
  remainingAdvance: number | null | undefined
): number | null {
  if (royaltyAmount == null || remainingAdvance == null) return null;
  return royaltyAmount - remainingAdvance;
}

/** Apply all auto fields onto a draft (does not mutate input) */
export function applyAutoCalculations(
  draft: RoyaltyEditableFields
): RoyaltyEditableFields {
  // Ensure baseline exists so totalSold/tier royalty stay stable while salesQty changes
  const prevCumulativeBase =
    draft.prevCumulativeBase != null
      ? draft.prevCumulativeBase
      : baselinePrevCumulative(draft.totalSold, draft.salesQty);

  const withBase: RoyaltyEditableFields = {
    ...draft,
    prevCumulativeBase,
  };

  const totalSold = calcTotalSold(withBase);
  const withTotal: RoyaltyEditableFields = { ...withBase, totalSold };
  const currentStock = calcCurrentStock(withTotal);
  const royaltyAmount = calcRoyaltyAmount(withTotal);
  const paymentDue = calcPaymentDue(royaltyAmount, withTotal.remainingAdvance);
  return {
    ...withTotal,
    totalSold,
    currentStock,
    royaltyAmount,
    paymentDue,
  };
}

/** Human-readable breakdown for the edit form */
export function formatRoyaltyBreakdown(
  d: RoyaltyEditableFields,
  lang: "ko" | "en" = "ko"
): string | null {
  const detail = calcRoyaltyAmountDetailed(d);
  if (!detail) return null;

  if (detail.mode === "ebook") {
    return lang === "ko"
      ? `전자책·오디오: 순수입 × ${(detail.allocations?.[0]?.rate ?? 0) * 100}%`
      : `Ebook/audio: net receipts × ${(detail.allocations?.[0]?.rate ?? 0) * 100}%`;
  }

  if (!detail.allocations?.length) {
    return lang === "ko" ? "해당년도 판매 0부" : "No sales this year";
  }

  const prev = detail.prevCumulative ?? 0;
  const parts = detail.allocations.map((a) => {
    const pct = Math.round(a.rate * 10000) / 100;
    return lang === "ko"
      ? `${a.copies.toLocaleString("ko-KR")}부 × ${pct}%`
      : `${a.copies.toLocaleString("en-US")} copies × ${pct}%`;
  });

  if (detail.mode === "print_escalating") {
    return lang === "ko"
      ? `누적 직전 ${prev.toLocaleString("ko-KR")}부 기준 구간 적용: ${parts.join(" + ")}`
      : `From cumulative ${prev.toLocaleString("en-US")}: ${parts.join(" + ")}`;
  }

  return parts.join(" + ");
}
