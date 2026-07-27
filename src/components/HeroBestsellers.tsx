"use client";

import { useLang } from "@/context/LangContext";
import type { ImportHighlight } from "@/lib/types";

type Props = {
  books: ImportHighlight[];
};

/**
 * Same five titles as the multipanel, fan layout.
 * Left → right: #3 #4 | #1 (main) | #10 #6
 */
const FAN_RANKS = [3, 4, 1, 10, 6] as const;

/**
 * Hero cover fan — full covers, mild arc, #1 featured center.
 */
export function HeroBestsellers({ books }: Props) {
  const { t } = useLang();

  const items = FAN_RANKS.flatMap((rank, index) => {
    const book = books[rank - 1];
    if (!book?.cover) return [];
    return [{ book, rank, index }];
  });

  if (!items.length) return null;

  return (
    <div className="hero-visual hero-fan">
      <ul
        className="hero-fan-stage"
        aria-label={t("Bestsellers", "베스트셀러")}
      >
        {items.map(({ book, rank, index }) => {
          const title = t(book.title, book.titleKo);
          const isMain = rank === 1;
          return (
            <li
              key={book.id}
              className={`hero-fan-book hero-fan-book--${index}${
                isMain ? " hero-fan-book--main" : ""
              }`}
              title={title}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.cover}
                alt={title}
                className="hero-fan-img"
                loading={isMain || index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
              <span className="sr-only">
                #{rank} {title}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
