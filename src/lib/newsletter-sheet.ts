const LIST_LABELS: Record<string, { en: string; ko: string }> = {
  "ko-kids": { en: "Children & Youth", ko: "아동/청소년" },
  "ko-anglo": { en: "Anglo-European", ko: "영미·유럽" },
  "ko-japan": { en: "Japan · Asia", ko: "일본·아시아" },
  "en-adults": { en: "Adults", ko: "Adults" },
  "en-kids": { en: "Children & Youth", ko: "Children & Youth" },
};

export type NewsletterSignupRow = {
  name: string;
  company: string;
  email: string;
  lang: "ko" | "en";
  lists: string[];
  brevo?: "ok" | "existing" | "error" | "";
};

/**
 * Where a signup is stored. The Apps Script web app
 * (sheets/apps-script-newsletter-subscribe.gs) applies this on `lang`.
 * English columns match the Subscribers header row.
 */
export const NEWSLETTER_SHEET_TARGETS = {
  ko: {
    spreadsheetId: "1j1Jc4hjcOtGn-K7noRKdwuVdn0AdsnXeQY3hVuEWO3c",
    sheet: "신청자",
    columns: [
      "신청시각",
      "이름",
      "회사",
      "이메일",
      "언어",
      "리스트",
      "리스트명",
      "출처",
      "Brevo",
    ],
  },
  en: {
    spreadsheetId: "1uVK1V8hhkhYHIgmW8kNxSMGlGPXA-_NFLPaHMd7OaWE",
    sheet: "Subscribers",
    columns: [
      "submittedAt",
      "name",
      "company",
      "email",
      "lists",
      "language",
      "source",
      "status",
    ],
  },
} as const;

export function newsletterSheetTarget(lang: "ko" | "en") {
  return lang === "en" ? NEWSLETTER_SHEET_TARGETS.en : NEWSLETTER_SHEET_TARGETS.ko;
}

function listsLabel(lang: "ko" | "en", lists: string[]): string {
  return lists
    .map((id) => {
      const labels = LIST_LABELS[id];
      if (!labels) return id;
      return lang === "en" ? labels.en : labels.ko;
    })
    .join(", ");
}

/** Append a website newsletter signup to the private Google Sheet. Best-effort. */
export async function appendNewsletterSignup(
  row: NewsletterSignupRow
): Promise<void> {
  const url = process.env.NEWSLETTER_SHEETS_WRITE_URL?.trim();
  const secret = process.env.NEWSLETTER_SHEETS_WRITE_SECRET?.trim();
  if (!url || !secret) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        submittedAt: new Date().toISOString(),
        name: row.name,
        company: row.company,
        email: row.email,
        lang: row.lang,
        lists: row.lists,
        listsLabel: listsLabel(row.lang, row.lists),
        source: "website",
        brevo: row.brevo || "",
        spreadsheetId: newsletterSheetTarget(row.lang).spreadsheetId,
        sheet: newsletterSheetTarget(row.lang).sheet,
      }),
      redirect: "follow",
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      message?: string;
    };
    if (!res.ok || data.ok === false) {
      console.error("[newsletter] sheet write failed", res.status, data);
    }
  } catch (err) {
    console.error("[newsletter] sheet write", err);
  } finally {
    clearTimeout(timer);
  }
}
