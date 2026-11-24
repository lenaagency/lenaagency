"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";
import { ExportCover } from "@/components/CoverCard";
import { useExportTitles } from "@/hooks/useExportTitles";

/** Newest titles only — the sheet’s bottom row is already first. */
const HOME_COVER_COUNT = 12;

export default function HomePage() {
  const { t } = useLang();
  const { titles, loading } = useExportTitles();
  const recent = titles.slice(0, HOME_COVER_COUNT);

  return (
    <section className="section home-export">
      <div className="container">
        <div className="section-head">
          <div>
            <h2>{t("Titles for rights sales", "한국 저작물 수출")}</h2>
          </div>
          <Link className="btn btn-ghost" href="/export">
            {t("View all →", "전체 보기 →")}
          </Link>
        </div>
        {loading && recent.length === 0 ? (
          <p className="empty-state">{t("Loading…", "불러오는 중…")}</p>
        ) : (
          <div className="home-export-grid">
            {recent.map((b) => (
              <ExportCover key={b.id} book={b} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
