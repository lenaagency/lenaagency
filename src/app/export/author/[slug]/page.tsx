"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { ExportCard } from "@/components/CoverCard";
import { RichText, plainText } from "@/components/RichText";
import { useExportTitles } from "@/hooks/useExportTitles";
import { getAuthorProfile } from "@/lib/export-authors";

export default function ExportAuthorPage() {
  const params = useParams();
  const slug = decodeURIComponent(String(params.slug || ""));
  const { t } = useLang();
  const { titles: exportTitles, loading } = useExportTitles();
  const profile = getAuthorProfile(exportTitles, slug);

  if (loading && !profile) {
    return (
      <div className="container">
        <div className="empty-state" style={{ margin: "48px 0" }}>
          {t("Loading…", "불러오는 중…")}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="empty-state" style={{ margin: "48px 0" }}>
          <p>{t("Author not found.", "저자를 찾을 수 없습니다.")}</p>
          <Link
            className="btn btn-secondary"
            href="/export"
            style={{ marginTop: 16 }}
          >
            {t("Back to list", "목록으로")}
          </Link>
        </div>
      </div>
    );
  }

  const displayName = t(profile.nameEn || profile.name, profile.name);
  const hasBio = Boolean(
    plainText(profile.bio).trim() || plainText(profile.bioKo).trim()
  );

  return (
    <div className="container">
      <div className="breadcrumb" style={{ paddingTop: 28 }}>
        <Link href="/">{t("Home", "홈")}</Link> /{" "}
        <Link href="/export">{t("For sales", "수출")}</Link> /{" "}
        <span>{displayName}</span>
      </div>

      <div className="author-page">
        <header className="author-header">
          <p className="author-kicker">{t("Author", "저자")}</p>
          <h1>{displayName}</h1>
          {profile.nameEn && profile.name && profile.nameEn !== profile.name ? (
            <p className="author-alt-name">
              {t(profile.name, profile.nameEn)}
            </p>
          ) : null}
          <p className="author-header-meta">
            {t(
              `${profile.books.length} title${profile.books.length === 1 ? "" : "s"} in the catalogue`,
              `카탈로그 저작물 ${profile.books.length}종`
            )}
          </p>
        </header>

        {hasBio ? (
          <section className="detail-section author-bio">
            <h2>{t("About the author", "저자소개")}</h2>
            <RichText
              as="p"
              className="author-bio-text"
              text={t(profile.bio || "", profile.bioKo)}
            />
          </section>
        ) : (
          <section className="detail-section author-bio">
            <p className="author-bio-empty">
              {t(
                "Author biography will be added soon. Add authorBio / authorBioKo in the Titles sheet.",
                "저자소개는 곧 업데이트됩니다. Titles 시트의 authorBio / authorBioKo 에 입력하세요."
              )}
            </p>
          </section>
        )}

        <section className="section author-titles" style={{ paddingTop: 8 }}>
          <div className="section-head">
            <h2>
              {t(
                `Titles (${profile.books.length})`,
                `저작물 (${profile.books.length})`
              )}
            </h2>
            <Link className="btn-ghost" href="/export">
              {t("All titles", "전체 목록")}
            </Link>
          </div>
          <div className="title-grid cols-4">
            {profile.books.map((b) => (
              <ExportCard key={b.id} book={b} />
            ))}
          </div>
        </section>

        <div className="detail-cta" style={{ marginBottom: 48 }}>
          <Link className="btn btn-primary" href="/contact">
            {t("Rights inquiry", "권리 문의")}
          </Link>
          <Link className="btn btn-secondary" href="/export">
            {t("Back to list", "목록으로")}
          </Link>
        </div>
      </div>
    </div>
  );
}
