"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";
import { useExportTitles } from "@/hooks/useExportTitles";
import { listAuthorProfiles } from "@/lib/export-authors";
import { plainText } from "@/components/RichText";

export default function ExportAuthorsIndexPage() {
  const { t } = useLang();
  const { titles: exportTitles, loading } = useExportTitles();
  const authors = listAuthorProfiles(exportTitles);

  return (
    <div className="container">
      <div className="breadcrumb" style={{ paddingTop: 28 }}>
        <Link href="/">{t("Home", "홈")}</Link> /{" "}
        <Link href="/export">{t("For sales", "수출")}</Link> /{" "}
        <span>{t("Authors", "저자")}</span>
      </div>

      <header className="author-index-header">
        <p className="author-kicker">{t("Authors", "저자")}</p>
        <h1>{t("Browse by author", "저자별 보기")}</h1>
        <p className="author-index-lead">
          {t(
            "Click a name to read the author biography and titles.",
            "이름을 클릭하면 저자소개와 저작물 목록을 볼 수 있습니다."
          )}
        </p>
      </header>

      {loading && authors.length === 0 ? (
        <div className="empty-state" style={{ margin: "32px 0" }}>
          {t("Loading…", "불러오는 중…")}
        </div>
      ) : authors.length === 0 ? (
        <div className="empty-state" style={{ margin: "32px 0" }}>
          {t("No authors found.", "등록된 저자가 없습니다.")}
        </div>
      ) : (
        <ul className="author-index-list">
          {authors.map((a) => {
            const name = t(a.nameEn || a.name, a.name);
            const alt =
              a.nameEn && a.name && a.nameEn !== a.name
                ? t(a.name, a.nameEn)
                : "";
            const bioPreview = plainText(
              t(a.bio || "", a.bioKo || "")
            ).trim();
            const href = `/export/author/${encodeURIComponent(a.slug)}`;
            return (
              <li key={a.slug}>
                <Link className="author-index-card" href={href}>
                  <div className="author-index-card-top">
                    <h2>{name}</h2>
                    <span className="author-index-count">
                      {t(
                        `${a.books.length} title${a.books.length === 1 ? "" : "s"}`,
                        `저작물 ${a.books.length}종`
                      )}
                    </span>
                  </div>
                  {alt ? <p className="author-index-alt">{alt}</p> : null}
                  {bioPreview ? (
                    <p className="author-index-bio">
                      {bioPreview.length > 160
                        ? `${bioPreview.slice(0, 160)}…`
                        : bioPreview}
                    </p>
                  ) : (
                    <p className="author-index-bio muted">
                      {t(
                        "Biography coming soon",
                        "저자소개 준비 중"
                      )}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="detail-cta" style={{ marginBottom: 48 }}>
        <Link className="btn btn-secondary" href="/export">
          {t("Back to titles", "도서 목록으로")}
        </Link>
      </div>
    </div>
  );
}
