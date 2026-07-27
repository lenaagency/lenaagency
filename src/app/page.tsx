"use client";

import Link from "next/link";
import { LENA } from "@/lib/data";
import { useLang } from "@/context/LangContext";
import { ExportCard, ImportCard } from "@/components/CoverCard";
import { HeroBestsellers } from "@/components/HeroBestsellers";
import { useExportTitles } from "@/hooks/useExportTitles";
import type { ImportHighlight } from "@/lib/types";

export default function HomePage() {
  const { t } = useLang();
  const { titles: exportTitles, categories: exportCategories } =
    useExportTitles();
  const homeList = exportTitles.length ? exportTitles : LENA.exportTitles;
  const imports = LENA.importHighlights as ImportHighlight[];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              {t("Partnerships", "국경을 넘는")}
              <br />
              <em>{t("beyond borders", "파트너십")}</em>
            </h1>
            <p className="hero-lead">
              {t(
                "Bringing outstanding ideas to the world.",
                "탁월한 아이디어를 세계에 전합니다."
              )}
            </p>
            <div className="hero-stats">
              {LENA.stats.map((s) => (
                <div className="stat" key={s.value + s.label}>
                  <strong>{s.value}</strong>
                  <span>{t(s.label, s.labelKo)}</span>
                </div>
              ))}
            </div>
          </div>
          <HeroBestsellers books={imports} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>
                {t("Titles for rights sales", "한국 저작물 수출")}
              </h2>
              <p>
                {t(
                  "Selected Korean books available for overseas rights. Updated regularly.",
                  "해외 판권 상담이 가능한 한국 도서입니다. 수시로 업데이트됩니다."
                )}
              </p>
            </div>
            <Link className="btn btn-ghost" href="/export">
              {t("View all →", "전체 보기 →")}
            </Link>
          </div>
          <div
            className="filter-pills home-category-pills"
            role="navigation"
            aria-label={t("Browse by category", "카테고리별 보기")}
          >
            {exportCategories
              .filter((c) => c.id !== "all")
              .map((c) => (
                <Link
                  key={c.id}
                  className="pill pill-link"
                  href={`/export?category=${encodeURIComponent(c.id)}`}
                >
                  {t(c.label, c.labelKo)}
                </Link>
              ))}
          </div>
          <div className="scroll-row">
            {homeList.map((b) => (
              <ExportCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t("Rights imports", "해외 저작물 수입")}</h2>
            </div>
            <Link className="btn btn-ghost" href="/import">
              {t("View all →", "전체 보기 →")}
            </Link>
          </div>
          <div className="scroll-row">
            {imports.map((b, i) => (
              <ImportCard key={b.id} book={b} rank={i + 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t("What we do", "우리가 하는 일")}</h2>
            </div>
            <Link className="btn btn-ghost" href="/about">
              {t("About →", "소개 →")}
            </Link>
          </div>
          <div className="service-cards">
            {LENA.services.map((s) => (
              <article className="service-card" key={s.num}>
                <div className="num">{s.num}</div>
                <h3>{t(s.title, s.titleKo)}</h3>
                <p>{t(s.body, s.bodyKo)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>
            {t(
              "Looking for a partner across borders?",
              "국경을 넘는 파트너를 찾으시나요?"
            )}
          </h2>
          <Link className="btn btn-primary" href="/contact">
            {t("Contact LENA Agency", "레나에이전시 문의")}
          </Link>
        </div>
      </section>
    </>
  );
}
