/**
 * LENA Agency · For sales 시트
 * Categories 탭 → Titles 탭 category 열 드롭다운 연동
 *
 * 설치 (1회):
 * 1. For sales 구글시트 열기
 * 2. 확장 프로그램 → Apps Script
 * 3. 이 파일 내용 붙여넣기 → 저장
 * 4. 함수 syncCategoryDropdownOnTitles 선택 → 실행
 * 5. 권한 허용
 *
 * 이후 Categories 탭 id 를 바꾸면 다시 실행하면 됩니다.
 * (웹사이트는 Categories 탭을 직접 읽으므로 드롭다운과 별개로 자동 반영)
 */

var CATEGORIES_SHEET = "Categories";
var TITLES_SHEET = "Titles";
/** Titles 헤더 행에서 category 열 이름 */
var CATEGORY_HEADER = "category";

function syncCategoryDropdownOnTitles() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var catSheet = ss.getSheetByName(CATEGORIES_SHEET);
  var titleSheet = ss.getSheetByName(TITLES_SHEET);
  if (!catSheet || !titleSheet) {
    throw new Error("Categories 또는 Titles 시트를 찾을 수 없습니다.");
  }

  var catLast = catSheet.getLastRow();
  if (catLast < 2) {
    throw new Error("Categories 시트에 id 행이 없습니다.");
  }

  // Categories!A2:A — id 목록 (헤더 id,label_en,label_ko 가정)
  var idRange = catSheet.getRange(2, 1, catLast - 1, 1);
  var ids = idRange
    .getValues()
    .map(function (r) {
      return String(r[0] || "").trim();
    })
    .filter(function (v) {
      return v && v.toLowerCase() !== "all";
    });

  if (!ids.length) {
    throw new Error("Categories id 가 비어 있습니다.");
  }

  var headers = titleSheet
    .getRange(1, 1, 1, titleSheet.getLastColumn())
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim().toLowerCase();
    });
  var col = headers.indexOf(CATEGORY_HEADER.toLowerCase()) + 1;
  if (col < 1) {
    throw new Error('Titles 시트 1행에 "category" 열이 없습니다.');
  }

  // 데이터 행 (2행 ~ 넉넉히 500행) 드롭다운
  var numRows = Math.max(titleSheet.getMaxRows() - 1, 500);
  var range = titleSheet.getRange(2, col, numRows, 1);

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(ids, true)
    .setAllowInvalid(false)
    .setHelpText(
      "Categories 탭의 id 값만 입력하세요. (예: practical, parenting)"
    )
    .build();

  range.setDataValidation(rule);

  // 기존 값이 목록에 없으면 메모만 남김 (자동 삭제는 하지 않음)
  var lastData = Math.max(titleSheet.getLastRow(), 2);
  if (lastData >= 2) {
    var values = titleSheet.getRange(2, col, lastData - 1, 1).getValues();
    var idSet = {};
    ids.forEach(function (id) {
      idSet[id.toLowerCase()] = true;
    });
    for (var i = 0; i < values.length; i++) {
      var v = String(values[i][0] || "").trim();
      if (!v) continue;
      if (!idSet[v.toLowerCase()]) {
        titleSheet
          .getRange(i + 2, col)
          .setNote(
            "⚠ Categories 목록에 없는 값입니다. id를 확인하세요: " +
              ids.join(", ")
          );
      } else {
        titleSheet.getRange(i + 2, col).setNote("");
      }
    }
  }

  SpreadsheetApp.getUi().alert(
    "완료",
    "Titles → category 열에 드롭다운을 적용했습니다.\n(" +
      ids.length +
      "개: " +
      ids.join(", ") +
      ")",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Titles 시트에 본문 미리보기 열(preview1~4)을 cover 뒤·published 앞에 추가.
 * 이미 있으면 건너뜁니다. 1회 실행하면 됩니다.
 */
function ensurePreviewColumnsOnTitles() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var titleSheet = ss.getSheetByName(TITLES_SHEET);
  if (!titleSheet) {
    throw new Error("Titles 시트를 찾을 수 없습니다.");
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

  // insert after cover, else before published, else at end
  var insertAt; // 1-based column index where first missing col goes
  var coverIdx = lower.indexOf("cover");
  var publishedIdx = lower.indexOf("published");
  if (coverIdx >= 0) {
    insertAt = coverIdx + 2; // after cover
  } else if (publishedIdx >= 0) {
    insertAt = publishedIdx + 1;
  } else {
    insertAt = headers.length + 1;
  }

  // Insert columns from the end of missing so indices stay stable
  for (var i = 0; i < missing.length; i++) {
    titleSheet.insertColumnBefore(insertAt + i);
    titleSheet.getRange(1, insertAt + i).setValue(missing[i]);
  }

  // Header styling hint
  titleSheet
    .getRange(1, insertAt, 1, missing.length)
    .setNote(
      "본문 미리보기 이미지 URL (Drive 공유 링크 또는 https). 사이트 상세 표지 아래에 표시됩니다."
    );

  SpreadsheetApp.getUi().alert(
    "완료",
    "Titles 시트에 열을 추가했습니다:\n" +
      missing.join(", ") +
      "\n\n각 행에 본문 스캔 이미지 링크를 3~4장 넣으세요.\n" +
      "Drive: 공유 → 링크 있는 모든 사용자 → 뷰어 → 링크 복사",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 메뉴 추가 (시트 열 때).
 * 리치 텍스트 변환은 apps-script-for-sales-rich-text.gs 의
 * convertTitlesRichTextToHtml 이 같은 프로젝트에 있어야 합니다.
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

/** 메뉴가 안 보일 때: Apps Script에서 이 함수만 실행 → 시트 새로고침 */
function installLenaMenu() {
  onOpen();
  SpreadsheetApp.getUi().alert(
    "메뉴 설치 완료",
    "시트 탭을 새로고침(⌘R) 한 뒤 상단 [LENA] 메뉴를 확인하세요.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
