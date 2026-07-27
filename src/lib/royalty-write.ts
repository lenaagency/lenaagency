import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import type {
  RoyaltyContract,
  RoyaltyEditableFields,
} from "@/lib/royalty-types";
import { reportCompleteToSheet } from "@/lib/sheets-contracts";

/**
 * Editable field → Google Sheet column letter (rights tab).
 * Matches 계약목록 headers (see live sheet).
 */
/** Sheet columns for fields we may write (excludes client-only prevCumulativeBase) */
export const EDITABLE_COLUMN_MAP: Partial<
  Record<keyof RoyaltyEditableFields, string>
> = {
  contractDate: "C",
  rightsHolder: "D",
  country: "E",
  org: "F",
  publisher: "F",
  title: "G",
  royaltyRate: "H",
  advance: "I",
  currency: "J",
  fxRate: "K",
  pubDeadline: "R",
  expiration: "T",
  sellOff: "U",
  pubDate: "V",
  firstPrintRun: "W",
  retailPrice: "X",
  ebookNetReceipts: "Y",
  prevStock: "Z",
  printed2025: "AA",
  destroyed2025: "AB",
  salesQty: "AC",
  totalSold: "AD",
  currentStock: "AE",
  royaltyAmount: "AF",
  remainingAdvance: "AG",
  paymentDue: "AH",
  /** 인세보고 완료여부 — 시트 AI열 */
  reportComplete: "AI",
};

export type RoyaltyUpdatePayload = {
  id: string;
  sheetRow?: number;
  fileNo?: string;
  title: string;
  fields: RoyaltyEditableFields;
  editedBy: string;
  editedAt: string;
};

function cachePath() {
  return path.join(process.cwd(), "data", "contracts-cache.json");
}

function editsLogPath() {
  return path.join(process.cwd(), "data", "royalty-edits-log.json");
}

/** Merge fields into local cache (dev / offline fallback) */
export function applyUpdateToLocalCache(
  id: string,
  fields: RoyaltyEditableFields,
  sheetRow?: number,
  title?: string
): boolean {
  try {
    const p = cachePath();
    if (!existsSync(p)) return false;
    const data = JSON.parse(readFileSync(p, "utf8")) as {
      contracts: RoyaltyContract[];
      syncedAt?: string;
      [k: string]: unknown;
    };
    let idx = data.contracts.findIndex((c) => c.id === id);
    if (idx < 0 && sheetRow) {
      idx = data.contracts.findIndex((c) => c.sheetRow === sheetRow);
    }
    if (idx < 0 && title) {
      idx = data.contracts.findIndex((c) => c.title === title);
    }
    if (idx < 0) return false;

    const next = { ...data.contracts[idx], ...fields };
    // Keep org/publisher in sync when either is edited
    if (fields.publisher != null && fields.org == null) {
      next.org = fields.publisher;
    }
    if (fields.org != null) {
      next.publisher = fields.org;
      next.org = fields.org;
    }
    data.contracts[idx] = next;
    data.syncedAt = new Date().toISOString();
    writeFileSync(p, JSON.stringify(data), "utf8");
    return true;
  } catch {
    return false;
  }
}

function appendEditLog(entry: RoyaltyUpdatePayload & { via: string }) {
  try {
    const p = editsLogPath();
    mkdirSync(path.dirname(p), { recursive: true });
    let log: unknown[] = [];
    if (existsSync(p)) {
      try {
        log = JSON.parse(readFileSync(p, "utf8")) as unknown[];
        if (!Array.isArray(log)) log = [];
      } catch {
        log = [];
      }
    }
    log.push(entry);
    if (log.length > 500) log = log.slice(-500);
    writeFileSync(p, JSON.stringify(log, null, 2), "utf8");
  } catch {
    /* ignore on read-only FS */
  }
}

/**
 * Normalize fields before write: publisher → org column only once.
 */
export function normalizeEditableFields(
  fields: RoyaltyEditableFields
): RoyaltyEditableFields {
  const out = { ...fields };
  if (out.publisher != null && out.org == null) {
    out.org = out.publisher;
  }
  if (out.org != null) {
    out.publisher = out.org;
  }
  // Avoid double-write of same column F
  const forSheet = { ...out };
  delete forSheet.publisher;
  // Sheet stores Korean completion labels
  if ("reportComplete" in forSheet) {
    (forSheet as { reportComplete?: string }).reportComplete =
      reportCompleteToSheet(fields.reportComplete);
  }
  return forSheet;
}

/**
 * Push update to Google Sheet via Apps Script web app.
 */
export async function writeRoyaltyToGoogleSheet(
  payload: RoyaltyUpdatePayload
): Promise<{ ok: boolean; message: string; via: string }> {
  const writeUrl = process.env.GOOGLE_CONTRACTS_WRITE_URL?.trim();
  const secret = process.env.GOOGLE_CONTRACTS_WRITE_SECRET?.trim() || "";
  const fieldsForSheet = normalizeEditableFields(payload.fields);

  if (writeUrl) {
    try {
      const res = await fetch(writeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          sheetRow: payload.sheetRow,
          fileNo: payload.fileNo,
          title: payload.title,
          fields: fieldsForSheet,
          editedBy: payload.editedBy,
          editedAt: payload.editedAt,
          columns: EDITABLE_COLUMN_MAP,
        }),
        cache: "no-store",
      });
      const text = await res.text();
      let parsed: { ok?: boolean; message?: string } = {};
      try {
        parsed = JSON.parse(text) as { ok?: boolean; message?: string };
      } catch {
        parsed = { ok: res.ok, message: text.slice(0, 200) };
      }
      if (res.ok && parsed.ok !== false) {
        appendEditLog({ ...payload, via: "apps_script" });
        applyUpdateToLocalCache(
          payload.id,
          payload.fields,
          payload.sheetRow,
          payload.title
        );
        return {
          ok: true,
          message: parsed.message || "Saved to Google Sheet",
          via: "apps_script",
        };
      }
      return {
        ok: false,
        message:
          parsed.message ||
          `Sheet write failed (${res.status}). Check Apps Script deployment.`,
        via: "apps_script",
      };
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : "Write request failed",
        via: "apps_script",
      };
    }
  }

  const localOk = applyUpdateToLocalCache(
    payload.id,
    payload.fields,
    payload.sheetRow,
    payload.title
  );
  appendEditLog({ ...payload, via: localOk ? "local_cache" : "none" });

  if (localOk) {
    return {
      ok: true,
      message:
        "Saved locally. Set GOOGLE_CONTRACTS_WRITE_URL (Apps Script) to write to Drive 계약목록.",
      via: "local_cache",
    };
  }

  return {
    ok: false,
    message:
      "Cannot save: configure GOOGLE_CONTRACTS_WRITE_URL (see sheets/apps-script-royalty-write.gs).",
    via: "none",
  };
}
