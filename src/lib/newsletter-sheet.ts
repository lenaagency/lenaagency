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
