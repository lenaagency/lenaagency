/**
 * LENA Agency · Titles
 * 한글만 있는 칸 → 짧고 자연스러운 영문 채우기
 *
 * 대상 (영문이 비어 있을 때만, 덮어쓰지 않음)
 *   titleKo → title
 *   coverCopyKo → coverCopy
 *   synopsisKo → synopsis
 *   authorBioKo → authorBio
 *   authorBio2Ko → authorBio2
 *
 * 설치
 * 1) For sales 시트 → 확장 프로그램 → Apps Script
 * 2) 이 파일을 새 스크립트로 추가하거나 apps-script-for-sales-ALL.gs 에 포함
 * 3) 저장 → installLenaMenu 실행 → 시트 새로고침
 * 4) 메뉴 LENA → 한글→영문 채우기 (빈 칸만)
 *
 * (선택) 더 자연스러운 문장:
 * Apps Script → 프로젝트 설정 → 스크립트 속성
 *   GEMINI_API_KEY = Google AI Studio 키
 * 없으면 구글 LanguageApp 기계번역 + 길이 다듬기
 */

/** 한글 → 영문 필드 쌍 (enHeader, koHeader 후보들) */
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

/**
 * 메뉴: 빈 영문 칸만 한글로 채움 (기존 영문 유지)
 */
function fillEmptyEnglishFromKorean() {
  fillEnglishFromKorean_({ overwrite: false });
}

/**
 * 메뉴: 선택 행만 — 한글이 있으면 영문 다시 씀 (주의)
 */
function refillEnglishFromKoreanSelected() {
  var ui = SpreadsheetApp.getUi();
  var ans = ui.alert(
    "영문 덮어쓰기",
    "선택한 행에서 한글이 있는 필드의 영문을 다시 번역해 덮어씁니다.\n" +
      "기존 영문 카피가 지워질 수 있습니다. 계속할까요?",
    ui.ButtonSet.YES_NO
  );
  if (ans !== ui.Button.YES) return;
  fillEnglishFromKorean_({ overwrite: true, selectedOnly: true });
}

/**
 * @param {{overwrite?:boolean, selectedOnly?:boolean}=} opt
 */
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
        "title / titleKo / synopsis 등 한·영 열을 찾지 못했습니다.\n헤더: " +
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

    var useGemini = Boolean(getGeminiApiKey_());
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
          // 영문이 이미 충분히 길면 덮어쓰기 모드에서도 스킵? no — overwrite means refill

          var translated = translateFieldKoToEn_(koVal, pair.kind, useGemini);
          if (!translated) {
            skipped++;
            continue;
          }
          enCell.setValue(translated);
          filled++;
          if (samples.length < 6) {
            samples.push(
              "행" + r + " · " + pair.kind + " → " + translated.slice(0, 80).replace(/\n/g, " ")
            );
          }
          // API rate limit 완화
          if (useGemini) Utilities.sleep(200);
        } catch (cellErr) {
          errors++;
          Logger.log("fill EN r=" + r + " " + pair.kind + ": " + cellErr);
        }
      }
    }

    ui.alert(
      "한글→영문 완료",
      "채운 칸: " +
        filled +
        "개\n건너뜀: " +
        skipped +
        "개\n" +
        (errors ? "오류: " + errors + "개\n" : "") +
        "엔진: " +
        (useGemini ? "Gemini (자연스러운 짧은 영문)" : "LanguageApp (기계번역+다듬기)") +
        "\n\n" +
        (samples.length ? "예시:\n• " + samples.join("\n• ") + "\n\n" : "") +
        "※ 빈 영문만 채움 (덮어쓰기 메뉴 제외)\n" +
        "※ Gemini: 스크립트 속성 GEMINI_API_KEY\n" +
        "사이트 강력 새로고침(⌘⇧R) 하세요.",
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

/**
 * @return {{kind:string, enCol:number, koCol:number}[]}
 */
function resolveKoEnColumns_(headers) {
  var out = [];
  for (var i = 0; i < KO_EN_FIELD_PAIRS.length; i++) {
    var pair = KO_EN_FIELD_PAIRS[i];
    var enCol = findHeaderCol_(headers, pair.en);
    var koCol = findHeaderCol_(headers, pair.ko);
    if (enCol && koCol) {
      out.push({ kind: pair.kind, enCol: enCol, koCol: koCol });
    }
  }
  return out;
}

function findHeaderCol_(headers, names) {
  for (var i = 0; i < names.length; i++) {
    var want = names[i];
    for (var c = 0; c < headers.length; c++) {
      if (headers[c] === want) return c + 1;
    }
  }
  return 0;
}

function getGeminiApiKey_() {
  try {
    var k = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
    if (k && String(k).trim()) return String(k).trim();
  } catch (e) {}
  return "";
}

/**
 * @param {string} koText
 * @param {string} kind title|coverCopy|synopsis|authorBio|authorBio2
 * @param {boolean} preferGemini
 * @return {string}
 */
function translateFieldKoToEn_(koText, kind, preferGemini) {
  var plain = stripHtmlForTranslate_(koText);
  if (!plain) return "";

  if (preferGemini) {
    try {
      var ai = translateWithGemini_(plain, kind);
      if (ai) return ai;
    } catch (eAi) {
      Logger.log("Gemini failed, LanguageApp fallback: " + eAi);
    }
  }

  return translateWithLanguageApp_(plain, kind);
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
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function translateWithLanguageApp_(plain, kind) {
  var en = LanguageApp.translate(plain, "ko", "en");
  en = String(en || "").trim();
  if (!en) return "";

  // 길이·톤 다듬기 (기계번역을 카탈로그 카피에 가깝게)
  if (kind === "title") {
    en = en.replace(/\s+/g, " ").trim();
    // 과도한 직역 제목 정리
    if (en.length > 90) en = en.slice(0, 87).replace(/\s+\S*$/, "") + "…";
    return en;
  }
  if (kind === "coverCopy") {
    en = shortenForCatalog_(en, 180, 2);
    return en;
  }
  if (kind === "synopsis") {
    en = shortenForCatalog_(en, 520, 5);
    return en;
  }
  // authorBio / authorBio2
  en = shortenForCatalog_(en, 480, 4);
  return en;
}

/** 문장 단위로 잘라 카탈로그용 짧은 영문 */
function shortenForCatalog_(text, maxChars, maxSentences) {
  var t = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
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

/**
 * Gemini: 짧고 자연스러운 권리 카탈로그 영문
 * @return {string}
 */
function translateWithGemini_(plain, kind) {
  var key = getGeminiApiKey_();
  if (!key) return "";

  var guidance = {
    title:
      "English book title for a rights catalog. Short, natural, publishable. Not a word-for-word calque. No quotes.",
    coverCopy:
      "1–2 punchy marketing lines for rights buyers. Shorter than the Korean if long. No hashtags. No quotes around the whole text.",
    synopsis:
      "2–5 fluent sentences for foreign rights readers. Tighter and more natural than a literal translation. Keep key selling points. No quotes.",
    authorBio:
      "2–4 sentence professional author bio in natural English. Shorter than the Korean source. Credentials and notable works only. No quotes.",
    authorBio2:
      "2–4 sentence professional co-author bio in natural English. Shorter than the Korean. No quotes."
  };
  var g = guidance[kind] || guidance.synopsis;

  var prompt =
    "You help a Seoul literary rights agency (LENA Agency).\n" +
    "Task: rewrite the Korean catalog text into " +
    g +
    "\n" +
    "Output English only. No preamble, no markdown fences.\n\n" +
    "Korean source:\n" +
    plain;

  // flash is fast/cheap for catalog fields
  var url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    encodeURIComponent(key);

  var payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: kind === "title" ? 64 : kind === "coverCopy" ? 120 : 512
    }
  };

  var res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var body = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error("Gemini HTTP " + code + ": " + body.slice(0, 200));
  }
  var json = JSON.parse(body);
  var text = "";
  try {
    text = json.candidates[0].content.parts[0].text || "";
  } catch (eParse) {
    text = "";
  }
  text = String(text || "")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/^```[\s\S]*?\n/, "")
    .replace(/\n```$/, "")
    .trim();
  return text;
}
