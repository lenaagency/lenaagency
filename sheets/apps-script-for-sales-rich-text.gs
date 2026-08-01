/**
 * LENA Agency · For sales Titles
 * 시트 셀의 볼드/이탤릭/글자색 → HTML 태그로 변환 (웹사이트 반영용)
 *
 * ════════════════════════════════════════
 * 설치 (메뉴가 안 뜰 때 포함)
 * ════════════════════════════════════════
 * 1. For sales 시트 열기
 * 2. 확장 프로그램 → Apps Script
 * 3. 이 파일 전체를 새 스크립트 파일로 추가
 *    (왼쪽 + → 스크립트 → 이름: rich-text)
 *    ※ 같은 프로젝트에 categories 스크립트가 있어도 OK
 * 4. 저장 (Ctrl/Cmd+S)
 * 5. 위쪽 실행 대상에서 installLenaMenu 선택 → 실행
 *    (또는 convertTitlesRichTextToHtml 선택 → 실행)
 * 6. 권한 허용 (처음 1회: 고급 → 프로젝트로 이동 → 허용)
 * 7. 구글 시트 탭 새로고침 → 상단 [LENA] 메뉴 확인
 *
 * 사용:
 * - Titles 셀에 툴바로 굵게/기울임/글자색 적용
 * - LENA → 서식을 HTML로 변환 (Titles)
 * - 사이트 강력 새로고침
 *
 * ⚠️ 변환 후 시트에는 <b> 같은 태그가 글자로 보입니다 (정상).
 */

var RICH_TEXT_HEADERS = [
  "title",
  "titleko",
  "title_ko",
  "영문제목",
  "한국어제목",
  "제목",
  "synopsisko",
  "synopsis_ko",
  "synopsis",
  "소개",
  "covercopy",
  "cover_copy",
  "covercopyko",
  "cover_copy_ko",
  "authorbio",
  "author_bio",
  "authorbioko",
  "author_bio_ko",
  "저자소개",
  "저자소개한글",
  "저자소개영문",
  "authorbio2",
  "author_bio_2",
  "authorbio2en",
  "authorbio2ko",
  "author_bio_2_ko",
  "authorbio2_ko",
  "저자2소개",
  "저자2소개한글",
  "저자2소개영문",
  "공저자소개",
  "공저자소개한글",
];

/**
 * 메뉴 설치 (Apps Script에서 이 함수를 골라 「실행」).
 * categories 쪽 onOpen 과 이름이 겹치지 않게 여기서도 메뉴를 붙입니다.
 */
function installLenaMenu() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("LENA")
      .addItem("Titles category 드롭다운 동기화", "syncCategoryDropdownOnTitles")
      .addItem("본문 미리보기 열(preview1–4) 추가", "ensurePreviewColumnsOnTitles")
      .addSeparator()
      .addItem("서식을 HTML로 변환 (Titles)", "convertTitlesRichTextToHtml")
      .addToUi();
    SpreadsheetApp.getUi().alert(
      "메뉴 설치 완료",
      "1) 구글 시트 탭으로 돌아가기\n2) 페이지 새로고침 (⌘R / F5)\n3) 상단 [LENA] 메뉴 확인",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    // 스프레드시트에 연결 안 된 프로젝트일 때
    SpreadsheetApp.getUi().alert(
      "메뉴 설치 실패",
      String(e.message || e) +
        "\n\nApps Script가 이 스프레드시트에 묶여 있는지 확인하세요.\n" +
        "(시트 → 확장 프로그램 → Apps Script 로 열어야 합니다)",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * onOpen 은 categories 파일에도 있을 수 있음.
 * 둘 다 있어도 마지막 정의가 쓰이므로, 여기서도 전체 메뉴를 넣습니다.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("LENA")
    .addItem("Titles category 드롭다운 동기화", "syncCategoryDropdownOnTitles")
    .addItem("본문 미리보기 열(preview1–4) 추가", "ensurePreviewColumnsOnTitles")
    .addSeparator()
    .addItem("서식을 HTML로 변환 (Titles)", "convertTitlesRichTextToHtml")
    .addToUi();
}

function convertTitlesRichTextToHtml() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("활성 스프레드시트가 없습니다. 시트에서 Apps Script를 여세요.");
    }

    var sheet =
      ss.getSheetByName("Titles") ||
      ss.getSheetByName("titles") ||
      ss.getSheetByName("TITLE");
    if (!sheet) {
      SpreadsheetApp.getUi().alert(
        "오류",
        "「Titles」 시트를 찾을 수 없습니다.\n탭 이름이 정확히 Titles 인지 확인하세요.",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    var lastCol = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2 || lastCol < 1) {
      SpreadsheetApp.getUi().alert(
        "안내",
        "변환할 데이터 행이 없습니다. (2행부터 도서 데이터가 있어야 합니다)",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    var headers = sheet
      .getRange(1, 1, 1, lastCol)
      .getValues()[0]
      .map(function (h) {
        return String(h || "")
          .replace(/^\uFEFF/, "")
          .trim()
          .toLowerCase()
          .replace(/[\s/]+/g, "_")
          .replace(/[^a-z0-9가-힣_]/g, "");
      });

    var targetCols = [];
    var foundNames = [];
    for (var c = 0; c < headers.length; c++) {
      if (RICH_TEXT_HEADERS.indexOf(headers[c]) >= 0) {
        targetCols.push(c + 1);
        foundNames.push(headers[c]);
      }
    }

    if (!targetCols.length) {
      SpreadsheetApp.getUi().alert(
        "오류",
        "title / titleKo / synopsis 등 텍스트 열을 찾지 못했습니다.\n\n1행 헤더: " +
          headers.filter(Boolean).join(", "),
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    var converted = 0;
    var skipped = 0;
    var errors = 0;

    for (var r = 2; r <= lastRow; r++) {
      for (var t = 0; t < targetCols.length; t++) {
        var col = targetCols[t];
        try {
          var range = sheet.getRange(r, col);
          var rich = null;
          try {
            rich = range.getRichTextValue();
          } catch (ignore) {
            rich = null;
          }

          var plain = "";
          if (rich) {
            plain = rich.getText() || "";
          } else {
            plain = String(range.getValue() || "");
          }
          if (!String(plain).trim()) {
            skipped++;
            continue;
          }

          var html = rich ? richTextValueToHtml_(rich) : escapeHtml_(plain);
          var hasFmt = rich ? richHasAnyFormat_(rich) : false;

          // 이미 HTML 태그가 있으면 그대로 두거나, 서식이 있을 때만 덮어씀
          if (!hasFmt) {
            skipped++;
            continue;
          }

          if (html && html !== plain) {
            range.setValue(html);
            converted++;
          } else {
            skipped++;
          }
        } catch (cellErr) {
          errors++;
        }
      }
    }

    SpreadsheetApp.getUi().alert(
      "변환 완료",
      "HTML로 바꾼 셀: " +
        converted +
        "개\n" +
        "건너뜀: " +
        skipped +
        "개\n" +
        (errors ? "오류: " + errors + "개\n" : "") +
        "대상 열: " +
        foundNames.join(", ") +
        "\n\n사이트를 강력 새로고침(⌘⇧R) 하세요.\n" +
        "※ 서식(굵게/색)이 있는 글자만 변환됩니다.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      "실행 오류",
      String(e.message || e) +
        "\n\nApps Script 편집기에서 convertTitlesRichTextToHtml 을 골라 실행해 보세요.\n" +
        "권한 허용이 필요할 수 있습니다.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

function richHasAnyFormat_(rich) {
  var runs = rich.getRuns();
  for (var i = 0; i < runs.length; i++) {
    if (runHasFormat_(runs[i])) return true;
  }
  return false;
}

function runHasFormat_(run) {
  var style = run.getTextStyle();
  if (!style) return false;
  try {
    if (style.isBold()) return true;
    if (style.isItalic()) return true;
    if (style.isUnderline()) return true;
  } catch (e1) {}
  return Boolean(getRunColorHex_(style));
}

/** Theme/RGB colors → #rrggbb (skip pure black defaults) */
function getRunColorHex_(style) {
  if (!style) return "";
  try {
    var color = style.getForegroundColor();
    if (color && isNonDefaultColor_(color)) return color;
  } catch (e1) {}
  try {
    var obj = style.getForegroundColorObject && style.getForegroundColorObject();
    if (obj && obj.getColorType) {
      if (obj.getColorType() === SpreadsheetApp.ColorType.RGB) {
        var rgb = obj.asRgbColor();
        var hex =
          "#" +
          ("0" + rgb.getRed().toString(16)).slice(-2) +
          ("0" + rgb.getGreen().toString(16)).slice(-2) +
          ("0" + rgb.getBlue().toString(16)).slice(-2);
        if (isNonDefaultColor_(hex)) return hex;
      }
    }
  } catch (e2) {}
  return "";
}

function isNonDefaultColor_(color) {
  var c = String(color || "").toLowerCase().trim();
  if (!c) return false;
  return (
    c !== "#000000" &&
    c !== "#000" &&
    c !== "black" &&
    c !== "rgb(0,0,0)" &&
    c !== "rgb(0, 0, 0)"
  );
}

function richTextValueToHtml_(rich) {
  var runs = rich.getRuns();
  var out = "";
  for (var i = 0; i < runs.length; i++) {
    var run = runs[i];
    var text = escapeHtml_(run.getText());
    if (!text) continue;
    text = text.replace(/\n/g, "<br />");
    var style = run.getTextStyle();
    if (style) {
      try {
        if (style.isBold()) text = "<b>" + text + "</b>";
        if (style.isItalic()) text = "<i>" + text + "</i>";
        if (style.isUnderline()) text = "<u>" + text + "</u>";
      } catch (e3) {}
      var color = getRunColorHex_(style);
      if (color) {
        text = '<span style="color:' + color + '">' + text + "</span>";
      }
    }
    out += text;
  }
  return out;
}

function escapeHtml_(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
