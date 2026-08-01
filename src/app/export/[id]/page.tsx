"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { ExportCard, HeroCover } from "@/components/CoverCard";
import { InteriorPreview } from "@/components/InteriorPreview";
import { useExportTitles } from "@/hooks/useExportTitles";
import { authorHref, bookAuthors } from "@/lib/export-authors";
import { RichText, plainText } from "@/components/RichText";
import { bookCategoryIds } from "@/lib/export-categories";

export default function ExportDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const { t } = useLang();
  const { titles: exportTitles, loading } = useExportTitles();
  const book = exportTitles.find((b) => b.id === id);

  if (loading && !book) {
    return (
      <div className="container">
        <div className="empty-state" style={{ margin: "48px 0" }}>
          {t("Loading…", "불러오는 중…")}
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container">
        <div className="empty-state" style={{ margin: "48px 0" }}>
          {t("Title not found.", "타이틀을 찾을 수 없습니다.")}
        </div>
      </div>
    );
  }

  const title = t(book.title, book.titleKo);
  const titlePlain = plainText(title);
  /** Up to 2 co-authors from sheet author / author2 columns */
  const authors = bookAuthors(book);
  const hasAuthor = authors.length > 0;
  const hasPublisher = Boolean(
    (book.publisher && book.publisher !== "—") || book.publisherEn?.trim()
  );
  const publisherLabel = hasPublisher
    ? t(book.publisherEn || book.publisher, book.publisher)
    : "";
  const myCats = new Set(bookCategoryIds(book));
  const sameCategory = exportTitles.filter((b) => {
    if (b.id === book.id) return false;
    return bookCategoryIds(b).some((id) => myCats.has(id));
  });
  const others = exportTitles.filter((b) => {
    if (b.id === book.id) return false;
    return !bookCategoryIds(b).some((id) => myCats.has(id));
  });
  const related = [...sameCategory, ...others].slice(0, 8);
  const catIds = (book.categories?.length ? book.categories : [book.category]).filter(
    Boolean
  );
  const catLabelsEn = book.categoryLabels?.length
    ? book.categoryLabels
    : [book.categoryLabel];
  const catLabelsKo = book.categoryLabelsKo?.length
    ? book.categoryLabelsKo
    : [book.categoryLabelKo];
  const categoryHref = `/export?category=${encodeURIComponent(book.category)}`;
  const publisherHref = `/export?publisher=${encodeURIComponent(book.publisher || "")}`;
  const formatText =
    book.format && book.format.length > 0 ? book.format.join(" · ") : "";
  const hasTitleEn = Boolean(book.title?.trim());
  const hasTitleKo = Boolean(book.titleKo?.trim());
  const hasSeries = Boolean(book.series?.trim() || book.seriesKo?.trim());
  const hasAge = Boolean(book.age?.trim());
  const hasPages = Boolean(book.pages && book.pages > 0);
  const hasYear = Boolean(book.pubYear && book.pubYear > 0);
  const hasFormat = Boolean(formatText);
  const hasSynopsis = Boolean(
    plainText(t(book.synopsis || "", book.synopsisKo || "")).trim()
  );
  const hasCoverCopy = Boolean(book.coverCopy?.trim() || book.coverCopyKo?.trim());
  const hasRightsSold = Boolean(
    book.rightsSold?.trim() || book.rightsSoldKo?.trim()
  );
  const hasRightsNote = Boolean(
    book.rightsNote?.trim() || book.rightsNoteKo?.trim()
  );
  const hasTerritories = Boolean(
    book.territories?.trim() || book.territoriesKo?.trim()
  );
  const hasSpecs =
    hasTitleEn ||
    hasTitleKo ||
    hasAuthor ||
    hasSeries ||
    hasAge ||
    hasPublisher ||
    hasPages ||
    hasFormat ||
    hasYear ||
    hasRightsNote ||
    hasTerritories;

  return (
    <div className="container">
      <div className="breadcrumb" style={{ paddingTop: 28 }}>
        <Link href="/">{t("Home", "홈")}</Link> /{" "}
        <Link href="/export">{t("For sales", "수출")}</Link> /{" "}
        {book.category ? (
          <Link href={categoryHref}>
            {t(book.categoryLabel, book.categoryLabelKo)}
          </Link>
        ) : (
          <span>{t("Titles", "도서")}</span>
        )}{" "}
        / {titlePlain}
      </div>

      <div className="detail-layout">
        <div className="detail-cover">
          <HeroCover book={book} />
          {book.previewImages && book.previewImages.length > 0 ? (
            <InteriorPreview images={book.previewImages} title={titlePlain} />
          ) : null}
        </div>
        <div className="detail-body">
          {titlePlain ? <RichText text={title} as="h1" /> : null}
          {hasSeries && (
            <p className="detail-series">
              <Link
                className="detail-series-link"
                href={`/export?series=${encodeURIComponent(
                  (book.seriesKo || book.series || "") as string
                )}`}
                title={t("Browse series", "시리즈 목록 보기")}
              >
                {t(
                  book.series || book.seriesKo || "",
                  book.seriesKo || book.series || ""
                )}
              </Link>
            </p>
          )}
          {authors.length > 0 ? (
            <div className="byline">
              {authors.map((a, i) => (
                <span key={`author-${a.slot}-${a.slug}`}>
                  {i > 0 ? (
                    <span className="byline-author-sep">{" · "}</span>
                  ) : null}
                  <Link
                    className="inline-link"
                    href={authorHref(a)}
                    title={t("View author biography", "저자소개 보기")}
                  >
                    {t(a.nameEn || a.name, a.name)}
                  </Link>
                </span>
              ))}
            </div>
          ) : null}
          {(catIds.length > 0 || hasAge) && (
            <div className="detail-tags">
              {catIds.map((id, i) => (
                <Link
                  key={id}
                  className="tag tag-link"
                  href={`/export?category=${encodeURIComponent(id)}`}
                  title={t(
                    `Browse ${catLabelsEn[i] || id}`,
                    `${catLabelsKo[i] || id} 목록 보기`
                  )}
                >
                  {t(catLabelsEn[i] || id, catLabelsKo[i] || id)}
                </Link>
              ))}
              {hasAge ? (
                <Link
                  className="tag tag-link"
                  href={`/export?q=${encodeURIComponent(book.age)}`}
                  title={t("Search by age", "연령대로 검색")}
                >
                  {book.age}
                </Link>
              ) : null}
            </div>
          )}

          {(hasSynopsis || hasCoverCopy) && (
            <div className="detail-section">
              <h2>{t("Synopsis", "소개")}</h2>
              {hasCoverCopy && (
                <RichText
                  as="p"
                  className="cover-copy"
                  text={t(book.coverCopy || "", book.coverCopyKo)}
                />
              )}
              {hasSynopsis && (
                <RichText as="p" text={t(book.synopsis, book.synopsisKo)} />
              )}
            </div>
          )}

          {hasSpecs && (
            <div className="detail-section">
              <h2>{t("Specifications", "스펙")}</h2>
              <table className="spec-table">
                <tbody>
                  {hasTitleEn && (
                    <tr>
                      <th>{t("English title", "영문 제목")}</th>
                      <td>
                        <RichText text={book.title} />
                      </td>
                    </tr>
                  )}
                  {hasTitleKo && (
                    <tr>
                      <th>{t("Korean / original title", "한국어·원제")}</th>
                      <td>
                        <RichText text={book.titleKo} />
                      </td>
                    </tr>
                  )}
                  {authors.length > 0 && (
                    <tr>
                      <th>{t("Author", "저자")}</th>
                      <td>
                        {authors.map((a, i) => (
                          <span key={`spec-author-${a.slot}`}>
                            {i > 0 ? (
                              <span className="byline-author-sep">{" · "}</span>
                            ) : null}
                            <Link
                              className="inline-link"
                              href={authorHref(a)}
                              title={t(
                                "View author biography",
                                "저자소개 보기"
                              )}
                            >
                              {t(a.nameEn || a.name, a.name)}
                            </Link>
                          </span>
                        ))}
                      </td>
                    </tr>
                  )}
                  {hasSeries && (
                    <tr>
                      <th>{t("Series", "시리즈")}</th>
                      <td>
                        <Link
                          className="inline-link"
                          href={`/export?series=${encodeURIComponent(
                            book.seriesKo || book.series || ""
                          )}`}
                        >
                          {t(
                            book.series || book.seriesKo || "",
                            book.seriesKo || book.series || ""
                          )}
                        </Link>
                      </td>
                    </tr>
                  )}
                  {hasAge && (
                    <tr>
                      <th>{t("Age group", "연령대")}</th>
                      <td>{book.age}</td>
                    </tr>
                  )}
                  {hasPublisher && (
                    <tr>
                      <th>{t("Korean publisher", "한국 출판사")}</th>
                      <td>
                        <Link className="inline-link" href={publisherHref}>
                          {publisherLabel}
                        </Link>
                      </td>
                    </tr>
                  )}
                  {hasPages && (
                    <tr>
                      <th>{t("Pages", "페이지")}</th>
                      <td>{book.pages}</td>
                    </tr>
                  )}
                  {hasFormat && (
                    <tr>
                      <th>{t("Formats", "포맷")}</th>
                      <td>{formatText}</td>
                    </tr>
                  )}
                  {hasYear && (
                    <tr>
                      <th>{t("Year", "출간연도")}</th>
                      <td>{book.pubYear}</td>
                    </tr>
                  )}
                  {hasRightsNote && (
                    <tr>
                      <th>{t("Rights note", "판권 안내")}</th>
                      <td>
                        {t(book.rightsNote || "", book.rightsNoteKo || "")}
                      </td>
                    </tr>
                  )}
                  {hasTerritories && (
                    <tr>
                      <th>{t("Territories", "판매 지역")}</th>
                      <td>
                        {t(book.territories || "", book.territoriesKo || "")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="detail-section">
            <h2>{t("Rights Sold", "계약 언어")}</h2>
            <div className="rights-list">
              <span className={`right-pill${hasRightsSold ? "" : " closed"}`}>
                {hasRightsSold
                  ? t(book.rightsSold || "", book.rightsSoldKo)
                  : t("World rights available", "전세계 판권 가능")}
              </span>
            </div>
          </div>

          <div className="detail-cta">
            <Link className="btn btn-primary" href="/contact">
              {t("Inquire about this title", "이 타이틀 문의")}
            </Link>
            <Link className="btn btn-secondary" href="/export">
              {t("Back to list", "목록으로")}
            </Link>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>
            {sameCategory.length > 0
              ? t(
                  `More in ${book.categoryLabel}`,
                  `${book.categoryLabelKo} 더 보기`
                )
              : t("More titles", "다른 도서")}
          </h2>
          <Link className="btn-ghost" href={categoryHref}>
            {t(`All ${book.categoryLabel}`, `${book.categoryLabelKo} 전체`)}
          </Link>
        </div>
        <div className="scroll-row">
          {related.map((b) => (
            <ExportCard key={b.id} book={b} />
          ))}
        </div>
      </section>
    </div>
  );
}
