"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";

type Status = "idle" | "loading" | "success" | "error";

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
    const payload = {
      name: String(fd.get("name") || ""),
      company: String(fd.get("company") || ""),
      email: String(fd.get("email") || ""),
      interest: String(fd.get("interest") || ""),
      message: String(fd.get("message") || ""),
      website: String(fd.get("website") || ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(
          data.error ||
            t("Failed to send. Please try again.", "전송에 실패했습니다. 다시 시도해 주세요.")
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
              "Publishers, agents, and rights holders — send a clear brief. LENA Agency will follow up with next steps.",
              "출판사, 에이전트, 권리자 여러분 — 핵심을 간결히 보내 주세요. 레나에이전시가 다음 단계를 안내드립니다."
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
                  "Inquiries are delivered to lena.lenaagency@gmail.com",
                  "문의는 lena.lenaagency@gmail.com 으로 전달됩니다."
                )}
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
