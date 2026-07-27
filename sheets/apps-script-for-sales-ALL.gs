/**
 * ═══════════════════════════════════════════════════════════
 * LENA Agency · For sales 시트 — 통합 Apps Script (1개 파일)
 * ═══════════════════════════════════════════════════════════
 *
 * 설치 (이 방법만 따라 하세요)
 * ------------------------------------------------
 * 1. For sales 구글시트 열기
 * 2. 확장 프로그램 → Apps Script
 * 3. 왼쪽 파일 목록의 기존 코드(.gs)를 모두 연 다음
 *    → 내용 전체 선택 → 삭제
 * 4. 이 파일 내용 전부 복사 → 붙여넣기
 * 5. 저장 (⌘S / Ctrl+S)
 * 6. 위쪽 함수 선택: installLenaMenu  →  실행(▶)
 * 7. 권한 허용 (처음 1회)
 *    권한 검토 → 계정 → 고급 → (프로젝트 이름)으로 이동 → 허용
 * 8. 구글 시트 탭 새로고침 → 상단 [LENA] 메뉴 확인
 *
 * 사용
 * ------------------------------------------------
 * Titles 셀에 굵게/기울임/글자색 적용 후
 * LENA → 서식을 HTML로 변환 (Titles)
 * 또는 Apps Script에서 convertTitlesRichTextToHtml 실행
 */

// ─── 메뉴 ───────────────────────────────────────────────

function onOpen() {
  buildLenaMenu_();
}

/** Apps Script에서 이 함수를 골라 실행하면 메뉴가 생깁니다 */
function installLenaMenu() {
  buildLenaMenu_();
  SpreadsheetApp.getUi().alert(
    "메뉴 설치 완료",
    "구글 시트 탭을 새로고침(⌘R) 한 뒤\n상단 [LENA] 메뉴를 확인하세요.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function buildLenaMenu_() {
  SpreadsheetApp.getUi()
    .createMenu("LENA")
    .addItem("카테고리 검증 제거 (먼저)", "clearCategoryValidation")
    .addItem("카테고리 다중 선택 (v3·셀선택불필요)", "openCategoryMultiSelect")
    .addItem("Titles category 안내/노트 동기화", "syncCategoryDropdownOnTitles")
    .addItem("Titles 카테고리 id 일괄 업데이트", "remapTitlesCategoriesToNewIds")
    .addItem("시리즈명 열 추가 (한·영)", "addSeriesNameColumns")
    .addItem("Titles 추천 카테고리·시리즈 적용", "applyRecommendedTitleCategories")
    .addItem("본문 미리보기 열(preview1–4) 추가", "ensurePreviewColumnsOnTitles")
    .addSeparator()
    .addItem("서식을 HTML로 변환 (Titles)", "convertTitlesRichTextToHtml")
    .addToUi();
}

// ─── 서식 → HTML (웹사이트 반영) ─────────────────────────

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
];

/**
 * Titles 탭 제목·소개 등의 볼드/이탤릭/글자색을 HTML로 바꿉니다.
 * 메뉴 또는 함수 선택 → 실행
 */
function convertTitlesRichTextToHtml() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("시트가 연결되지 않았습니다. 시트 → 확장 프로그램 → Apps Script 로 여세요.");
    }

    var sheet =
      ss.getSheetByName("Titles") ||
      ss.getSheetByName("titles") ||
      ss.getSheetByName("TITLE");

    if (!sheet) {
      SpreadsheetApp.getUi().alert(
        "오류",
        "「Titles」 탭을 찾을 수 없습니다.\n탭 이름이 정확히 Titles 인지 확인하세요.",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    var lastCol = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2 || lastCol < 1) {
      SpreadsheetApp.getUi().alert(
        "안내",
        "2행 이하에 도서 데이터가 없습니다.",
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
        "title / titleKo / synopsis 열을 찾지 못했습니다.\n\n1행 헤더:\n" +
          headers.filter(Boolean).join(", "),
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    var converted = 0;
    var skipped = 0;

    for (var r = 2; r <= lastRow; r++) {
      for (var t = 0; t < targetCols.length; t++) {
        var col = targetCols[t];
        var range = sheet.getRange(r, col);
        var rich = null;
        try {
          rich = range.getRichTextValue();
        } catch (e1) {
          rich = null;
        }

        var plain = rich ? rich.getText() || "" : String(range.getValue() || "");
        if (!String(plain).trim()) {
          skipped++;
          continue;
        }

        if (!rich || !richHasAnyFormat_(rich)) {
          skipped++;
          continue;
        }

        var html = richTextValueToHtml_(rich);
        if (html && html !== plain) {
          range.setValue(html);
          converted++;
        } else {
          skipped++;
        }
      }
    }

    SpreadsheetApp.getUi().alert(
      "변환 완료",
      "HTML로 바꾼 셀: " +
        converted +
        "개\n건너뜀: " +
        skipped +
        "개\n대상 열: " +
        foundNames.join(", ") +
        "\n\n사이트를 강력 새로고침(⌘⇧R) 하세요.\n" +
        "※ 굵게/기울임/글자색이 있는 부분만 변환됩니다.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      "실행 오류",
      String(e.message || e),
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
  try {
    var color = style.getForegroundColor();
    if (
      color &&
      color.toLowerCase() !== "#000000" &&
      color.toLowerCase() !== "#000" &&
      color.toLowerCase() !== "black"
    ) {
      return true;
    }
  } catch (e2) {}
  return false;
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
      try {
        var color = style.getForegroundColor();
        if (
          color &&
          color.toLowerCase() !== "#000000" &&
          color.toLowerCase() !== "#000" &&
          color.toLowerCase() !== "black"
        ) {
          text = '<span style="color:' + color + '">' + text + "</span>";
        }
      } catch (e4) {}
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

// ─── 카테고리 (다중 선택) ────────────────────────────────

var CATEGORIES_SHEET = "Categories";
var TITLES_SHEET = "Titles";
var CATEGORY_HEADER = "category";

/**
 * 카테고리 다중 선택 (v3)
 * — 셀을 미리 고를 필요 없음. 창에서 도서를 고르고 체크합니다.
 */
function openCategoryMultiSelect() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES_SHEET);
  if (!titleSheet) {
    SpreadsheetApp.getUi().alert("Titles 시트를 찾을 수 없습니다.");
    return;
  }

  var catCol = getCategoryColumn_(titleSheet);
  if (catCol < 1) {
    SpreadsheetApp.getUi().alert('Titles 1행에 "category" 열이 없습니다.');
    return;
  }

  var books = getBookRowsForMulti_(titleSheet);
  if (!books.length) {
    SpreadsheetApp.getUi().alert(
      "Titles에 도서 행이 없습니다.\n2행부터 id 또는 제목을 입력하세요."
    );
    return;
  }

  var defaultRow = books[0].row;
  try {
    var active = ss.getActiveSheet();
    if (active && active.getName() === TITLES_SHEET) {
      var ar = active.getActiveCell().getRow();
      for (var i = 0; i < books.length; i++) {
        if (books[i].row === ar) {
          defaultRow = ar;
          break;
        }
      }
    }
  } catch (e) {}

  var cats = getCategoryOptions_();
  if (!cats.length) {
    SpreadsheetApp.getUi().alert("Categories 탭에 id가 없습니다.");
    return;
  }

  var catByRow = {};
  for (var b = 0; b < books.length; b++) {
    catByRow[books[b].row] = books[b].category || "";
  }

  var bookOptionsHtml = books
    .map(function (bk) {
      var sel = bk.row === defaultRow ? " selected" : "";
      return (
        '<option value="' +
        bk.row +
        '"' +
        sel +
        ">" +
        escapeHtml_(bk.label) +
        " (행 " +
        bk.row +
        ")</option>"
      );
    })
    .join("");

  var rowsHtml = cats
    .map(function (c) {
      var id = c.id;
      var label =
        escapeHtml_(c.labelKo || c.labelEn || id) +
        ' <span style="color:#888;font-size:12px">(' +
        escapeHtml_(id) +
        ")</span>";
      return (
        '<label style="display:block;padding:6px 4px;cursor:pointer;border-bottom:1px solid #eee;">' +
        '<input type="checkbox" name="cat" value="' +
        escapeHtml_(id) +
        '" style="margin-right:8px;"/>' +
        label +
        "</label>"
      );
    })
    .join("");

  var html =
    '<!DOCTYPE html><html><head><base target="_top"><meta charset="utf-8">' +
    "<style>" +
    "body{font-family:Arial,Helvetica,sans-serif;font-size:13px;margin:12px;color:#222;}" +
    "h3{margin:0 0 8px;font-size:15px;}" +
    "label.field{display:block;font-size:12px;color:#666;margin:0 0 4px;}" +
    "select{width:100%;padding:8px;margin-bottom:12px;font-size:13px;}" +
    "p.hint{color:#666;font-size:12px;margin:0 0 12px;line-height:1.4;}" +
    "#list{max-height:300px;overflow:auto;border:1px solid #ddd;border-radius:6px;padding:4px 8px;}" +
    ".actions{margin-top:14px;display:flex;gap:8px;justify-content:flex-end;}" +
    "button{padding:8px 14px;border-radius:6px;border:1px solid #ccc;cursor:pointer;font-size:13px;}" +
    "button.primary{background:#c41e3a;color:#fff;border-color:#c41e3a;}" +
    "button:disabled{opacity:0.6;}" +
    "#msg{margin-top:8px;font-size:12px;color:#c41e3a;min-height:18px;}" +
    "</style></head><body>" +
    "<h3>카테고리 다중 선택 (v3)</h3>" +
    '<p class="hint">도서를 고른 뒤 카테고리를 여러 개 체크하세요.<br/>' +
    "셀을 미리 클릭할 필요 없습니다. (예: parenting,nonfiction)</p>" +
    '<label class="field">도서 선택</label>' +
    '<select id="book">' +
    bookOptionsHtml +
    "</select>" +
    '<label class="field">카테고리</label>' +
    '<div id="list">' +
    rowsHtml +
    "</div>" +
    '<div class="actions">' +
    '<button type="button" id="btnCancel">취소</button>' +
    '<button type="button" class="primary" id="btnOk">적용</button>' +
    "</div>" +
    '<div id="msg"></div>' +
    "<script>" +
    "var CAT_COL=" +
    catCol +
    ";" +
    "var CAT_BY_ROW=" +
    JSON.stringify(catByRow) +
    ";" +
    "function syncChecks(){" +
    "  var row=document.getElementById('book').value;" +
    "  var raw=(CAT_BY_ROW[row]||'').toLowerCase();" +
    "  var set={};" +
    "  raw.split(/[,|·;/]+/).forEach(function(s){s=s.trim();if(s)set[s]=true;});" +
    "  var boxes=document.querySelectorAll('input[name=cat]');" +
    "  for(var i=0;i<boxes.length;i++){" +
    "    boxes[i].checked=!!set[String(boxes[i].value).toLowerCase()];" +
    "  }" +
    "}" +
    "document.getElementById('book').onchange=syncChecks;" +
    "syncChecks();" +
    "document.getElementById('btnCancel').onclick=function(){google.script.host.close();};" +
    "document.getElementById('btnOk').onclick=function(){" +
    "  var row=Number(document.getElementById('book').value);" +
    "  var boxes=document.querySelectorAll('input[name=cat]:checked'),a=[];" +
    "  for(var i=0;i<boxes.length;i++) a.push(boxes[i].value);" +
    "  var msg=document.getElementById('msg');" +
    "  msg.textContent='저장 중…';" +
    "  document.getElementById('btnOk').disabled=true;" +
    "  google.script.run" +
    "    .withSuccessHandler(function(r){" +
    "      msg.textContent='저장됨: '+(r||'(없음)');" +
    "      CAT_BY_ROW[String(row)]=a.join(',');" +
    "      setTimeout(function(){google.script.host.close();},450);" +
    "    })" +
    "    .withFailureHandler(function(e){" +
    "      document.getElementById('btnOk').disabled=false;" +
    "      msg.textContent='오류: '+(e&&(e.message||e));" +
    "    })" +
    "    .saveCategoryValue(a.join(','), row, CAT_COL);" +
    "};" +
    "</script></body></html>";

  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html)
      .setWidth(440)
      .setHeight(560)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME),
    "카테고리 다중 선택 (v3)"
  );
}

/** Titles 데이터 행 목록 (다중 선택 다이얼로그용) */
function getBookRowsForMulti_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  var headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim().toLowerCase();
    });

  var idCol = headers.indexOf("id") + 1;
  var titleKoCol = headers.indexOf("titleko") + 1;
  if (titleKoCol < 1) titleKoCol = headers.indexOf("title_ko") + 1;
  var titleCol = headers.indexOf("title") + 1;
  var catCol = headers.indexOf("category") + 1;

  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var books = [];

  for (var i = 0; i < data.length; i++) {
    var row = i + 2;
    var id = idCol > 0 ? String(data[i][idCol - 1] || "").trim() : "";
    var titleKo =
      titleKoCol > 0 ? String(data[i][titleKoCol - 1] || "").trim() : "";
    var title =
      titleCol > 0 ? String(data[i][titleCol - 1] || "").trim() : "";
    var category =
      catCol > 0 ? String(data[i][catCol - 1] || "").trim() : "";

    var any = false;
    for (var c = 0; c < data[i].length; c++) {
      if (String(data[i][c] || "").trim()) {
        any = true;
        break;
      }
    }
    if (!any) continue;

    var label = titleKo || title || id || "(제목 없음)";
    label = label.replace(/<[^>]+>/g, "");
    if (label.length > 48) label = label.substring(0, 48) + "…";

    books.push({
      row: row,
      id: id,
      label: label,
      category: category,
    });
  }
  return books;
}

/** HTML 다이얼로그에서 호출 — 검증 제거 후 값 기록 */
function writeCategoryMultiSelect(value) {
  return saveCategoryValue(value, null, null);
}

/** row/col 지정 저장 (다중 선택 다이얼로그용) */
function saveCategoryValue(value, row, col) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES_SHEET);
  if (!titleSheet) throw new Error("Titles 없음");

  var catCol = getCategoryColumn_(titleSheet);
  if (catCol < 1) throw new Error("category 열 없음");

  var r = row != null && row !== "" ? Number(row) : titleSheet.getActiveCell().getRow();
  var c = col != null && col !== "" ? Number(col) : catCol;
  if (!r || r < 2) throw new Error("잘못된 행: " + r);

  var cell = titleSheet.getRange(r, c);
  cell.clearDataValidations(); // 핵심: 옛 드롭다운 검증 제거
  var v = value == null ? "" : String(value);
  cell.setValue(v);
  cell.setNote(v ? "카테고리: " + v : "비어 있음");
  return v || "(비움)";
}

/** category 열 전체 검증 제거 — “id 값만 입력” 오류 해결 */
function clearCategoryValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TITLES_SHEET);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Titles 없음");
    return;
  }
  var col = getCategoryColumn_(sheet);
  if (col < 1) {
    SpreadsheetApp.getUi().alert("category 열 없음");
    return;
  }
  var lastRow = Math.max(sheet.getMaxRows(), 2);
  sheet.getRange(2, col, lastRow - 1, 1).clearDataValidations();
  SpreadsheetApp.getUi().alert(
    "완료",
    "category 열 드롭다운 검증을 제거했습니다.\n이제 다중 선택이 저장됩니다.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function getCategoryColumn_(titleSheet) {
  var headers = titleSheet
    .getRange(1, 1, 1, titleSheet.getLastColumn())
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim().toLowerCase();
    });
  return headers.indexOf(CATEGORY_HEADER.toLowerCase()) + 1;
}

function getCategoryOptions_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var catSheet = ss.getSheetByName(CATEGORIES_SHEET);
  if (!catSheet || catSheet.getLastRow() < 2) return [];

  var last = catSheet.getLastRow();
  var width = Math.min(catSheet.getLastColumn(), 3);
  var rows = catSheet.getRange(2, 1, last - 1, width).getValues();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var id = String(rows[i][0] || "").trim();
    if (!id || id.toLowerCase() === "all") continue;
    out.push({
      id: id,
      labelEn: String(rows[i][1] || "").trim(),
      labelKo: String(rows[i][2] || rows[i][1] || id).trim(),
    });
  }
  return out;
}

/**
 * 단일 드롭다운은 제거하고, category 열 메모만 안내.
 * (구글 시트 기본 드롭다운 = 1개만 선택 가능 → 다중은 메뉴 사용)
 */
function syncCategoryDropdownOnTitles() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var catSheet = ss.getSheetByName(CATEGORIES_SHEET);
  var titleSheet = ss.getSheetByName(TITLES_SHEET);
  if (!catSheet || !titleSheet) {
    SpreadsheetApp.getUi().alert(
      "오류",
      "Categories 또는 Titles 시트를 찾을 수 없습니다.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  var cats = getCategoryOptions_();
  var ids = cats.map(function (c) {
    return c.id;
  });
  if (!ids.length) {
    SpreadsheetApp.getUi().alert("오류", "Categories id 가 비어 있습니다.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var col = getCategoryColumn_(titleSheet);
  if (col < 1) {
    SpreadsheetApp.getUi().alert(
      "오류",
      'Titles 시트 1행에 "category" 열이 없습니다.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  var numRows = Math.max(titleSheet.getMaxRows() - 1, 500);
  var range = titleSheet.getRange(2, col, numRows, 1);

  // 단일 선택 드롭다운 제거 → 다중 선택 메뉴 사용
  range.clearDataValidations();

  var headerCell = titleSheet.getRange(1, col);
  headerCell.setNote(
    "카테고리 (다중 가능)\n" +
      "1) 셀 클릭\n" +
      "2) 메뉴 LENA → ★ 카테고리 다중 선택\n" +
      "또는 직접 입력: parenting,nonfiction\n\n" +
      "id 목록:\n" +
      ids.join("\n")
  );

  var idSet = {};
  ids.forEach(function (id) {
    idSet[id.toLowerCase()] = true;
  });

  var lastData = Math.max(titleSheet.getLastRow(), 2);
  if (lastData >= 2) {
    var values = titleSheet.getRange(2, col, lastData - 1, 1).getValues();
    for (var i = 0; i < values.length; i++) {
      var v = String(values[i][0] || "").trim();
      if (!v) {
        titleSheet.getRange(i + 2, col).setNote(
          "비어 있음 → LENA → ★ 카테고리 다중 선택"
        );
        continue;
      }
      var parts = v.split(/[,|·;/]+/);
      var bad = [];
      for (var p = 0; p < parts.length; p++) {
        var token = String(parts[p] || "").trim().toLowerCase();
        if (token && !idSet[token]) bad.push(parts[p]);
      }
      if (bad.length) {
        titleSheet
          .getRange(i + 2, col)
          .setNote("⚠ 알 수 없는 id: " + bad.join(", ") + "\n허용: " + ids.join(", "));
      } else {
        titleSheet
          .getRange(i + 2, col)
          .setNote("카테고리: " + v + "\n(다중 선택: LENA 메뉴)");
      }
    }
  }

  SpreadsheetApp.getUi().alert(
    "완료",
    "구글 시트 기본 드롭다운은 1개만 선택됩니다.\n\n" +
      "【다중 선택 방법】\n" +
      "1. Titles → category 셀 클릭\n" +
      "2. 메뉴 LENA → ★ 카테고리 다중 선택\n" +
      "3. 체크 후 적용\n\n" +
      "직접 입력도 가능: parenting,nonfiction\n\n" +
      "Categories id " +
      ids.length +
      "개 동기화됨.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Titles: id | 시리즈명(한) | series(영) | title …
 * 메뉴: LENA → 시리즈명 열 추가 (한·영)
 */
function addSeriesNameColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TITLES_SHEET);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Titles 시트가 없습니다.");
    return;
  }

  var noteKo = "시리즈명 (한국어)\n웹 한국어 버전·검색";
  var noteEn = "English series name\n웹 영어 버전·검색\nHeader: series";
  var msgs = [];
  var state = readSeriesHeaderCols_(sheet);

  if (state.koCol < 1) {
    var after = state.idCol >= 1 ? state.idCol : 1;
    sheet.insertColumnAfter(after);
    sheet.getRange(1, after + 1).setValue("시리즈명").setNote(noteKo);
    sheet.setColumnWidth(after + 1, 150);
    msgs.push("「시리즈명」 추가");
    state = readSeriesHeaderCols_(sheet);
  } else {
    sheet.getRange(1, state.koCol).setValue("시리즈명").setNote(noteKo);
    if (state.idCol >= 1 && state.koCol !== state.idCol + 1) {
      moveColAfter_(sheet, state.koCol, state.idCol);
      msgs.push("「시리즈명」 → id 다음");
      state = readSeriesHeaderCols_(sheet);
    }
  }

  state = readSeriesHeaderCols_(sheet);
  if (state.enCol < 1) {
    var afterKo = state.koCol >= 1 ? state.koCol : state.idCol >= 1 ? state.idCol : 1;
    sheet.insertColumnAfter(afterKo);
    sheet.getRange(1, afterKo + 1).setValue("series").setNote(noteEn);
    sheet.setColumnWidth(afterKo + 1, 160);
    msgs.push("「series」(영어) 추가");
  } else {
    sheet.getRange(1, state.enCol).setValue("series").setNote(noteEn);
    state = readSeriesHeaderCols_(sheet);
    if (state.koCol >= 1 && state.enCol !== state.koCol + 1) {
      moveColAfter_(sheet, state.enCol, state.koCol);
      msgs.push("「series」 → 시리즈명 다음");
    }
  }

  SpreadsheetApp.getUi().alert(
    "완료",
    (msgs.length ? msgs.join("\n") + "\n\n" : "한·영 시리즈 열이 준비되어 있습니다.\n\n") +
      "순서: id | 시리즈명 | series | title …\n" +
      "• 시리즈명 = 한국어\n• series = English",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function addSeriesNameColumn() {
  addSeriesNameColumns();
}

function ensureSeriesColumnsOnTitles() {
  addSeriesNameColumns();
}

function readSeriesHeaderCols_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim();
    });
  var lower = headers.map(function (h) {
    return h.toLowerCase().replace(/[\s_]+/g, "");
  });
  var idCol = -1;
  var koCol = -1;
  var enCol = -1;
  for (var i = 0; i < headers.length; i++) {
    var raw = headers[i];
    var h = lower[i];
    if (idCol < 0 && (h === "id" || h === "slug")) idCol = i + 1;
    if (koCol < 0 && (raw === "시리즈명" || raw === "시리즈" || h === "seriesko")) {
      koCol = i + 1;
    }
    if (
      enCol < 0 &&
      (h === "series" ||
        h === "seriesen" ||
        raw === "영문시리즈명" ||
        raw === "영문시리즈")
    ) {
      enCol = i + 1;
    }
  }
  return { idCol: idCol, koCol: koCol, enCol: enCol };
}

function moveColAfter_(sheet, srcCol, afterCol) {
  if (srcCol === afterCol + 1) return;
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var values = sheet.getRange(1, srcCol, lastRow, 1).getValues();
  sheet.insertColumnAfter(afterCol);
  var destCol = afterCol + 1;
  var from = srcCol > afterCol ? srcCol + 1 : srcCol;
  sheet.getRange(1, destCol, lastRow, 1).setValues(values);
  sheet.deleteColumn(from);
}

/**
 * 도서 id → 추천 category + series
 * 메뉴: LENA → Titles 추천 카테고리·시리즈 적용
 */
function applyRecommendedTitleCategories() {
  var BY_ID = {
    "teacher-speech-skills": {
      category: "professional",
      series: "Seonghyo-ssaem's Teacher Mentoring",
      seriesKo: "성효 쌤의 교사 멘토링",
    },
    "teacher-speech-practice": {
      category: "professional",
      series: "Seonghyo-ssaem's Teacher Mentoring",
      seriesKo: "성효 쌤의 교사 멘토링",
    },
    "jewish-parenting-methods": { category: "parenting" },
    "land-you-the-museum": {
      category: "arts,lifestyle,nonfiction",
      series: "We Lend You the Museum",
      seriesKo: "미술관을 빌려드립니다",
    },
    "pretty-good-day": { category: "ya,fiction" },
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES_SHEET);
  if (!titleSheet) {
    SpreadsheetApp.getUi().alert("Titles 시트가 없습니다.");
    return;
  }

  ensureSeriesColumnsQuiet_(titleSheet);

  var seriesCols = readSeriesHeaderCols_(titleSheet);
  var rawHeaders = titleSheet
    .getRange(1, 1, 1, titleSheet.getLastColumn())
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim();
    });
  var headers = rawHeaders.map(function (h) {
    return h.toLowerCase().replace(/[\s_]+/g, "");
  });
  var idCol = seriesCols.idCol;
  if (idCol < 1) idCol = headers.indexOf("id") + 1;
  var catCol = headers.indexOf("category") + 1;
  var seriesKoCol = seriesCols.koCol;
  var seriesEnCol = seriesCols.enCol;
  if (idCol < 1 || catCol < 1) {
    SpreadsheetApp.getUi().alert('Titles에 "id" 또는 "category" 열이 없습니다.');
    return;
  }

  var last = titleSheet.getLastRow();
  if (last < 2) {
    SpreadsheetApp.getUi().alert("데이터 행이 없습니다.");
    return;
  }

  var ids = titleSheet.getRange(2, idCol, last - 1, 1).getValues();
  var changed = [];

  for (var i = 0; i < ids.length; i++) {
    var tid = String(ids[i][0] || "").trim();
    if (!tid) continue;
    var rec = BY_ID[tid] || BY_ID[tid.toLowerCase()];
    if (!rec) continue;
    var row = i + 2;
    var parts = [];
    if (rec.category) {
      var cell = titleSheet.getRange(row, catCol);
      var prev = String(cell.getValue() || "").trim();
      if (prev !== rec.category) {
        cell.clearDataValidations();
        cell.setValue(rec.category);
        cell.setNote("카테고리: " + rec.category);
        parts.push("cat→" + rec.category);
      }
    }
    if (rec.seriesKo && seriesKoCol > 0) {
      var sk = titleSheet.getRange(row, seriesKoCol);
      if (String(sk.getValue() || "").trim() !== rec.seriesKo) {
        sk.setValue(rec.seriesKo);
        parts.push("시리즈명");
      }
    }
    if (rec.series && seriesEnCol > 0) {
      var se = titleSheet.getRange(row, seriesEnCol);
      if (String(se.getValue() || "").trim() !== rec.series) {
        se.setValue(rec.series);
        parts.push("series");
      }
    }
    if (parts.length) changed.push(tid + " (" + parts.join(", ") + ")");
  }

  SpreadsheetApp.getUi().alert(
    "추천 카테고리·시리즈 적용 완료",
    changed.length
      ? "변경 " + changed.length + "건\n" + changed.join("\n")
      : "이미 최신이거나 매핑 대상 없음",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function ensureSeriesColumnsQuiet_(sheet) {
  var state = readSeriesHeaderCols_(sheet);
  if (state.koCol < 1) {
    var after = state.idCol >= 1 ? state.idCol : 1;
    sheet.insertColumnAfter(after);
    sheet.getRange(1, after + 1).setValue("시리즈명");
    state = readSeriesHeaderCols_(sheet);
  }
  if (state.enCol < 1) {
    var afterKo = state.koCol >= 1 ? state.koCol : state.idCol >= 1 ? state.idCol : 1;
    sheet.insertColumnAfter(afterKo);
    sheet.getRange(1, afterKo + 1).setValue("series");
  }
}

/**
 * 예전 category id → 새 Categories 탭 id 로 Titles 행을 일괄 수정.
 * 메뉴: LENA → Titles 카테고리 id 일괄 업데이트
 */
function remapTitlesCategoriesToNewIds() {
  var MAP = {
    humanities: "nonfiction",
    essay: "nonfiction",
    practical: "lifestyle",
    business: "business-selfhelp",
    selfhelp: "business-selfhelp",
    "self-help": "business-selfhelp",
    science: "science-technology",
    children: "children-fiction",
    childrens: "children-fiction",
    ya: "children-fiction",
    "children-selfhelp": "children-selphelp",
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES_SHEET);
  var catSheet = ss.getSheetByName(CATEGORIES_SHEET);
  if (!titleSheet) {
    SpreadsheetApp.getUi().alert("Titles 시트가 없습니다.");
    return;
  }

  var valid = {};
  if (catSheet && catSheet.getLastRow() >= 2) {
    catSheet
      .getRange(2, 1, catSheet.getLastRow() - 1, 1)
      .getValues()
      .forEach(function (r) {
        var id = String(r[0] || "").trim().toLowerCase();
        if (id) valid[id] = true;
      });
  }

  var headers = titleSheet
    .getRange(1, 1, 1, titleSheet.getLastColumn())
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim().toLowerCase();
    });
  var col = headers.indexOf("category") + 1;
  if (col < 1) {
    SpreadsheetApp.getUi().alert('category 열이 없습니다.');
    return;
  }

  var last = titleSheet.getLastRow();
  if (last < 2) {
    SpreadsheetApp.getUi().alert("데이터 행이 없습니다.");
    return;
  }

  var range = titleSheet.getRange(2, col, last - 1, 1);
  var values = range.getValues();
  var changed = 0;

  for (var i = 0; i < values.length; i++) {
    var raw = String(values[i][0] || "").trim();
    if (!raw) {
      // empty → leave; optional default
      continue;
    }
    var parts = raw.split(/[,|·;/]+/);
    var out = [];
    var seen = {};
    for (var p = 0; p < parts.length; p++) {
      var token = String(parts[p] || "").trim().toLowerCase().replace(/\s+/g, "");
      if (!token) continue;
      var mapped = MAP[token] || token;
      // hyphenless match
      if (!MAP[token] && !valid[mapped]) {
        for (var vid in valid) {
          if (vid.replace(/-/g, "") === mapped.replace(/-/g, "")) {
            mapped = vid;
            break;
          }
        }
      }
      if (seen[mapped]) continue;
      seen[mapped] = true;
      out.push(mapped);
    }
    var next = out.join(",");
    if (next !== raw) {
      values[i][0] = next;
      changed++;
    }
  }

  range.setValues(values);

  // 미술관 등 id 없는 행: arts 추천은 수동

  SpreadsheetApp.getUi().alert(
    "카테고리 업데이트 완료",
    "수정된 행(셀): " +
      changed +
      "개\n\n예: humanities → nonfiction\n" +
      "여러 개: parenting,nonfiction\n\n" +
      "이어서 「Titles category 드롭다운 동기화」를 실행하세요.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ─── preview 열 추가 ─────────────────────────────────────

function ensurePreviewColumnsOnTitles() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES_SHEET);
  if (!titleSheet) {
    SpreadsheetApp.getUi().alert("오류", "Titles 시트를 찾을 수 없습니다.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var lastCol = Math.max(titleSheet.getLastColumn(), 1);
  var headers = titleSheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim();
    });

  var lower = headers.map(function (h) {
    return h.toLowerCase();
  });

  var needed = ["preview1", "preview2", "preview3", "preview4"];
  var missing = needed.filter(function (n) {
    return lower.indexOf(n) < 0;
  });

  if (!missing.length) {
    SpreadsheetApp.getUi().alert(
      "안내",
      "이미 preview1~preview4 열이 있습니다.\n" +
        "각 도서 행에 Drive 이미지 공유 링크(링크 있는 모든 사용자·뷰어)를 넣으세요.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  var insertAt;
  var coverIdx = lower.indexOf("cover");
  var publishedIdx = lower.indexOf("published");
  if (coverIdx >= 0) {
    insertAt = coverIdx + 2;
  } else if (publishedIdx >= 0) {
    insertAt = publishedIdx + 1;
  } else {
    insertAt = headers.length + 1;
  }

  for (var m = missing.length - 1; m >= 0; m--) {
    titleSheet.insertColumnBefore(insertAt);
  }
  for (var j = 0; j < missing.length; j++) {
    titleSheet.getRange(1, insertAt + j).setValue(missing[j]);
  }

  SpreadsheetApp.getUi().alert(
    "완료",
    "추가된 열: " +
      missing.join(", ") +
      "\n\n각 행에 본문 스캔 이미지 링크를 3~4장 넣으세요.\n" +
      "Drive: 공유 → 링크 있는 모든 사용자 → 뷰어 → 링크 복사",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
