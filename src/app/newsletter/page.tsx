"use client";

import { Suspense } from "react";
import Link from "@/components/LocaleLink";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/context/LangContext";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import { safeExportNext } from "@/lib/export-access";

function NewsletterScreen() {
  const { t, lang } = useLang();
  const searchParams = useSearchParams();
  const englishGate = lang === "en";
  const nextPath = safeExportNext(searchParams.get("next"));
  const copy = (en: string, ko: string) => (englishGate ? en : t(en, ko));

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">{copy("Home", "홈")}</Link> /{" "}
            <span>{copy("Newsletter", "뉴스레터")}</span>
          </div>
          <h1>{copy("Newsletter", "뉴스레터")}</h1>
          <p>
            {nextPath
              ? "Subscribe to the English newsletter to see the full rights list and title details."
              : copy(
                  "Only publishers outside Korea can subscribe.",
                  "한국 출판사만 신청 가능합니다."
                )}{" "}
            {nextPath
              ? "Choose a list below."
              : copy("Pick the list you want.", "원하시는 리스트를 골라주세요.")}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container contact-form-only">
          <NewsletterSubscribe
            showTitle={false}
            showLead={false}
            forceLang={englishGate ? "en" : undefined}
            nextPath={englishGate ? nextPath : null}
          />
        </div>
      </section>
    </>
  );
}

export default function NewsletterPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "48px 0" }}>
          <div className="empty-state">…</div>
        </div>
      }
    >
      <NewsletterScreen />
    </Suspense>
  );
}
