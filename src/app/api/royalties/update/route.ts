import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  fetchContractsFromSheet,
  userCanEditContract,
  parseReportComplete,
} from "@/lib/sheets-contracts";
import { writeRoyaltyToGoogleSheet } from "@/lib/royalty-write";
import type { RoyaltyEditableFields } from "@/lib/royalty-types";
import {
  applyAutoCalculations,
  baselinePrevCumulative,
} from "@/lib/royalty-calc";

/** Only these keys may be submitted from the website (member input). */
const MEMBER_KEYS = [
  "pubDate",
  "firstPrintRun",
  "retailPrice",
  "ebookNetReceipts",
  "printed2025",
  "destroyed2025",
  "salesQty",
  "reportComplete",
] as const;

function toNum(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role ?? "publisher";
  const org = session.user.org ?? "";

  // Rights holders are view-only
  if (role === "rights_holder") {
    return NextResponse.json(
      { error: "Rights holders cannot edit royalty reports" },
      { status: 403 }
    );
  }

  let body: {
    id?: string;
    sheetRow?: number;
    fileNo?: string;
    title?: string;
    fields?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = String(body.id || "");
  const title = String(body.title || "");
  if (!id && !title && !body.sheetRow) {
    return NextResponse.json(
      { error: "id, title, or sheetRow required" },
      { status: 400 }
    );
  }

  const { contracts } = await fetchContractsFromSheet({ fresh: true });
  const contract =
    contracts.find((c) => c.id === id) ||
    (body.sheetRow
      ? contracts.find((c) => c.sheetRow === body.sheetRow)
      : undefined) ||
    (title ? contracts.find((c) => c.title === title) : undefined);

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (!userCanEditContract(role, org, contract)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = body.fields || {};
  const memberPatch: RoyaltyEditableFields = {};

  for (const key of MEMBER_KEYS) {
    if (!(key in raw)) continue;
    if (key === "reportComplete") {
      memberPatch.reportComplete = parseReportComplete(
        raw.reportComplete == null ? "" : String(raw.reportComplete)
      );
    } else if (key === "pubDate") {
      memberPatch.pubDate =
        raw.pubDate == null ? "" : String(raw.pubDate);
    } else {
      memberPatch[key] = toNum(raw[key]);
    }
  }

  if (Object.keys(memberPatch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // Lock prior cumulative from sheet so totalSold tracks salesQty changes
  const prevCumulativeBase = baselinePrevCumulative(
    contract.totalSold,
    contract.salesQty
  );

  // Merge sheet (base) + member inputs, then auto-calc
  const merged = applyAutoCalculations({
    contractDate: contract.contractDate,
    rightsHolder: contract.rightsHolder,
    country: contract.country,
    org: contract.org,
    publisher: contract.publisher || contract.org,
    title: contract.title,
    royaltyRate: contract.royaltyRate,
    advance: contract.advance,
    currency: contract.currency,
    fxRate: contract.fxRate,
    pubDeadline: contract.pubDeadline,
    expiration: contract.expiration,
    sellOff: contract.sellOff,
    pubDate: contract.pubDate,
    firstPrintRun: contract.firstPrintRun,
    retailPrice: contract.retailPrice,
    prevStock: contract.prevStock,
    remainingAdvance: contract.remainingAdvance,
    ebookNetReceipts: contract.ebookNetReceipts,
    printed2025: contract.printed2025,
    destroyed2025: contract.destroyed2025,
    salesQty: contract.salesQty,
    totalSold: contract.totalSold,
    prevCumulativeBase,
    reportComplete: contract.reportComplete || "incomplete",
    ...memberPatch,
  });

  // Persist only member inputs + auto-calculated results (not base sheet fields)
  const fieldsToWrite: RoyaltyEditableFields = {
    pubDate: merged.pubDate,
    firstPrintRun: merged.firstPrintRun,
    retailPrice: merged.retailPrice,
    ebookNetReceipts: merged.ebookNetReceipts,
    printed2025: merged.printed2025,
    destroyed2025: merged.destroyed2025,
    salesQty: merged.salesQty,
    totalSold: merged.totalSold,
    currentStock: merged.currentStock,
    royaltyAmount: merged.royaltyAmount,
    paymentDue: merged.paymentDue,
    reportComplete: merged.reportComplete,
  };

  const result = await writeRoyaltyToGoogleSheet({
    id: contract.id,
    sheetRow: contract.sheetRow ?? body.sheetRow,
    fileNo: contract.fileNo,
    title: contract.title,
    fields: fieldsToWrite,
    editedBy: session.user.email,
    editedAt: new Date().toISOString(),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, via: result.via },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    via: result.via,
    contract: { ...contract, ...fieldsToWrite },
  });
}
