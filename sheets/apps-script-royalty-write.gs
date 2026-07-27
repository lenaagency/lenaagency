/**
 * LENA Agency — 인세보고 웹 입력 → 계약목록(rights) 시트 반영
 *
 * 설치:
 * 1. 계약목록 스프레드시트 열기
 * 2. 확장 프로그램 → Apps Script
 * 3. 이 파일 내용 전체 붙여넣기
 * 4. SCRIPT_SECRET 을 사이트 .env GOOGLE_CONTRACTS_WRITE_SECRET 과 동일하게
 * 5. 배포 → 새 배포 → 웹 앱 (실행: 나 / 액세스: 모든 사용자)
 * 6. URL → GOOGLE_CONTRACTS_WRITE_URL
 */

var SHEET_NAME = "rights";
var SCRIPT_SECRET = "lena-royalty-write-secret";

var DEFAULT_COLUMNS = {
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
  reportComplete: "AI",
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    if (SCRIPT_SECRET && body.secret !== SCRIPT_SECRET) {
      return jsonOut({ ok: false, message: "Invalid secret" });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    var row = Number(body.sheetRow);
    var title = String(body.title || "");
    var fileNo = String(body.fileNo || "");

    if (!row || row < 2) {
      row = findRow(sheet, fileNo, title);
    }
    if (!row) {
      return jsonOut({
        ok: false,
        message: "Row not found for title/fileNo: " + title,
      });
    }

    var cols = body.columns || DEFAULT_COLUMNS;
    var fields = body.fields || {};
    // publisher is alias of org → write F once
    if (fields.publisher != null && fields.org == null) {
      fields.org = fields.publisher;
    }
    delete fields.publisher;

    var keys = Object.keys(fields);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var colLetter = cols[key];
      if (!colLetter) continue;
      var value = fields[key];
      if (value === null || value === undefined || value === "") {
        sheet.getRange(colLetter + row).clearContent();
      } else {
        sheet.getRange(colLetter + row).setValue(value);
      }
    }

    try {
      var stamp =
        (body.editedAt || new Date().toISOString()) +
        " · " +
        (body.editedBy || "web");
      sheet.getRange("AJ" + row).setValue(stamp);
    } catch (err) {
      /* ignore */
    }

    return jsonOut({
      ok: true,
      message: "Updated row " + row,
      sheetRow: row,
    });
  } catch (err) {
    return jsonOut({ ok: false, message: String(err) });
  }
}

function findRow(sheet, fileNo, title) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var titles = sheet.getRange(2, 7, last, 7).getValues();
  var files = sheet.getRange(2, 1, last, 1).getValues();
  for (var i = 0; i < titles.length; i++) {
    var t = String(titles[i][0] || "").trim();
    if (title && t === title) return i + 2;
  }
  if (fileNo && title) {
    for (var j = 0; j < titles.length; j++) {
      var t2 = String(titles[j][0] || "").trim();
      var f2 = String(files[j][0] || "").trim();
      if (f2 === fileNo && t2.indexOf(title.slice(0, 20)) === 0) return j + 2;
    }
  }
  return 0;
}

function doGet() {
  return jsonOut({
    ok: true,
    message: "LENA royalty write endpoint. Use POST.",
  });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
