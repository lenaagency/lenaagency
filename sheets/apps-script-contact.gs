/**
 * LENA Agency — 사이트 문의 폼 → Gmail
 *
 * 이메일은 이 스크립트 안에만 두고, 웹사이트 HTML/JS에는 넣지 않습니다.
 *
 * 설치:
 * 1. https://script.google.com 에서 새 프로젝트
 * 2. 이 파일 내용 전체 붙여넣기
 * 3. TO_EMAIL / SCRIPT_SECRET 수정
 * 4. 배포 → 새 배포 → 유형: 웹 앱
 *    - 실행: 나
 *    - 액세스: 모든 사용자
 * 5. 웹 앱 URL 복사
 * 6. Vercel 환경변수:
 *    CONTACT_APPS_SCRIPT_URL = (웹 앱 URL)
 *    CONTACT_APPS_SCRIPT_SECRET = (아래 SCRIPT_SECRET 과 동일)
 * 7. Redeploy
 */

var TO_EMAIL = "lena.lenaagency@gmail.com";
var SCRIPT_SECRET = "lena-contact-secret-change-me";

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!SCRIPT_SECRET || body.secret !== SCRIPT_SECRET) {
      return jsonOut({ ok: false, message: "Invalid secret" });
    }

    var subject = String(body.subject || "[LENA Agency] Website inquiry").slice(0, 200);
    var text = String(body.text || body.message || "");
    var replyTo = String(body.replyTo || body.email || "").trim();

    if (!text) {
      return jsonOut({ ok: false, message: "Empty message" });
    }

    var options = {};
    if (replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
      options.replyTo = replyTo;
    }

    MailApp.sendEmail(TO_EMAIL, subject, text, options);
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({
      ok: false,
      message: String(err && err.message ? err.message : err),
    });
  }
}

function doGet() {
  return jsonOut({ ok: true, service: "lena-contact" });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
