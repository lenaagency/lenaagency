"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";

type Status = "idle" | "loading" | "success" | "error";

const KO_OPTIONS = [
  { id: "ko-kids", en: "Children’s titles", ko: "아동" },
  { id: "ko-anglo", en: "Anglo-European", ko: "영미·유럽" },
  { id: "ko-japan", en: "Japan", ko: "일본" },
] as const;

const EN_OPTIONS = [
  { id: "en-adults", en: "Adults", ko: "Adults" },
  { id: "en-kids", en: "Kids", ko: "Kids" },
] as const;

export default function NewsletterSubscribe() {
  const { lang, t } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const options = lang === "en" ? EN_OPTIONS : KO_OPTIONS;

  // Reset selection when language switches
  useEffect(() => {
    setSelected(options.map((o) => o.id));
    setStatus("idle");
    setErrorMsg("");
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps -- reset on lang only

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const company = String(fd.get("company") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const website = String(fd.get("website") || "");

    if (website) {
      setStatus("success");
      form.reset();
      return;
    }

    if (selected.length === 0) {
      setStatus("error");
      setErrorMsg(
        t(
          "Please select at least one list.",
          "구독할 리스트를 하나 이상 선택해 주세요."
        )
      );
      return;
    }

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          lang,
          lists: selected,
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
              "Failed to subscribe. Please try again.",
              "구독 신청에 실패했습니다. 다시 시도해 주세요."
            )
        );
        return;
      }

      setStatus("success");
      form.reset();
      setSelected(options.map((o) => o.id));
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
    <div className="form-card newsletter-card">
      <h2 className="newsletter-title">{t("Newsletter", "뉴스레터")}</h2>
      <p className="newsletter-lead">
        {t("Pick the list you want.", "원하시는 리스트를 골라주세요.")}
      </p>

      {status === "success" && (
        <div className="form-success show">
          {t(
            "You’re subscribed. Thank you!",
            "구독 신청이 완료되었습니다. 감사합니다!"
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

      <form onSubmit={onSubmit} className="newsletter-form">
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

        <fieldset className="newsletter-lists">
          <legend className="sr-only">
            {t("Lists", "리스트")}
          </legend>
          <div className="newsletter-checks">
            {options.map((o) => (
              <label key={o.id} className="newsletter-check">
                <input
                  type="checkbox"
                  checked={selected.includes(o.id)}
                  onChange={() => toggle(o.id)}
                />
                <span>{t(o.en, o.ko)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-row">
          <label htmlFor="newsletter-name">{t("Name *", "이름 *")}</label>
          <input
            id="newsletter-name"
            name="name"
            required
            autoComplete="name"
          />
        </div>
        <div className="form-row">
          <label htmlFor="newsletter-company">
            {t("Company *", "회사 *")}
          </label>
          <input
            id="newsletter-company"
            name="company"
            required
            autoComplete="organization"
          />
        </div>
        <div className="form-row">
          <label htmlFor="newsletter-email">{t("Email *", "이메일 *")}</label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("you@publisher.com", "you@publisher.com")}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "loading"}
        >
          {status === "loading"
            ? t("Subscribing…", "신청 중…")
            : t("Subscribe", "구독 신청")}
        </button>
        <p className="form-note">
          {t(
            "You can unsubscribe anytime from the email footer.",
            "메일 하단 Unsubscribe로 언제든 해지할 수 있습니다."
          )}
        </p>
      </form>
    </div>
  );
}
