"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Web3Forms free plan only allows client-side submit (server IP blocked).
 * Access key is intentionally public — it is NOT the inbox address.
 * @see https://docs.web3forms.com/getting-started/faq
 */
const WEB3FORMS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || "";

const INTEREST_EN: Record<string, string> = {
  export: "Titles for rights sales",
  import: "Korean rights",
  copro: "Co-production",
  "other-rights": "Other rights",
  other: "Other",
};

export default function ContactPage() {
  const { t } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const company = String(fd.get("company") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const interest = String(fd.get("interest") || "other").trim();
    const message = String(fd.get("message") || "").trim();
    const website = String(fd.get("website") || "");

    // Honeypot — pretend success
    if (website) {
      setStatus("success");
      form.reset();
      return;
    }

    const interestLabel = INTEREST_EN[interest] || interest;
    const subject = `[LENA Agency] Inquiry — ${interestLabel} — ${name}`;
    const fullMessage = [
      "New inquiry from the LENA Agency website",
      "",
      `Name: ${name}`,
      `Company: ${company}`,
      `Email: ${email}`,
      `Type: ${interestLabel} (${interest})`,
      "",
      "Message:",
      message,
    ].join("\n");

    try {
      // Prefer browser → Web3Forms (free plan requires client-side)
      if (WEB3FORMS_KEY) {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject,
            from_name: name,
            name,
            email,
            company,
            interest: interestLabel,
            message: fullMessage,
            botcheck: false,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          message?: string;
        };
        if (!res.ok || data.success === false) {
          setStatus("error");
          setErrorMsg(
            data.message ||
              t(
                "Failed to send. Please try again.",
                "전송에 실패했습니다. 다시 시도해 주세요."
              )
          );
          return;
        }
        setStatus("success");
        form.reset();
        return;
      }

      // Fallback: server route (Apps Script / Formspree / Pro Web3Forms)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          interest,
          message,
          website: "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(
          data.error ||
            t(
              "Failed to send. Please try again.",
              "전송에 실패했습니다. 다시 시도해 주세요."
            )
        );
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg(
        t(
          "Network error. Please try again.",
          "네트워크 오류입니다. 다시 시도해 주세요."
        )
      );
    }
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">{t("Home", "홈")}</Link> /{" "}
            <span>{t("Contact", "문의")}</span>
          </div>
          <h1>{t("Contact", "문의")}</h1>
          <p>
            {t(
              "Send a clear brief. LENA Agency will follow up with next steps.",
              "핵심을 간결히 보내 주세요. 레나에이전시가 다음 단계를 안내드립니다."
            )}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container contact-form-only">
          <div className="form-card">
            {status === "success" && (
              <div className="form-success show">
                {t(
                  "Thank you. Your inquiry has been sent to LENA Agency.",
                  "감사합니다. 문의가 레나에이전시에 전달되었습니다."
                )}
              </div>
            )}
            {status === "error" && (
              <div
                className="form-success show"
                style={{ background: "#fdecea", color: "#b71c1c" }}
              >
                {errorMsg}
              </div>
            )}
            <form onSubmit={onSubmit}>
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  height: 0,
                  width: 0,
                }}
              />
              <div className="form-grid-2">
                <div className="form-row">
                  <label htmlFor="name">{t("Name *", "이름 *")}</label>
                  <input id="name" name="name" required autoComplete="name" />
                </div>
                <div className="form-row">
                  <label htmlFor="company">{t("Company *", "회사 *")}</label>
                  <input
                    id="company"
                    name="company"
                    required
                    autoComplete="organization"
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-row">
                  <label htmlFor="email">{t("Email *", "이메일 *")}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="interest">
                    {t("Inquiry type", "문의 유형")}
                  </label>
                  <select id="interest" name="interest" defaultValue="export">
                    <option value="export">
                      {t("Titles for rights sales", "한국 저작물 수출")}
                    </option>
                    <option value="import">
                      {t("Korean rights", "해외 저작물 수입")}
                    </option>
                    <option value="copro">
                      {t("Co-production", "공동제작")}
                    </option>
                    <option value="other-rights">
                      {t("Other rights", "기타 권리")}
                    </option>
                    <option value="other">{t("Other", "기타")}</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="message">{t("Message *", "메시지 *")}</label>
                <textarea id="message" name="message" required />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? t("Sending…", "전송 중…")
                  : t("Send", "보내기")}
              </button>
              <p className="form-note">
                {t(
                  "Your message will be sent to LENA Agency.",
                  "메시지는 레나에이전시에 전달됩니다."
                )}
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
