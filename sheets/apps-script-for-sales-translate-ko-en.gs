/**
 * LENA Agency · Titles
 * 한글 → 영문 (비상용 기계번역)
 *
 * 권장: 짧고 자연스러운 영문 카피는 채팅에서 Grok에게
 *   「Titles 영문 채워줘」 / 「이 책 영문 번역해줘」
 * 라고 요청하세요. Grok이 제목·커버카피·시놉시스·저자소개를 다듬어 드립니다.
 *
 * 이 스크립트는 급한 일괄 채움용(LanguageApp)입니다.
 * 대상 (영문이 비어 있을 때만):
 *   titleKo → title
 *   coverCopyKo → coverCopy
 *   synopsisKo → synopsis
 *   authorBioKo → authorBio
 *   authorBio2Ko → authorBio2
 *
 * 설치: apps-script-for-sales-ALL.gs 를 쓰는 경우 이 파일은 넣지 마세요 (중복).
 * ALL 없이 이 기능만 쓸 때만 추가.
 */

var KO_EN_FIELD_PAIRS = [
  {
    kind: "title",
    en: ["title", "title_en", "titleen", "영문제목"],
    ko: ["titleko", "title_ko", "한국어제목", "제목"]
  },
  {
    kind: "coverCopy",
    en: ["covercopy", "cover_copy", "covercopyen"],
    ko: ["covercopyko", "cover_copy_ko", "covercopy_ko"]
  },
  {
    kind: "synopsis",
    en: ["synopsis", "synopsis_en", "synopsisen", "소개영문"],
    ko: ["synopsisko", "synopsis_ko", "소개", "소개한글"]
  },
  {
    kind: "authorBio",
    en: ["authorbio", "author_bio", "authorbioen", "저자소개영문"],
    ko: ["authorbioko", "author_bio_ko", "저자소개", "저자소개한글"]
  },
  {
    kind: "authorBio2",
    en: ["authorbio2", "author_bio_2", "authorbio2en", "저자2소개영문"],
    ko: ["authorbio2ko", "author_bio_2_ko", "authorbio2_ko", "저자2소개", "저자2소개한글", "공저자소개한글"]
  }
];

function fillEmptyEnglishFromKorean() {
  fillEnglishFromKorean_({ overwrite: false });
}

function refillEnglishFromKoreanSelected() {
  var ui = SpreadsheetApp.getUi();
  var ans = ui.alert(
    "영문 덮어쓰기 (기계번역)",
    "선택한 행의 영문을 기계번역으로 덮어씁니다.\n" +
      "자연스러운 카피는 Grok 채팅을 권장합니다. 계속할까요?",
    ui.ButtonSet.YES_NO
  );
  if (ans !== ui.Button.YES) return;
  fillEnglishFromKorean_({ overwrite: true, selectedOnly: true });
}

function fillEnglishFromKorean_(opt) {
  opt = opt || {};
  var overwrite = !!opt.overwrite;
  var selectedOnly = !!opt.selectedOnly;
  var ui = SpreadsheetApp.getUi();

  try {
    var sheet = getTitlesSheetForTranslate_();
    var lastCol = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2 || lastCol < 1) {
      ui.alert("안내", "Titles 데이터 행이 없습니다.", ui.ButtonSet.OK);
      return;
    }

    var headersRaw = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var headers = headersRaw.map(normHeaderTranslate_);
    var pairCols = resolveKoEnColumns_(headers);
    if (!pairCols.length) {
      ui.alert(
        "오류",
        "title / titleKo 등 한·영 열을 찾지 못했습니다.\n헤더: " +
          headers.filter(Boolean).join(", "),
        ui.ButtonSet.OK
      );
      return;
    }

    var rowStart = 2;
    var rowEnd = lastRow;
    if (selectedOnly) {
      var range = sheet.getActiveRange();
      if (!range) {
        ui.alert("안내", "덮어쓸 행을 먼저 선택하세요.", ui.ButtonSet.OK);
        return;
      }
      rowStart = Math.max(2, range.getRow());
      rowEnd = Math.min(lastRow, range.getLastRow());
    }

    var filled = 0;
    var skipped = 0;
    var errors = 0;
    var samples = [];

    for (var r = rowStart; r <= rowEnd; r++) {
      for (var p = 0; p < pairCols.length; p++) {
        var pair = pairCols[p];
        try {
          var enCell = sheet.getRange(r, pair.enCol);
          var koCell = sheet.getRange(r, pair.koCol);
          var enVal = String(enCell.getDisplayValue() || enCell.getValue() || "").trim();
          var koVal = String(koCell.getDisplayValue() || koCell.getValue() || "").trim();

          if (!koVal) {
            skipped++;
            continue;
          }
          if (enVal && !overwrite) {
            skipped++;
            continue;
          }

          var translated = translateWithLanguageApp_(
            stripHtmlForTranslate_(koVal),
            pair.kind
          );
          if (!translated) {
            skipped++;
            continue;
          }
          enCell.setValue(translated);
          filled++;
          if (samples.length < 6) {
            samples.push(
              "행" +
                r +
                " · " +
                pair.kind +
                " → " +
                translated.slice(0, 80).replace(/\n/g, " ")
            );
          }
        } catch (cellErr) {
          errors++;
        }
      }
    }

    ui.alert(
      "기계번역 완료 (비상용)",
      "채운 칸: " +
        filled +
        "개\n건너뜀: " +
        skipped +
        "개\n" +
        (errors ? "오류: " + errors + "개\n" : "") +
        "\n자연스러운 영문은 채팅에서 Grok에게\n「Titles 영문 채워줘」 라고 요청하세요.",
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert("실행 오류", String(e.message || e), ui.ButtonSet.OK);
  }
}

function getTitlesSheetForTranslate_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("시트가 연결되지 않았습니다.");
  var sheet =
    ss.getSheetByName("Titles") ||
    ss.getSheetByName("titles") ||
    ss.getSheetByName("TITLE");
  if (!sheet) throw new Error("「Titles」 탭을 찾을 수 없습니다.");
  return sheet;
}

function normHeaderTranslate_(h) {
  return String(h || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "_")
    .replace(/[^a-z0-9가-힣_]/g, "");
}

function resolveKoEnColumns_(headers) {
  var out = [];
  for (var i = 0; i < KO_EN_FIELD_PAIRS.length; i++) {
    var pair = KO_EN_FIELD_PAIRS[i];
    var enCol = findHeaderCol_(headers, pair.en);
    var koCol = findHeaderCol_(headers, pair.ko);
    if (enCol && koCol) out.push({ kind: pair.kind, enCol: enCol, koCol: koCol });
  }
  return out;
}

function findHeaderCol_(headers, names) {
  for (var i = 0; i < names.length; i++) {
    for (var c = 0; c < headers.length; c++) {
      if (headers[c] === names[i]) return c + 1;
    }
  }
  return 0;
}

function stripHtmlForTranslate_(s) {
  return String(s || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function translateWithLanguageApp_(plain, kind) {
  var en = LanguageApp.translate(plain, "ko", "en");
  en = String(en || "").trim();
  if (!en) return "";
  if (kind === "title") {
    en = en.replace(/\s+/g, " ").trim();
    if (en.length > 90) en = en.slice(0, 87).replace(/\s+\S*$/, "") + "…";
    return en;
  }
  if (kind === "coverCopy") return shortenForCatalog_(en, 180, 2);
  if (kind === "synopsis") return shortenForCatalog_(en, 520, 5);
  return shortenForCatalog_(en, 480, 4);
}

function shortenForCatalog_(text, maxChars, maxSentences) {
  var t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  var parts = t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [t];
  var out = [];
  var len = 0;
  for (var i = 0; i < parts.length && out.length < maxSentences; i++) {
    var s = parts[i].trim();
    if (!s) continue;
    if (len + s.length > maxChars && out.length) break;
    out.push(s);
    len += s.length + 1;
  }
  var joined = out.join(" ").trim();
  if (joined.length > maxChars) {
    joined = joined.slice(0, maxChars - 1).replace(/\s+\S*$/, "") + "…";
  }
  return joined;
}
