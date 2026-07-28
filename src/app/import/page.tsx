"use client";

import Link from "next/link";
import { LENA } from "@/lib/data";
import { useLang } from "@/context/LangContext";
import { ImportCard } from "@/components/CoverCard";

export default function ImportPage() {
  const { t } = useLang();
  const books = LENA.importHighlights as Array<{
    id: string;
    title: string;
    titleKo: string;
    author: string;
    rightsHolder: string;
    koreanPublisher: string;
    country: string;
    pubYear: number | null;
    cumSold: number;
    cover?: string;
    colors: string[];
  }>;

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">{t("Home", "홈")}</Link> /{" "}
            <span>{t("Licensed titles", "수입 도서")}</span>
          </div>
          <h1>{t("Licensed titles", "수입 도서")}</h1>
          <p>
            {t(
              "Highlights of titles we have licensed and published in Korea. For the latest updates, follow us on Instagram.",
              "계약·출간 완료 도서 하이라이트입니다. 최신 업데이트는 인스타그램을 참고하세요."
            )}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t("Bestsellers", "베스트셀러")}</h2>
            </div>
          </div>
          <div className="title-grid cols-4">
            {books.map((b, i) => (
              <ImportCard key={b.id} book={b} rank={i + 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>
            {t(
              "Looking for Korean rights representation?",
              "해외 저작권 에이전트가 필요하신가요?"
            )}
          </h2>
          <p>
            {t("Get in touch with LENA Agency.", "레나에이전시에 문의해 주세요.")}

          </p>
          <Link className="btn btn-primary" href="/contact">
            {t("Contact", "문의하기")}
          </Link>
        </div>
      </section>
    </>
  );
}
