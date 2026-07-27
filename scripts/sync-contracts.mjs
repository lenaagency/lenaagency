#!/usr/bin/env node
/**
 * Sync 계약목록 → data/contracts-cache.json
 *
 * Usage:
 *   npm run sync-contracts
 *   npm run sync-contracts -- "/path/to/계약목록.xlsx"
 *
 * Default path: ~/Downloads/계약목록.xlsx
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const input =
  process.argv[2] || join(homedir(), "Downloads", "계약목록.xlsx");

if (!existsSync(input)) {
  console.error("File not found:", input);
  console.error("Download 계약목록 from Drive or pass a path:");
  console.error('  npm run sync-contracts -- "/path/to/계약목록.xlsx"');
  process.exit(1);
}

// Prefer openpyxl via python (already used successfully); pure-js fallback minimal
import { spawnSync } from "child_process";

const py = `
import openpyxl, json, sys
from datetime import datetime, date

path = sys.argv[1]
out = sys.argv[2]
wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
ws = wb["rights"]

def cell(v):
    if v is None: return None
    if isinstance(v, datetime): return v.strftime("%Y-%m-%d")
    if isinstance(v, date): return v.isoformat()
    if isinstance(v, float):
        if 20000101 < v < 21000101 and v == int(v):
            s = str(int(v))
            if len(s)==8: return f"{s[:4]}-{s[4:6]}-{s[6:8]}"
        return v
    if isinstance(v, int):
        if 20000101 < v < 21000101:
            s = str(v)
            if len(s)==8: return f"{s[:4]}-{s[4:6]}-{s[6:8]}"
        return v
    s = str(v).strip()
    return s if s else None

def num(v):
    if v is None or v == "": return None
    if isinstance(v, (int, float)): return float(v)
    s = str(v).replace(",","").replace("원","").strip()
    if s in ("","-","—","N/A","n/a"): return None
    try: return float(s)
    except: return None

def rate(v):
    if v is None or v == "": return None
    if isinstance(v, float):
        if 0 < v <= 1: return f"{round(v*100)}%"
        return str(v)
    return str(v).strip()

rows = []
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0: continue
    r = list(row)
    while len(r) < 35: r.append(None)
    title = cell(r[6])
    if not title: continue
    file_no = cell(r[0])
    org = cell(r[5]) or ""
    rows.append({
        "id": f"{file_no or 'x'}-{i}",
        "fileNo": file_no,
        "offerDate": cell(r[1]),
        "contractDate": cell(r[2]),
        "rightsHolder": cell(r[3]),
        "country": cell(r[4]),
        "org": org,
        "publisher": org or None,
        "title": str(title),
        "royaltyRate": rate(r[7]),
        "advance": num(r[8]),
        "currency": cell(r[9]),
        "fxRate": num(r[10]),
        "commission": num(r[11]),
        "progressFee": num(r[12]),
        "revenue": num(r[13]),
        "status": cell(r[14]),
        "expiration": cell(r[19]),
        "pubDate": cell(r[21]),
        "firstPrintRun": num(r[22]),
        "retailPrice": num(r[23]),
        "ebookNetReceipts": num(r[24]),
        "prevStock": num(r[25]),
        "printed2025": num(r[26]),
        "destroyed2025": num(r[27]),
        "salesQty": num(r[28]),
        "totalSold": num(r[29]),
        "currentStock": num(r[30]),
        "royaltyAmount": num(r[31]),
        "remainingAdvance": num(r[32]),
        "paymentDue": num(r[33]),
        "partnerSide": "licensee",
        "notes": cell(r[34]) if len(r) > 34 else None,
        "territory": cell(r[4]),
        "counterparty": cell(r[3]),
    })

payload = {
    "source": "계약목록.xlsx · rights",
    "sheetId": "1YqGUGhG3k7mAencYCVzusWpUqEQ8ZFyt8fey1PFEH7k",
    "sheetName": "rights",
    "syncedAt": datetime.now().isoformat(timespec="seconds"),
    "count": len(rows),
    "contracts": rows,
}
import os
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False)
print(f"Synced {len(rows)} contracts → {out}")
`;

const outPath = join(root, "data", "contracts-cache.json");
mkdirSync(join(root, "data"), { recursive: true });

const result = spawnSync("python3", ["-c", py, input, outPath], {
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
});

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || "sync failed");
  process.exit(result.status || 1);
}
console.log(result.stdout.trim());
