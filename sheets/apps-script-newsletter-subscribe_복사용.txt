/**
 * LENA Agency — 웹 뉴스레터 신청 → 「신청자」 시트 한 줄 추가
 *
 * 설치:
 * 1. sheets/LENA-Newsletter-Subscribers.xlsx 를 Drive에 올리고
 *    Google 스프레드시트로 연다.
 * 2. 확장 프로그램 → Apps Script
 * 3. 이 파일(또는 apps-script-newsletter-subscribe_복사용.txt) 전체 붙여넣기 → 저장
 * 4. SCRIPT_SECRET 을 사이트 환경변수 NEWSLETTER_SHEETS_WRITE_SECRET 과 같게
 * 5. 배포 → 새 배포 → 웹 앱
 *    · 실행: 나
 *    · 액세스: 모든 사용자
 * 6. URL → Vercel NEWSLETTER_SHEETS_WRITE_URL
 *
 * 시트는 비공개로 두세요. (이메일·이름) 웹 앱만 시크릿으로 받습니다.
 */

var SHEET_NAME = "신청자";
var SCRIPT_SECRET = "lena-newsletter-subscribe-secret";
var TZ = "Asia/Seoul";

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

    var when = String(body.submittedAt || "").trim();
    var stamp;
    try {
      stamp = Utilities.formatDate(
        when ? new Date(when) : new Date(),
        TZ,
        "yyyy-MM-dd HH:mm:ss"
      );
    } catch (err) {
      stamp = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");
    }

    var sheet = ensureSheet_();
    sheet.appendRow([
      stamp,
      name,
      company,
      email,
      String(body.lang || "").trim(),
      listsStr,
      String(body.listsLabel || "").trim(),
      String(body.source || "website").trim() || "website",
      String(body.brevo || "").trim(),
    ]);

    return jsonOut({
      ok: true,
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
  return jsonOut({ ok: true, service: "lena-newsletter-subscribers" });
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

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
