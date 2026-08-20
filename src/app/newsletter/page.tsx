"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export default function NewsletterPage() {
  const { t } = useLang();

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">{t("Home", "홈")}</Link> /{" "}
            <span>{t("Newsletter", "뉴스레터")}</span>
          </div>
          <h1>{t("Newsletter", "뉴스레터")}</h1>
          <p>{t("Pick the list you want.", "원하시는 리스트를 골라주세요.")}</p>
        </div>
      </div>

      <section className="section">
        <div className="container contact-form-only">
          <NewsletterSubscribe showTitle={false} showLead={false} />
        </div>
      </section>
    </>
  );
}
