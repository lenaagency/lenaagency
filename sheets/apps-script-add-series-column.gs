/**
 * ═══════════════════════════════════════════════════════
 * LENA · Titles 시리즈명 열 (한글 + 영어)
 * ═══════════════════════════════════════════════════════
 *
 * 결과 헤더 순서 (id 다음):
 *   id | 시리즈명 | series | title | …
 *   (시리즈명 = 한국어, series = English series name)
 *
 * 실행
 * 1. 시트 → 확장 프로그램 → Apps Script
 * 2. 이 파일 붙여넣기 → 저장
 * 3. addSeriesNameColumns 선택 → ▶ 실행
 */

function addSeriesNameColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Titles") || ss.getSheetByName("titles");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Titles 탭을 찾을 수 없습니다.");
    return;
  }

  var noteKo =
    "시리즈명 (한국어)\n웹 한국어 버전·검색에 사용";
  var noteEn =
    "English series name\nUsed on EN site & search\nHeader: series";

  var state = readSeriesHeaders_(sheet);
  var msgs = [];

  // Ensure Korean column 「시리즈명」 after id
  if (state.koCol < 1) {
    var after = state.idCol >= 1 ? state.idCol : 1;
    sheet.insertColumnAfter(after);
    var koCol = after + 1;
    sheet.getRange(1, koCol).setValue("시리즈명").setNote(noteKo);
    sheet.setColumnWidth(koCol, 150);
    msgs.push("「시리즈명」(한국어) 추가");
    state = readSeriesHeaders_(sheet);
  } else {
    // Normalize header name
    var koHeader = String(sheet.getRange(1, state.koCol).getValue() || "").trim();
    if (koHeader !== "시리즈명") {
      sheet.getRange(1, state.koCol).setValue("시리즈명");
      msgs.push("한국어 열 헤더를 「시리즈명」으로 통일");
    }
    sheet.getRange(1, state.koCol).setNote(noteKo);
    // Move after id if needed
    if (state.idCol >= 1 && state.koCol !== state.idCol + 1) {
      moveColumnAfter_(sheet, state.koCol, state.idCol);
      msgs.push("「시리즈명」을 id 다음으로 이동");
      state = readSeriesHeaders_(sheet);
    }
  }

  // Ensure English column 「series」 right after 시리즈명
  state = readSeriesHeaders_(sheet);
  if (state.enCol < 1) {
    var afterKo = state.koCol >= 1 ? state.koCol : state.idCol >= 1 ? state.idCol : 1;
    sheet.insertColumnAfter(afterKo);
    var enCol = afterKo + 1;
    sheet.getRange(1, enCol).setValue("series").setNote(noteEn);
    sheet.setColumnWidth(enCol, 160);
    msgs.push("「series」(영어 시리즈명) 추가");
  } else {
    sheet.getRange(1, state.enCol).setNote(noteEn);
    // Prefer header name "series"
    var enHeader = String(sheet.getRange(1, state.enCol).getValue() || "").trim();
    var enLower = enHeader.toLowerCase().replace(/[\s_]+/g, "");
    if (
      enLower === "seriesen" ||
      enLower === "series_en" ||
      enHeader === "영문시리즈명" ||
      enHeader === "영문시리즈"
    ) {
      sheet.getRange(1, state.enCol).setValue("series");
      msgs.push("영어 열 헤더를 「series」로 통일");
    }
    // Move after 시리즈명 if needed
    state = readSeriesHeaders_(sheet);
    if (state.koCol >= 1 && state.enCol !== state.koCol + 1) {
      moveColumnAfter_(sheet, state.enCol, state.koCol);
      msgs.push("「series」를 시리즈명 다음으로 이동");
    }
  }

  SpreadsheetApp.getUi().alert(
    "완료",
    (msgs.length ? msgs.join("\n") + "\n\n" : "열이 이미 준비되어 있습니다.\n\n") +
      "Titles 헤더 권장 순서:\n" +
      "id | 시리즈명 | series | title | …\n\n" +
      "• 시리즈명 = 한국어\n" +
      "• series = English series name\n\n" +
      "사이트 언어에 따라 각각 표시됩니다.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/** @deprecated alias */
function addSeriesNameColumn() {
  addSeriesNameColumns();
}

function installSeriesColumnMenu() {
  SpreadsheetApp.getUi()
    .createMenu("LENA")
    .addItem("시리즈명 열 추가 (한·영)", "addSeriesNameColumns")
    .addToUi();
}

// ── helpers ─────────────────────────────────────────────

function readSeriesHeaders_(sheet) {
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

  for (var i = 0; i < lower.length; i++) {
    var h = lower[i];
    var raw = headers[i];
    if (idCol < 0 && (h === "id" || h === "slug")) idCol = i + 1;
    if (
      koCol < 0 &&
      (raw === "시리즈명" ||
        raw === "시리즈" ||
        h === "seriesko" ||
        h === "series_ko" ||
        h === "seriesnameko")
    ) {
      // Don't treat plain "series" as KO
      if (h !== "series" && h !== "seriesen" && h !== "seriesname") {
        koCol = i + 1;
      }
      if (raw === "시리즈명" || raw === "시리즈") koCol = i + 1;
    }
    if (
      enCol < 0 &&
      (h === "series" ||
        h === "seriesen" ||
        h === "series_en" ||
        h === "seriesname" ||
        h === "seriesnameen" ||
        raw === "영문시리즈명" ||
        raw === "영문시리즈" ||
        raw === "시리즈명영문")
    ) {
      // If header is exactly series (English)
      if (
        h === "series" ||
        h === "seriesen" ||
        h === "series_en" ||
        h === "seriesname" ||
        h === "seriesnameen" ||
        raw.indexOf("영문") >= 0 ||
        raw.indexOf("영문") >= 0
      ) {
        enCol = i + 1;
      }
    }
  }

  // Re-scan KO carefully: 시리즈명 only
  for (var k = 0; k < headers.length; k++) {
    if (headers[k] === "시리즈명" || headers[k] === "시리즈") {
      koCol = k + 1;
      break;
    }
  }
  for (var e = 0; e < lower.length; e++) {
    if (
      lower[e] === "series" ||
      lower[e] === "seriesen" ||
      headers[e] === "영문시리즈명" ||
      headers[e] === "영문시리즈"
    ) {
      enCol = e + 1;
      break;
    }
  }

  return { idCol: idCol, koCol: koCol, enCol: enCol };
}

/** Move column srcCol to sit immediately after afterCol (1-based). */
function moveColumnAfter_(sheet, srcCol, afterCol) {
  if (srcCol === afterCol + 1) return;
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var values = sheet.getRange(1, srcCol, lastRow, 1).getValues();
  var notes = [];
  try {
    notes = sheet.getRange(1, srcCol, lastRow, 1).getNotes();
  } catch (err) {
    notes = null;
  }

  sheet.insertColumnAfter(afterCol);
  var destCol = afterCol + 1;
  // If we inserted before src, src shifts right
  var from = srcCol > afterCol ? srcCol + 1 : srcCol;
  sheet.getRange(1, destCol, lastRow, 1).setValues(values);
  if (notes) {
    try {
      sheet.getRange(1, destCol, lastRow, 1).setNotes(notes);
    } catch (err2) {}
  }
  sheet.deleteColumn(from);
}
