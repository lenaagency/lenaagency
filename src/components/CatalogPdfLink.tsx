"use client";

import { useSession } from "next-auth/react";
import { useLang } from "@/context/LangContext";

const PDF_BY_ID: Record<string, string> = {
  "aic-im-upset": "/catalog/aic-im-upset-en.pdf",
};

/** English one-sheet download — admin session only (same login as royalties). */
export function CatalogPdfLink({ bookId }: { bookId: string }) {
  const { t } = useLang();
  const { data: session } = useSession();
  const href = PDF_BY_ID[bookId];
  if (!href || session?.user?.role !== "admin") return null;

  return (
    <p className="detail-pdf-link">
      <a
        className="inline-link"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        {t("English one-sheet (PDF)", "영문 소개 PDF")}
      </a>
    </p>
  );
}
