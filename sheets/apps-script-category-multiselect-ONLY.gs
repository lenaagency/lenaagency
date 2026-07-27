/**
 * ═══════════════════════════════════════════════════════
 * LENA · 카테고리 다중 선택 v3 (셀 선택 불필요)
 * ═══════════════════════════════════════════════════════
 *
 * ★ 이 메시지가 아직 뜨면 = 예전 코드가 시트에 남아 있음
 *   「도서 행(2행 이하)의 셀을 선택한 뒤…」
 *   → 아래 설치를 다시 하세요. 코드 교체가 안 된 상태입니다.
 *
 * 【설치 — 반드시 이 순서】
 * 1. For sales 구글시트 열기
 * 2. 확장 프로그램 → Apps Script
 * 3. 왼쪽 파일이 여러 개면: 각 파일 열고 내용 전부 지움
 *    (코드.gs 하나만 남기고 다른 .gs는 휴지통 권장)
 * 4. 코드.gs 안을 Ctrl+A → Delete 로 완전 비움
 * 5. 이 파일 전체 복사 → 붙여넣기 → 저장(💾 / Ctrl+S)
 * 6. 위 함수 칸에서 clearCategoryValidation 선택 → ▶ 실행
 * 7. 함수 칸에서 installMenu 선택 → ▶ 실행
 * 8. 구글 시트 탭 새로고침 (Cmd+R / F5)
 * 9. 메뉴에 [LENA] → 「2) 카테고리 다중 선택 (v3)」 이 보여야 성공
 *
 * 【사용】
 * LENA → 2) 카테고리 다중 선택 (v3)
 * → 창에서 도서 고르기 + 카테고리 체크 → 적용
 * ※ category 셀을 미리 클릭할 필요 없음
 */

var TITLES = "Titles";
var CATEGORIES = "Categories";
var SCRIPT_VERSION = "v3";

function onOpen() {
  installMenu();
}

function installMenu() {
  SpreadsheetApp.getUi()
    .createMenu("LENA")
    .addItem("1) 카테고리 검증 제거 (먼저 1회)", "clearCategoryValidation")
    .addItem("2) 카테고리 다중 선택 (v3)", "openCategoryMultiSelect")
    .addItem("3) series 열 추가", "ensureSeriesColumnsOnTitles")
    .addItem("4) Titles 추천 카테고리·시리즈 적용", "applyRecommendedTitleCategories")
    .addToUi();
}

/** Titles에 series / seriesKo 열 없으면 추가 */
function ensureSeriesColumnsOnTitles() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TITLES);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Titles 탭이 없습니다.");
    return;
  }
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim();
    });
  var lower = headers.map(function (h) {
    return h.toLowerCase();
  });
  var added = [];
  function hasCol(name) {
    return lower.indexOf(name.toLowerCase()) >= 0;
  }
  function addCol(name, note) {
    if (hasCol(name)) return;
    lastCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, lastCol).setValue(name).setNote(note || "");
    headers.push(name);
    lower.push(name.toLowerCase());
    added.push(name);
  }
  // Prefer after category
  var catIdx = lower.indexOf("category");
  if (catIdx >= 0 && !hasCol("series")) {
    sheet.insertColumnAfter(catIdx + 1);
    sheet.getRange(1, catIdx + 2).setValue("series").setNote("Series name (EN)");
    added.push("series");
    // refresh headers
    lastCol = sheet.getLastColumn();
    headers = sheet
      .getRange(1, 1, 1, lastCol)
      .getValues()[0]
      .map(function (h) {
        return String(h || "").trim();
      });
    lower = headers.map(function (h) {
      return h.toLowerCase();
    });
  } else {
    addCol("series", "Series name (EN)");
  }
  if (!hasCol("seriesko") && !hasCol("series_ko")) {
    var sIdx = lower.indexOf("series");
    if (sIdx >= 0) {
      sheet.insertColumnAfter(sIdx + 1);
      sheet.getRange(1, sIdx + 2).setValue("seriesKo").setNote("시리즈명 (한국어)");
      added.push("seriesKo");
    } else {
      addCol("seriesKo", "시리즈명 (한국어)");
    }
  }
  SpreadsheetApp.getUi().alert(
    "완료",
    added.length
      ? "추가된 열: " + added.join(", ")
      : "series / seriesKo 열이 이미 있습니다.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 도서 id별 추천 category + series 를 Titles에 기록
 */
function applyRecommendedTitleCategories() {
  // 시트 Categories 최종 id 기준 (Titles에 이미 맞춰 둔 값 유지·보정)
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
    "jewish-parenting-methods": {
      category: "parenting",
    },
    "land-you-the-museum": {
      category: "arts,lifestyle,nonfiction",
      series: "We Lend You the Museum",
      seriesKo: "미술관을 빌려드립니다",
    },
    "pretty-good-day": {
      category: "ya,fiction",
    },
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES);
  if (!titleSheet) {
    SpreadsheetApp.getUi().alert("Titles 탭이 없습니다.");
    return;
  }

  ensureSeriesColumnsOnTitlesQuiet_(titleSheet);

  var lastCol = titleSheet.getLastColumn();
  var headers = titleSheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim().toLowerCase();
    });
  var idCol = headers.indexOf("id") + 1;
  var catCol = headers.indexOf("category") + 1;
  var seriesCol = headers.indexOf("series") + 1;
  var seriesKoCol = headers.indexOf("seriesko") + 1;
  if (seriesKoCol < 1) seriesKoCol = headers.indexOf("series_ko") + 1;
  if (idCol < 1 || catCol < 1) {
    SpreadsheetApp.getUi().alert('1행에 "id" 또는 "category" 열이 없습니다.');
    return;
  }

  var last = titleSheet.getLastRow();
  if (last < 2) {
    SpreadsheetApp.getUi().alert("도서 행이 없습니다.");
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
        parts.push("cat " + (prev || "∅") + "→" + rec.category);
      }
    }
    if (rec.series && seriesCol > 0) {
      var sc = titleSheet.getRange(row, seriesCol);
      if (String(sc.getValue() || "").trim() !== rec.series) {
        sc.setValue(rec.series);
        parts.push("series EN");
      }
    }
    if (rec.seriesKo && seriesKoCol > 0) {
      var sk = titleSheet.getRange(row, seriesKoCol);
      if (String(sk.getValue() || "").trim() !== rec.seriesKo) {
        sk.setValue(rec.seriesKo);
        parts.push("series KO");
      }
    }
    if (parts.length) changed.push(tid + ": " + parts.join(", "));
  }

  SpreadsheetApp.getUi().alert(
    "완료",
    changed.length
      ? "변경 " + changed.length + "건\n" + changed.join("\n")
      : "이미 추천값과 동일하거나 매핑 대상이 없습니다.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function ensureSeriesColumnsOnTitlesQuiet_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim().toLowerCase();
    });
  if (headers.indexOf("series") < 0) {
    var catIdx = headers.indexOf("category");
    if (catIdx >= 0) {
      sheet.insertColumnAfter(catIdx + 1);
      sheet.getRange(1, catIdx + 2).setValue("series");
    } else {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("series");
    }
    lastCol = sheet.getLastColumn();
    headers = sheet
      .getRange(1, 1, 1, lastCol)
      .getValues()[0]
      .map(function (h) {
        return String(h || "").trim().toLowerCase();
      });
  }
  if (headers.indexOf("seriesko") < 0 && headers.indexOf("series_ko") < 0) {
    var sIdx = headers.indexOf("series");
    if (sIdx >= 0) {
      sheet.insertColumnAfter(sIdx + 1);
      sheet.getRange(1, sIdx + 2).setValue("seriesKo");
    } else {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("seriesKo");
    }
  }
}

function clearCategoryValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TITLES);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Titles 탭이 없습니다.");
    return;
  }
  var col = getCategoryCol_(sheet);
  if (col < 1) {
    SpreadsheetApp.getUi().alert('1행에 "category" 열이 없습니다.');
    return;
  }
  var lastRow = Math.max(sheet.getMaxRows(), 2);
  var range = sheet.getRange(2, col, lastRow - 1, 1);
  range.clearDataValidations();
  sheet.getRange(1, col).setNote(
    "다중 카테고리: LENA → 카테고리 다중 선택\n예: parenting,nonfiction"
  );
  SpreadsheetApp.getUi().alert(
    "완료",
    "category 열 드롭다운 검증을 제거했습니다.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 도서 목록 + 카테고리 체크박스.
 * 셀을 미리 고르지 않아도 됩니다.
 */
function openCategoryMultiSelect() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES);
  if (!titleSheet) {
    SpreadsheetApp.getUi().alert("Titles 탭을 찾을 수 없습니다.");
    return;
  }

  var catCol = getCategoryCol_(titleSheet);
  if (catCol < 1) {
    SpreadsheetApp.getUi().alert('Titles 1행에 "category" 열이 없습니다.');
    return;
  }

  var books = getBookRows_(titleSheet);
  if (!books.length) {
    SpreadsheetApp.getUi().alert(
      "Titles에 도서 행이 없습니다.\n2행부터 id 또는 제목을 입력하세요."
    );
    return;
  }

  // 가능하면 현재 선택 행을 기본값으로
  var defaultRow = books[0].row;
  try {
    var active = ss.getActiveSheet();
    if (active && active.getName() === TITLES) {
      var ar = active.getActiveCell().getRow();
      for (var i = 0; i < books.length; i++) {
        if (books[i].row === ar) {
          defaultRow = ar;
          break;
        }
      }
    }
  } catch (e) {}

  var options = getCategoryOptions_();
  if (!options.length) {
    SpreadsheetApp.getUi().alert("Categories 탭에 id가 없습니다.");
    return;
  }

  // 행별 현재 category 값 (JSON으로 클라이언트에 전달)
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
        esc_(bk.label) +
        " (행 " +
        bk.row +
        ")</option>"
      );
    })
    .join("");

  var listHtml = options
    .map(function (o) {
      return (
        '<label style="display:block;padding:7px 6px;border-bottom:1px solid #eee;cursor:pointer;">' +
        '<input type="checkbox" name="cat" value="' +
        esc_(o.id) +
        '" style="margin-right:8px;"/>' +
        esc_(o.label) +
        ' <span style="color:#888;font-size:12px">(' +
        esc_(o.id) +
        ")</span></label>"
      );
    })
    .join("");

  var html =
    "<!DOCTYPE html><html><head><base target=\"_top\"><meta charset=\"utf-8\">" +
    "<style>" +
    "body{font:14px/1.4 Arial,sans-serif;margin:14px;color:#222;}" +
    "h2{font-size:16px;margin:0 0 8px;}" +
    "label.field{display:block;font-size:12px;color:#666;margin:0 0 4px;}" +
    "select{width:100%;padding:8px;margin-bottom:12px;font-size:13px;}" +
    "#list{max-height:300px;overflow:auto;border:1px solid #ddd;border-radius:8px;padding:4px 8px;}" +
    ".btns{margin-top:12px;text-align:right;}" +
    "button{padding:8px 14px;margin-left:6px;border-radius:6px;border:1px solid #ccc;cursor:pointer;}" +
    "button.ok{background:#c41e3a;color:#fff;border-color:#c41e3a;}" +
    "button:disabled{opacity:0.55;}" +
    "#msg{color:#c41e3a;font-size:12px;margin-top:8px;min-height:18px;}" +
    "</style></head><body>" +
    "<h2>카테고리 다중 선택 (v3)</h2>" +
    "<p style=\"color:#666;font-size:12px;margin:0 0 10px;\">셀을 미리 고를 필요 없습니다. 아래에서 도서를 선택하세요.</p>" +
    "<label class=\"field\">도서 선택</label>" +
    "<select id=\"book\">" +
    bookOptionsHtml +
    "</select>" +
    "<label class=\"field\">카테고리 (여러 개 가능)</label>" +
    "<div id=\"list\">" +
    listHtml +
    "</div>" +
    "<div class=\"btns\">" +
    "<button type=\"button\" id=\"btnCancel\">취소</button>" +
    "<button type=\"button\" class=\"ok\" id=\"btnOk\">적용</button>" +
    "</div><div id=\"msg\"></div>" +
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

function saveCategoryValue(value, row, col) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES);
  if (!titleSheet) throw new Error("Titles 탭 없음");

  row = Number(row);
  col = Number(col) || getCategoryCol_(titleSheet);
  if (!row || row < 2) throw new Error("잘못된 행: " + row);
  if (col < 1) throw new Error("category 열 없음");

  var cell = titleSheet.getRange(row, col);
  cell.clearDataValidations();
  var v = value == null ? "" : String(value);
  cell.setValue(v);
  cell.setNote(v ? "카테고리: " + v : "비어 있음");
  return v || "(비움)";
}

/** Titles 데이터 행 목록 */
function getBookRows_(sheet) {
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

  var numRows = lastRow - 1;
  var data = sheet.getRange(2, 1, numRows, lastCol).getValues();
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

    // 완전히 빈 행 스킵
    var any = false;
    for (var c = 0; c < data[i].length; c++) {
      if (String(data[i][c] || "").trim()) {
        any = true;
        break;
      }
    }
    if (!any) continue;

    var label = titleKo || title || id || "(제목 없음)";
    // HTML 태그 제거(서식 변환된 제목)
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

function getCategoryCol_(sheet) {
  var headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim().toLowerCase();
    });
  return headers.indexOf("category") + 1;
}

function getCategoryOptions_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var catSheet = ss.getSheetByName(CATEGORIES);
  if (!catSheet || catSheet.getLastRow() < 2) return [];

  var last = catSheet.getLastRow();
  var width = Math.min(catSheet.getLastColumn(), 3);
  var data = catSheet.getRange(2, 1, last - 1, width).getValues();
  var out = [];
  for (var i = 0; i < data.length; i++) {
    var id = String(data[i][0] || "").trim();
    if (!id || id.toLowerCase() === "all") continue;
    out.push({
      id: id,
      label: String(data[i][2] || data[i][1] || id).trim(),
    });
  }
  return out;
}

function esc_(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
