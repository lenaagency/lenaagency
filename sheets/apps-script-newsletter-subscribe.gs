/**
 * LENA Agency — website newsletter signup → one row
 *
 * Korean (lang !== "en") → this spreadsheet, tab 「신청자」
 * English (lang === "en", including /en export-gate signups)
 *   → spreadsheet 1uVK1V8hhkhYHIgmW8kNxSMGlGPXA-_NFLPaHMd7OaWE, tab Subscribers
 *
 * Redeploy this web app in place (same URL) after pasting an update.
 * The script runs as the owner, who must be able to edit both spreadsheets.
 *
 * 설치:
 * 1. Korean sheet → Extensions → Apps Script
 * 2. Paste this file → Save
 * 3. SCRIPT_SECRET = Vercel NEWSLETTER_SHEETS_WRITE_SECRET
 * 4. Deploy → Web app → Execute as me → Anyone
 * 5. URL → Vercel NEWSLETTER_SHEETS_WRITE_URL
 */

var SHEET_NAME = "신청자";
var SCRIPT_SECRET = "lena-newsletter-subscribe-secret";
var TZ = "Asia/Seoul";

var EN_SPREADSHEET_ID = "1uVK1V8hhkhYHIgmW8kNxSMGlGPXA-_NFLPaHMd7OaWE";
var EN_SHEET_NAME = "Subscribers";

var HEADERS = [
  "신청시각",
  "이름",
  "회사",
  "이메일",
  "언어",
  "리스트",
  "리스트명",
  "출처",
  "Brevo",
];

/** Same order as the existing English header row. */
var EN_HEADERS = [
  "submittedAt",
  "name",
  "company",
  "email",
  "lists",
  "language",
  "source",
  "status",
];

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!SCRIPT_SECRET || body.secret !== SCRIPT_SECRET) {
      return jsonOut({ ok: false, message: "Invalid secret" });
    }

    var name = String(body.name || "").trim();
    var company = String(body.company || "").trim();
    var email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!name || !company || !email) {
      return jsonOut({ ok: false, message: "name, company, email required" });
    }

    var lists = body.lists;
    var listsStr = "";
    if (Object.prototype.toString.call(lists) === "[object Array]") {
      listsStr = lists.join(", ");
    } else {
      listsStr = String(lists || "");
    }

    var stamp = stampOf_(body.submittedAt);
    var lang = String(body.lang || "").trim().toLowerCase();
    var source = String(body.source || "website").trim() || "website";
    var brevo = String(body.brevo || "").trim();
    var listsLabel = String(body.listsLabel || "").trim();

    var sheet;
    if (lang === "en") {
      sheet = ensureEnglishSheet_();
      sheet.appendRow([
        stamp,
        name,
        company,
        email,
        listsLabel || listsStr,
        "en",
        source,
        brevo,
      ]);
    } else {
      sheet = ensureSheet_();
      sheet.appendRow([
        stamp,
        name,
        company,
        email,
        lang || "ko",
        listsStr,
        listsLabel,
        source,
        brevo,
      ]);
    }

    return jsonOut({
      ok: true,
      lang: lang === "en" ? "en" : "ko",
      spreadsheetId: lang === "en" ? EN_SPREADSHEET_ID : "",
      sheet: lang === "en" ? EN_SHEET_NAME : SHEET_NAME,
      row: sheet.getLastRow(),
    });
  } catch (err) {
    return jsonOut({
      ok: false,
      message: String(err && err.message ? err.message : err),
    });
  }
}

function doGet() {
  return jsonOut({
    ok: true,
    service: "lena-newsletter-subscribers",
    enSpreadsheetId: EN_SPREADSHEET_ID,
    enSheet: EN_SHEET_NAME,
  });
}

function stampOf_(whenRaw) {
  var when = String(whenRaw || "").trim();
  try {
    return Utilities.formatDate(
      when ? new Date(when) : new Date(),
      TZ,
      "yyyy-MM-dd HH:mm:ss"
    );
  } catch (err) {
    return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");
  }
}

function ensureSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureEnglishSheet_() {
  var ss = SpreadsheetApp.openById(EN_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(EN_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(EN_SHEET_NAME);
  }
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, EN_HEADERS.length).setValues([EN_HEADERS]);
    sheet.getRange(1, 1, 1, EN_HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
