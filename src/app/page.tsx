"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";
import { ExportCover } from "@/components/CoverCard";
import { plainText } from "@/components/RichText";
import { useExportTitles } from "@/hooks/useExportTitles";
import { bookAuthors } from "@/lib/export-authors";
import { formatPubDate } from "@/lib/pub-date";
import type { ExportTitle } from "@/lib/types";

function bibliographyPublisher(
  book: ExportTitle,
  t: (en: string, ko?: string) => string
): string {
  const ko = (book.publisher || "").trim();
  const en = (book.publisherEn || "").trim();
  const koOk = ko && ko !== "—" && ko !== "-";
  const enOk = en && en !== "—" && en !== "-";
  if (!koOk && !enOk) return "";
  return t(enOk ? en : ko, koOk ? ko : en);
}

export default function HomePage() {
  const { t } = useLang();
  const { titles, loading } = useExportTitles();

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t("Titles for rights sales", "한국 저작물 수출")}</h2>
            </div>
            <Link className="btn btn-ghost" href="/export">
              {t("View all →", "전체 보기 →")}
            </Link>
          </div>
          {loading && titles.length === 0 ? (
            <p className="empty-state">{t("Loading…", "불러오는 중…")}</p>
          ) : (
            <div className="title-grid cols-4">
              {titles.map((b) => (
                <ExportCover key={b.id} book={b} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t("Bibliography", "서지")}</h2>
            </div>
          </div>
          {loading && titles.length === 0 ? (
            <p className="empty-state">{t("Loading…", "불러오는 중…")}</p>
          ) : (
          <div className="home-biblio-wrap">
            <table className="home-biblio">
              <thead>
                <tr>
                  <th scope="col">{t("Title", "제목")}</th>
                  <th scope="col">{t("Author", "저자")}</th>
                  <th scope="col">{t("Publisher", "출판사")}</th>
                  <th scope="col">{t("Year / month", "출간년월")}</th>
                </tr>
              </thead>
              <tbody>
                {titles.map((b) => {
                  const title = plainText(t(b.title, b.titleKo));
                  const authors = bookAuthors(b)
                    .map((a) => t(a.nameEn || a.name, a.name))
                    .join(" · ");
                  const published = formatPubDate(b.pubYear, b.pubMonth);
                  return (
                    <tr key={b.id}>
                      <td data-label={t("Title", "제목")}>
                        <Link href={`/export/${b.id}`}>{title}</Link>
                      </td>
                      <td data-label={t("Author", "저자")}>{authors}</td>
                      <td data-label={t("Publisher", "출판사")}>
                        {bibliographyPublisher(b, t)}
                      </td>
                      <td data-label={t("Year / month", "출간년월")}>
                        {published}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </section>
    </>
  );
}
