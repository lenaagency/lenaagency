"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useLang } from "@/context/LangContext";

type Props = {
  images: string[];
  title: string;
};

export function InteriorPreview({ images, title }: Props) {
  const { t } = useLang();
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const close = useCallback(() => setOpen(false), []);

  const go = useCallback(
    (delta: number) => {
      if (count < 1) return;
      setIndex((i) => ((i + delta) % count + count) % count);
    },
    [count]
  );

  const show = useCallback(
    (i: number) => {
      if (count < 1) return;
      setIndex(((i % count) + count) % count);
      setOpen(true);
    },
    [count]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, go]);

  if (!count) return null;

  return (
    <>
      <div className="interior-preview">
        <button
          type="button"
          className="interior-preview-trigger"
          onClick={() => show(0)}
          aria-haspopup="dialog"
        >
          <span
            className="interior-preview-thumbs"
            style={{
              gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)`,
            }}
            aria-hidden
          >
            {images.slice(0, 4).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                className="interior-preview-thumb"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ))}
          </span>
          <span className="interior-preview-label">
            {t("Look inside", "본문 미리보기")}
          </span>
        </button>
      </div>

      {open ? (
        <div
          className="interior-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          onClick={close}
        >
          <div
            className="interior-lightbox-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="interior-lightbox-head">
              <h2 id={labelId} className="interior-lightbox-title">
                {t("Look inside", "본문 미리보기")}
                <span className="interior-lightbox-sub">
                  {title}
                  {" · "}
                  {index + 1}/{count}
                </span>
              </h2>
              <button
                type="button"
                className="interior-lightbox-close"
                onClick={close}
                aria-label={t("Close", "닫기")}
              >
                ×
              </button>
            </div>

            <div className="interior-lightbox-stage">
              {count > 1 ? (
                <button
                  type="button"
                  className="interior-nav interior-nav-prev"
                  onClick={() => go(-1)}
                  aria-label={t("Previous", "이전")}
                >
                  ‹
                </button>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="interior-lightbox-img"
                src={images[index]}
                alt={t(
                  `Sample page ${index + 1} of ${title}`,
                  `${title} 본문 미리보기 ${index + 1}`
                )}
                referrerPolicy="no-referrer"
              />
              {count > 1 ? (
                <button
                  type="button"
                  className="interior-nav interior-nav-next"
                  onClick={() => go(1)}
                  aria-label={t("Next", "다음")}
                >
                  ›
                </button>
              ) : null}
            </div>

            {count > 1 ? (
              <div className="interior-lightbox-dots" role="tablist">
                {images.map((src, i) => (
                  <button
                    key={`${src}-dot-${i}`}
                    type="button"
                    className={`interior-dot ${i === index ? "active" : ""}`}
                    onClick={() => setIndex(i)}
                    aria-label={t(`Page ${i + 1}`, `${i + 1}장`)}
                    aria-selected={i === index}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
