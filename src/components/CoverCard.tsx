"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLang } from "@/context/LangContext";
import type { ExportTitle, ImportHighlight } from "@/lib/types";
import { normalizeCoverUrl } from "@/lib/cover-url";
import { authorHref, bookAuthors } from "@/lib/export-authors";
import { RichText, plainText } from "@/components/RichText";

type Badge = "export" | "import" | "none";

function CoverVisual({
  title,
  author,
  colors,
  cover,
  genre,
  badge,
  rank,
}: {
  title: string;
  author?: string;
  colors?: string[];
  cover?: string;
  genre?: string;
  badge?: Badge;
  rank?: number;
}) {
  const { t } = useLang();
  const [c1, c2] = colors || ["#5c1524", "#9b1830"];
  // Drive /view 공유 링크 → 직접 이미지 URL (시트가 옛 형식이어도 표시)
  const coverSrc = normalizeCoverUrl(cover);

  let badgeEl: ReactNode = null;
  if (rank) {
    badgeEl = <span className="badge sold">#{rank}</span>;
  } else if (badge === "export") {
    badgeEl = <span className="badge available">{t("Export", "수출")}</span>;
  } else if (badge === "import") {
    badgeEl = <span className="badge sold">{t("Published", "출간")}</span>;
  }

  return (
    <div className="cover-card">
      {badgeEl}
      {coverSrc ? (
        coverSrc.startsWith("http://") || coverSrc.startsWith("https://") ? (
          // External cover URL from Google Sheet (Drive / CDN)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="cover-img"
            src={coverSrc}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <Image
            className="cover-img"
            src={coverSrc}
            alt={title}
            width={312}
            height={468}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )
      ) : (
        <div
          className="cover-placeholder"
          style={{ ["--c1" as string]: c1, ["--c2" as string]: c2 }}
        >
          {genre ? <div className="cover-genre">{genre}</div> : null}
          <div className="cover-title">{title}</div>
          {author ? <div className="cover-author">{author}</div> : null}
        </div>
      )}
    </div>
  );
}

export function ExportCard({ book }: { book: ExportTitle }) {
  const { t, lang } = useLang();
  const title = t(book.title, book.titleKo);
  const titlePlain = plainText(title);
  const authors = bookAuthors(book);
  const authorLine = authors
    .map((a) => t(a.nameEn || a.name, a.name))
    .join(" · ");
  const catIds = (book.categories?.length ? book.categories : [book.category]).filter(
    Boolean
  );
  const catLabelsEn = book.categoryLabels?.length
    ? book.categoryLabels
    : [book.categoryLabel];
  const catLabelsKo = book.categoryLabelsKo?.length
    ? book.categoryLabelsKo
    : [book.categoryLabelKo];
  const genre =
    lang === "ko"
      ? catLabelsKo.filter(Boolean).join(" · ")
      : catLabelsEn.filter(Boolean).join(" · ");
  const hasAge = Boolean(book.age?.trim());

  return (
    <article className="title-card">
      <Link className="title-card-link" href={`/export/${book.id}`}>
        <CoverVisual
          title={titlePlain}
          author={authorLine}
          colors={book.colors}
          cover={book.cover}
          genre={genre}
          badge="none"
        />
      </Link>
      <div className="title-meta">
        {catIds.length > 0 && (
          <div className="category-chip-row">
            {catIds.map((id, i) => (
              <Link
                key={id}
                className="category-chip"
                href={`/export?category=${encodeURIComponent(id)}`}
              >
                {t(catLabelsEn[i] || id, catLabelsKo[i] || id)}
              </Link>
            ))}
          </div>
        )}
        <h3>
          <Link href={`/export/${book.id}`}>
            <RichText text={title} />
          </Link>
        </h3>
        {authors.length > 0 && (
          <div className="author">
            {authors.map((a, i) => (
              <span key={a.slug + String(a.slot)}>
                {i > 0 ? <span className="author-sep"> · </span> : null}
                <Link
                  className="author-link"
                  href={authorHref(a)}
                  title={t("View author biography", "저자소개 보기")}
                >
                  {t(a.nameEn || a.name, a.name)}
                </Link>
              </span>
            ))}
          </div>
        )}
        {hasAge ? <div className="age-line">{book.age}</div> : null}
      </div>
    </article>
  );
}

export function ImportCard({
  book,
  rank,
}: {
  book: ImportHighlight;
  rank?: number;
}) {
  const { t } = useLang();
  const title = t(book.title, book.titleKo);
  const year = book.pubYear ? ` · ${book.pubYear}` : "";

  return (
    <div className="title-card import-card">
      <CoverVisual
        title={title}
        author={book.author}
        colors={book.colors}
        cover={book.cover}
        genre={book.koreanPublisher}
        badge="import"
        rank={rank}
      />
      <div className="title-meta">
        <h3>{title}</h3>
        <div className="author">{book.author || ""}</div>
        <div className="rights-line">
          {book.koreanPublisher || ""}
          {year}
        </div>
      </div>
    </div>
  );
}

export function HeroCover({ book }: { book: ExportTitle }) {
  const { t } = useLang();
  const authorLine = bookAuthors(book)
    .map((a) => t(a.nameEn || a.name, a.name))
    .join(" · ");
  return (
    <CoverVisual
      title={plainText(t(book.title, book.titleKo))}
      author={authorLine}
      colors={book.colors}
      cover={book.cover}
      genre={book.categoryLabelKo}
      badge="none"
    />
  );
}
