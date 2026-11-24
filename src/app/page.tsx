"use client";

import { useRef } from "react";
import Link from "@/components/LocaleLink";
import { LENA } from "@/lib/data";
import { useLang } from "@/context/LangContext";
import { ExportCover } from "@/components/CoverCard";
import { HeroBestsellers } from "@/components/HeroBestsellers";
import { useExportTitles } from "@/hooks/useExportTitles";
import type { ImportHighlight } from "@/lib/types";

/** Newest titles only — the sheet’s bottom row is already first. */
const HOME_COVER_COUNT = 12;

export default function HomePage() {
  const { t } = useLang();
  const { titles, loading } = useExportTitles();
  const recent = titles.slice(0, HOME_COVER_COUNT);
  const rowRef = useRef<HTMLDivElement>(null);
  const imports = LENA.importHighlights as ImportHighlight[];

  function scrollRow(direction: -1 | 1) {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector<HTMLElement>(".home-cover");
    const distance = (card?.offsetWidth ?? 180) + 18;
    row.scrollBy({ left: direction * distance * 2, behavior: "smooth" });
  }

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
              <h2>{t("Titles for rights sales", "한국 저작물 수출")}</h2>
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
          {loading && recent.length === 0 ? (
            <p className="empty-state">{t("Loading…", "불러오는 중…")}</p>
          ) : (
            <div className="home-carousel">
              <button
                type="button"
                className="home-carousel-arrow prev"
                aria-label={t("Previous titles", "이전 도서")}
                onClick={() => scrollRow(-1)}
              >
                ‹
              </button>
              <div className="scroll-row home-carousel-row" ref={rowRef}>
                {recent.map((b) => (
                  <ExportCover key={b.id} book={b} />
                ))}
              </div>
              <button
                type="button"
                className="home-carousel-arrow next"
                aria-label={t("Next titles", "다음 도서")}
                onClick={() => scrollRow(1)}
              >
                ›
              </button>
            </div>
          )}
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
