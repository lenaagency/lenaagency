import { NextResponse } from "next/server";

const TO_EMAIL =
  process.env.CONTACT_EMAIL?.trim() || "lena.lenaagency@gmail.com";

const INTEREST_LABELS: Record<string, { en: string; ko: string }> = {
  export: {
    en: "Titles for rights sales",
    ko: "한국 저작물 수출",
  },
  import: {
    en: "Korean rights",
    ko: "해외 저작물 수입",
  },
  copro: {
    en: "Co-production",
    ko: "공동제작",
  },
  "other-rights": {
    en: "Other rights",
    ko: "기타 권리",
  },
  // legacy form value
  subrights: {
    en: "Other rights",
    ko: "기타 권리",
  },
  other: {
    en: "Other",
    ko: "기타",
  },
};

type Body = {
  name?: string;
  company?: string;
  email?: string;
  interest?: string;
  message?: string;
  website?: string; // honeypot
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name || "").trim();
  const company = String(body.company || "").trim();
  const email = String(body.email || "").trim();
  const interest = String(body.interest || "other").trim();
  const message = String(body.message || "").trim();

  if (!name || !company || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400 }
    );
  }

  const interestLabel =
    INTEREST_LABELS[interest]?.en || interest;
  const subject = `[LENA Agency] Inquiry — ${interestLabel} — ${name}`;

  const text = [
    "New inquiry from the LENA Agency website",
    "",
    `Name: ${name}`,
    `Company: ${company}`,
    `Email: ${email}`,
    `Type: ${interestLabel} (${interest})`,
    "",
    "Message:",
    message,
    "",
    `—`,
    `Sent at ${new Date().toISOString()}`,
  ].join("\n");

  // 1) Web3Forms (recommended for Vercel — set WEB3FORMS_ACCESS_KEY)
  const web3Key = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (web3Key) {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: web3Key,
        subject,
        from_name: name,
        email,
        company,
        interest: interestLabel,
        message: text,
        to: TO_EMAIL,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };
    if (res.ok && data.success !== false) {
      return NextResponse.json({ ok: true, provider: "web3forms" });
    }
    return NextResponse.json(
      {
        ok: false,
        error: data.message || "Web3Forms failed",
      },
      { status: 502 }
    );
  }

  // 2) Formspree (optional FORMSPREE_FORM_ID = form id only)
  const formspreeId = process.env.FORMSPREE_FORM_ID?.trim();
  if (formspreeId) {
    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        company,
        email,
        interest: interestLabel,
        message,
        _subject: subject,
      }),
    });
    if (res.ok) {
      return NextResponse.json({ ok: true, provider: "formspree" });
    }
    return NextResponse.json(
      { ok: false, error: "Formspree failed" },
      { status: 502 }
    );
  }

  // 3) FormSubmit.co → Gmail (no API key; first use requires inbox confirmation)
  const res = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(TO_EMAIL)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        company,
        email,
        interest: interestLabel,
        message: text,
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _replyto: email,
      }),
    }
  );

  const data = (await res.json().catch(() => ({}))) as {
    success?: string | boolean;
    message?: string;
  };

  if (res.ok && (data.success === "true" || data.success === true || !data.message?.includes("error"))) {
    return NextResponse.json({
      ok: true,
      provider: "formsubmit",
    });
  }

  return NextResponse.json(
    {
      ok: false,
      error: data.message || "Failed to send inquiry",
    },
    { status: 502 }
  );
}
