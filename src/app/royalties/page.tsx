"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";
import type {
  RoyaltyContract,
  RoyaltyEditableFields,
} from "@/lib/royalty-types";
import {
  canEditRoyalties,
  isRightsHolder,
  normalizeMemberRole,
} from "@/lib/royalty-types";
import {
  AUTO_CALC_KEYS,
  applyAutoCalculations,
  baselinePrevCumulative,
  formatRoyaltyBreakdown,
} from "@/lib/royalty-calc";

type ApiResponse = {
  contracts: RoyaltyContract[];
  source: "google_sheets" | "local_cache" | "sample";
  error?: string | null;
  syncedAt?: string | null;
  writeEnabled?: boolean;
  canEdit?: boolean;
  user: { email: string; name?: string | null; role: string; org: string };
  count: number;
};

type FieldRole = "base" | "member" | "auto";

const EDIT_KEYS: {
  key: keyof RoyaltyEditableFields;
  en: string;
  ko: string;
  kind: "number" | "text";
  full?: boolean;
  role: FieldRole;
}[] = [
  { key: "contractDate", en: "Agreement date", ko: "계약일", kind: "text", role: "base" },
  { key: "rightsHolder", en: "Rights holder", ko: "저작권사", kind: "text", role: "base" },
  { key: "country", en: "Country", ko: "국가", kind: "text", role: "base" },
  { key: "org", en: "Publisher", ko: "출판사", kind: "text", role: "base" },
  // title shown as 한글제목 + 원서제목 (custom block in modal)
  { key: "royaltyRate", en: "Royalty rate", ko: "인세율", kind: "text", role: "base" },
  { key: "advance", en: "Advance", ko: "선인세", kind: "number", role: "base" },
  { key: "currency", en: "Currency", ko: "통화", kind: "text", role: "base" },
  { key: "fxRate", en: "FX rate", ko: "환율", kind: "number", role: "base" },
  { key: "pubDeadline", en: "Publication deadline", ko: "출간기한", kind: "text", role: "base" },
  { key: "expiration", en: "Expiration date", ko: "계약만료일", kind: "text", role: "base" },
  { key: "sellOff", en: "Sell-off", ko: "Sell-off", kind: "text", role: "base" },
  { key: "pubDate", en: "Publication date", ko: "출간일", kind: "text", role: "member" },
  { key: "firstPrintRun", en: "First print-run", ko: "초판부수", kind: "number", role: "member" },
  { key: "retailPrice", en: "Retail price (KRW)", ko: "정가 (원)", kind: "number", role: "member" },
  {
    key: "ebookNetReceipts",
    en: "Ebook/audiobook net receipts (KRW)",
    ko: "전자책·오디오북 순수입 (원)",
    kind: "number",
    role: "member",
  },
  {
    key: "prevStock",
    en: "Previous year stock",
    ko: "전년도 재고부수",
    kind: "number",
    role: "base",
  },
  {
    key: "printed2025",
    en: "Year printed copies",
    ko: "해당년도 인쇄부수",
    kind: "number",
    role: "member",
  },
  {
    key: "destroyed2025",
    en: "Year destroyed/giveaway",
    ko: "해당년도 증정 및 파기부수",
    kind: "number",
    role: "member",
  },
  {
    key: "salesQty",
    en: "Year sales copies",
    ko: "해당년도 판매부수",
    kind: "number",
    role: "member",
  },
  {
    key: "totalSold",
    en: "Cumulative sales (auto)",
    ko: "누적 판매부수 (자동)",
    kind: "number",
    role: "auto",
  },
  {
    key: "currentStock",
    en: "Current stock (auto)",
    ko: "당기 재고부수 (자동)",
    kind: "number",
    role: "auto",
  },
  {
    key: "royaltyAmount",
    en: "Year royalties KRW (auto)",
    ko: "해당년도 인세 발생금액 (자동)",
    kind: "number",
    role: "auto",
  },
  {
    key: "remainingAdvance",
    en: "Remaining advance (KRW)",
    ko: "선인세 잔여금액",
    kind: "number",
    role: "base",
  },
  {
    key: "paymentDue",
    en: "Additional royalty due (auto)",
    ko: "추가 인세 발생금액 (자동)",
    kind: "number",
    role: "auto",
  },
];

function formatQty(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined).format(n);
}

function displayTitle(c: RoyaltyContract, lang: string) {
  if (lang === "ko" && c.titleKo) return c.titleKo;
  if (lang === "ko") {
    const m = c.title.match(/\[([^\]]+)\]\s*$/);
    if (m) return m[1];
  }
  return c.title;
}

/** 한글제목 / 원서제목 split from sheet title (supports [], ［］, 【】) */
function splitBookTitles(c: Pick<RoyaltyContract, "title" | "titleKo">) {
  const raw = (c.title || "").trim();
  let korean = (c.titleKo && c.titleKo.trim()) || "";
  let original = raw;

  if (!korean) {
    const m =
      raw.match(/\[([^\]]+)\]\s*$/) ||
      raw.match(/［([^］]+)］\s*$/) ||
      raw.match(/【([^】]+)】\s*$/);
    if (m) korean = m[1].trim();
  }

  original =
    raw
      .replace(/\s*\[[^\]]+\]\s*$/, "")
      .replace(/\s*［[^］]+］\s*$/, "")
      .replace(/\s*【[^】]+】\s*$/, "")
      .trim() || raw;

  // If whole title is Korean (no latin), treat as korean title
  if (!korean && raw && !/[A-Za-z]{3,}/.test(raw)) {
    korean = raw;
    original = "";
  }

  return { korean: korean || "—", original: original || "—" };
}

function fieldsFromContract(c: RoyaltyContract): RoyaltyEditableFields {
  return applyAutoCalculations({
    contractDate: c.contractDate ?? "",
    rightsHolder: c.rightsHolder ?? "",
    country: c.country ?? "",
    org: c.org || c.publisher || "",
    publisher: c.publisher || c.org || "",
    title: c.title ?? "",
    royaltyRate: c.royaltyRate ?? "",
    advance: c.advance ?? null,
    currency: c.currency ?? "",
    fxRate: c.fxRate ?? null,
    pubDeadline: c.pubDeadline ?? "",
    expiration: c.expiration ?? "",
    sellOff: c.sellOff ?? "",
    pubDate: c.pubDate ?? "",
    firstPrintRun: c.firstPrintRun ?? null,
    retailPrice: c.retailPrice ?? null,
    ebookNetReceipts: c.ebookNetReceipts ?? null,
    prevStock: c.prevStock ?? null,
    printed2025: c.printed2025 ?? null,
    destroyed2025: c.destroyed2025 ?? null,
    salesQty: c.salesQty ?? null,
    totalSold: c.totalSold ?? null,
    prevCumulativeBase: baselinePrevCumulative(c.totalSold, c.salesQty),
    currentStock: c.currentStock ?? null,
    royaltyAmount: c.royaltyAmount ?? null,
    remainingAdvance: c.remainingAdvance ?? null,
    paymentDue: c.paymentDue ?? null,
    reportComplete: c.reportComplete || "incomplete",
  });
}

function completionLabel(
  v: RoyaltyContract["reportComplete"] | undefined,
  t: (en: string, ko: string) => string
) {
  if (v === "complete") return t("Complete", "완료");
  if (v === "incomplete") return t("Incomplete", "미완료");
  return t("Incomplete", "미완료");
}

export default function RoyaltiesPage() {
  const { t, lang } = useLang();
  const { data: session, status } = useSession();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<RoyaltyContract | null>(null);
  const [draft, setDraft] = useState<RoyaltyEditableFields>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/royalties?fresh=1", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/login?callbackUrl=/royalties";
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch {
      setErr(
        t(
          "Could not load royalty data. Please try again.",
          "인세 데이터를 불러오지 못했습니다. 다시 시도해 주세요."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === "authenticated") load();
    if (status === "unauthenticated") {
      window.location.href = "/login?callbackUrl=/royalties";
    }
  }, [status, load]);

  const filtered = useMemo(() => {
    const list = data?.contracts ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((c) => {
      const blob = [
        c.fileNo,
        c.title,
        c.titleKo,
        c.org,
        c.publisher,
        c.rightsHolder,
        c.country,
        c.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [data, q]);

  const totals = useMemo(() => {
    let complete = 0;
    for (const c of filtered) {
      if (c.reportComplete === "complete") complete += 1;
    }
    return {
      count: filtered.length,
      complete,
      incomplete: filtered.length - complete,
    };
  }, [filtered]);

  function openEditor(c: RoyaltyContract) {
    const { korean } = splitBookTitles(c);
    const withKo: RoyaltyContract = {
      ...c,
      titleKo:
        c.titleKo ||
        (korean !== "—" ? korean : undefined),
    };
    setEditing(withKo);
    setDraft(fieldsFromContract(withKo));
    setSaveMsg("");
    setSaveErr("");
  }

  function closeEditor() {
    setEditing(null);
    setSaveMsg("");
    setSaveErr("");
  }

  /** Only member-input keys (and completion) may be edited on the web */
  const MEMBER_EDITABLE = new Set<string>([
    "pubDate",
    "firstPrintRun",
    "retailPrice",
    "ebookNetReceipts",
    "printed2025",
    "destroyed2025",
    "salesQty",
    "reportComplete",
  ]);

  function setField(
    key: keyof RoyaltyEditableFields,
    value: string,
    kind: "number" | "text"
  ) {
    if (!canEditRoyalties(data?.user?.role ?? session?.user?.role)) return;
    if ((AUTO_CALC_KEYS as string[]).includes(key)) return;
    if (!MEMBER_EDITABLE.has(key)) return;

    setDraft((prev) => {
      let next: RoyaltyEditableFields = { ...prev };
      if (kind === "text") {
        next = { ...next, [key]: value };
      } else if (value.trim() === "") {
        next = { ...next, [key]: null };
      } else {
        const num = Number(value.replace(/,/g, ""));
        next = { ...next, [key]: Number.isFinite(num) ? num : null };
      }
      return applyAutoCalculations(next);
    });
  }

  async function downloadExcel() {
    setExporting(true);
    try {
      const res = await fetch("/api/royalties/export?fresh=1", {
        cache: "no-store",
      });
      if (res.status === 401) {
        window.location.href = "/login?callbackUrl=/royalties";
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const m = cd.match(/filename="([^"]+)"/);
      const filename = m?.[1] || "lena-royalty-reports.xlsx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErr(
        t(
          "Could not download Excel. Please try again.",
          "엑셀 다운로드에 실패했습니다. 다시 시도해 주세요."
        )
      );
    } finally {
      setExporting(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    if (!canEditRoyalties(data?.user?.role ?? session?.user?.role)) return;
    setSaving(true);
    setSaveMsg("");
    setSaveErr("");
    try {
      const res = await fetch("/api/royalties/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          sheetRow: editing.sheetRow,
          fileNo: editing.fileNo,
          title: editing.title,
          fields: draft,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        via?: string;
        contract?: RoyaltyContract;
      };
      if (!res.ok) {
        setSaveErr(
          json.error ||
            t("Save failed", "저장에 실패했습니다")
        );
        return;
      }
      setSaveMsg(
        json.message ||
          t("Saved", "저장되었습니다")
      );
      // Optimistic update in list
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          contracts: prev.contracts.map((c) =>
            c.id === editing.id ? { ...c, ...draft } : c
          ),
        };
      });
      setEditing((e) => (e ? { ...e, ...draft } : e));
      // Refresh from sheet shortly after
      setTimeout(() => load(), 1500);
    } catch {
      setSaveErr(t("Network error", "네트워크 오류"));
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || (status === "authenticated" && loading && !data)) {
    return (
      <section className="section">
        <div className="container">
          <p className="royalty-muted">{t("Loading…", "불러오는 중…")}</p>
        </div>
      </section>
    );
  }

  const user = data?.user ?? {
    email: session?.user?.email ?? "",
    name: session?.user?.name,
    role: normalizeMemberRole(session?.user?.role ?? "publisher"),
    org: session?.user?.org ?? "",
  };

  const role = normalizeMemberRole(user.role);
  const canEdit =
    data?.canEdit ?? canEditRoyalties(user.role ?? session?.user?.role);
  const rightsOnly = isRightsHolder(user.role) || role === "rights_holder";

  const roleLabel =
    role === "admin"
      ? t("Admin · all contracts", "관리자 · 전체 계약")
      : role === "rights_holder"
        ? t(
            `Rights holder · ${user.org || "—"}`,
            `저작권사 · ${user.org || "—"}`
          )
        : t(
            `Publisher · ${user.org || "—"}`,
            `출판사 · ${user.org || "—"}`
          );

  return (
    <section className="section">
      <div className="container">
        <div className="section-head royalty-head">
          <div>
            <h2>{t("Royalty reports", "인세보고")}</h2>
            <p>
              {rightsOnly
                ? t(
                    "View royalty reports by title. Download the full list as Excel.",
                    "타이틀별 인세보고 내역을 조회할 수 있습니다. 전체 리스트는 엑셀로 다운로드하세요."
                  )
                : t(
                    "View contracts and enter royalty report fields. Changes save to the contract list.",
                    "계약을 확인하고 인세보고 항목을 직접 입력하세요. 저장 시 계약목록에 반영됩니다."
                  )}
            </p>
          </div>
          <div className="royalty-user-bar">
            <div className="royalty-user-meta">
              <strong>{user.name || user.email}</strong>
              <span>{roleLabel}</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              {t("Sign out", "로그아웃")}
            </button>
          </div>
        </div>

        <div className="royalty-toolbar">
          <input
            className="royalty-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(
              "Search title, publisher, rights holder, file no…",
              "도서명, 출판사, 저작권사, 파일번호 검색…"
            )}
            aria-label={t("Search", "검색")}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={load}
            disabled={loading}
          >
            {loading ? t("Refreshing…", "새로고침…") : t("Refresh", "새로고침")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadExcel}
            disabled={exporting || loading || !data?.contracts?.length}
          >
            {exporting
              ? t("Downloading…", "다운로드 중…")
              : t("Download Excel", "엑셀 다운로드")}
          </button>
        </div>

        {data?.source === "google_sheets" ? (
          <p className="royalty-source-ok">
            {t(
              "Live from Google Drive 계약목록.",
              "구글 드라이브 계약목록 연동 중."
            )}{" "}
            {rightsOnly
              ? t(
                  "View-only access. Use Excel download for the full list.",
                  "조회 전용입니다. 전체 리스트는 엑셀로 다운로드하세요."
                )
              : data.writeEnabled
                ? t(
                    "Web edits write back to the sheet.",
                    "웹 입력이 시트에 저장됩니다."
                  )
                : t(
                    "Connect Apps Script write URL to save into the sheet (see sheets/apps-script-royalty-write.gs).",
                    "시트 저장을 위해 Apps Script URL 연결이 필요합니다 (sheets/apps-script-royalty-write.gs)."
                  )}
          </p>
        ) : data?.source === "local_cache" ? (
          <p className="royalty-banner">
            {t(
              "Local cache mode. Share the sheet or check GOOGLE_CONTRACTS_SHEETS_ID.",
              "로컬 캐시 모드입니다. 시트 공유 또는 GOOGLE_CONTRACTS_SHEETS_ID 를 확인하세요."
            )}
          </p>
        ) : (
          <p className="royalty-banner">
            {t("No contract data loaded.", "계약 데이터가 없습니다.")}
            {data?.error ? ` · ${data.error}` : ""}
          </p>
        )}

        {err ? (
          <p className="form-error" role="alert">
            {err}
          </p>
        ) : null}

        <div className="royalty-totals">
          <div className="royalty-total-chip">
            <span>{t("Contracts", "계약 수")}</span>
            <strong>{totals.count}</strong>
          </div>
          <div className="royalty-total-chip">
            <span>{t("Complete", "완료")}</span>
            <strong>{totals.complete}</strong>
          </div>
          <div className="royalty-total-chip">
            <span>{t("Incomplete", "미완료")}</span>
            <strong>{totals.incomplete}</strong>
          </div>
        </div>

        <div className="royalty-table-wrap">
          <table className="royalty-table royalty-table-list">
            <colgroup>
              <col className="col-date" />
              <col className="col-title" />
              <col className="col-publisher" />
              <col className="col-holder" />
              <col className="col-rate" />
              <col className="col-advance" />
              <col className="col-currency" />
              <col className="col-action" />
              <col className="col-status" />
            </colgroup>
            <thead>
              <tr>
                <th>{t("Agreement date", "계약일")}</th>
                <th>{t("Title", "도서")}</th>
                <th>{t("Publisher", "출판사")}</th>
                <th>{t("Rights holder", "저작권사")}</th>
                <th>{t("Royalty rate", "인세율")}</th>
                <th>{t("Advance", "선인세")}</th>
                <th>{t("Currency", "통화")}</th>
                <th>
                  {rightsOnly
                    ? t("View report", "내역 보기")
                    : t("Enter report", "인세입력")}
                </th>
                <th>{t("Status", "완료여부")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="royalty-empty">
                    {t(
                      "No contracts found for your account.",
                      "계정에 연결된 계약이 없습니다."
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const main = displayTitle(c, lang);
                  const done = c.reportComplete === "complete";
                  return (
                    <tr key={c.id}>
                      <td className="royalty-nowrap cell-date">
                        {c.contractDate || "—"}
                      </td>
                      <td className="cell-title">
                        <div className="royalty-title-cell">
                          <strong title={c.title}>{main}</strong>
                          {lang === "ko" && main !== c.title ? (
                            <span className="royalty-sub" title={c.title}>
                              {c.title.replace(/\s*\[[^\]]+\]\s*$/, "")}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="cell-publisher">
                        <div
                          className="cell-clamp"
                          title={c.publisher || c.org || ""}
                        >
                          {c.publisher || c.org || "—"}
                        </div>
                      </td>
                      <td className="cell-holder">
                        <div className="cell-clamp" title={c.rightsHolder || ""}>
                          {c.rightsHolder || "—"}
                        </div>
                      </td>
                      <td className="cell-rate">
                        <div className="cell-clamp" title={c.royaltyRate || ""}>
                          {c.royaltyRate || "—"}
                        </div>
                      </td>
                      <td className="royalty-nowrap cell-advance">
                        {c.advance != null ? formatQty(c.advance) : "—"}
                      </td>
                      <td className="cell-currency">{c.currency || "—"}</td>
                      <td className="cell-action">
                        <button
                          type="button"
                          className={`btn royalty-edit-btn ${
                            rightsOnly ? "btn-secondary" : "btn-primary"
                          }`}
                          onClick={() => openEditor(c)}
                        >
                          {rightsOnly
                            ? t("View", "보기")
                            : t("Enter", "인세입력")}
                        </button>
                      </td>
                      <td className="cell-status">
                        <span
                          className={`royalty-complete-badge ${
                            done ? "is-complete" : "is-incomplete"
                          }`}
                        >
                          {completionLabel(c.reportComplete, t)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="form-note" style={{ marginTop: 20 }}>
          {rightsOnly
            ? t(
                "Click “View” for title-level royalty figures, or download Excel for the full list. ",
                "「보기」에서 타이틀별 인세 내역을 확인하거나, 엑셀로 전체 리스트를 다운로드하세요. "
              )
            : t(
                "Click “Enter report” to fill figures and set completion status. ",
                "「인세입력」에서 수치를 작성하고 완료여부를 선택하세요. "
              )}
          <Link href="/contact">{t("Contact LENA", "레나 문의")}</Link>
        </p>
      </div>

      {editing ? (
        <div
          className="royalty-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditor();
          }}
        >
          <div
            className="royalty-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="royalty-edit-title"
          >
            <div className="royalty-modal-head">
              {(() => {
                const { korean, original } = splitBookTitles({
                  title: draft.title || editing.title,
                  titleKo: editing.titleKo,
                });
                return (
                  <div
                    id="royalty-edit-title"
                    className="royalty-title-head-block royalty-title-head-in-modal"
                  >
                    <div className="royalty-title-head-value">{korean}</div>
                    {original && original !== "—" && original !== korean ? (
                      <div className="royalty-title-head-value is-original">
                        {original}
                      </div>
                    ) : null}
                  </div>
                );
              })()}
              <button
                type="button"
                className="btn btn-ghost royalty-modal-close"
                onClick={closeEditor}
              >
                {t("Close", "닫기")}
              </button>
            </div>

            {canEdit ? (
              <div className="form-row royalty-field-member royalty-complete-row">
                <label htmlFor="edit-reportComplete">
                  {t("Completion status", "완료여부")}
                  <span className="royalty-field-tag member-tag">
                    {t("input", "입력")}
                  </span>
                </label>
                <select
                  id="edit-reportComplete"
                  value={draft.reportComplete || "incomplete"}
                  onChange={(e) =>
                    setField(
                      "reportComplete",
                      e.target.value as "complete" | "incomplete",
                      "text"
                    )
                  }
                >
                  <option value="incomplete">
                    {t("Incomplete", "미완료")}
                  </option>
                  <option value="complete">{t("Complete", "완료")}</option>
                </select>
              </div>
            ) : (
              <div className="form-row royalty-field-sheet royalty-complete-row">
                <label>{t("Completion status", "완료여부")}</label>
                <div className="royalty-readonly-value">
                  <span
                    className={`royalty-complete-badge ${
                      draft.reportComplete === "complete"
                        ? "is-complete"
                        : "is-incomplete"
                    }`}
                  >
                    {completionLabel(draft.reportComplete, t)}
                  </span>
                </div>
              </div>
            )}

            {canEdit ? (
              <div className="royalty-field-legend">
                <span className="royalty-legend-member">
                  {t("Member input", "회원 입력")}
                </span>
                <span className="royalty-legend-auto">
                  {t("Auto-calculated", "자동 계산")}
                </span>
                <span className="royalty-legend-sheet">
                  {t("Sheet only (read-only)", "시트 전용 · 수정 불가")}
                </span>
              </div>
            ) : (
              <p className="royalty-view-only-note">
                {t(
                  "Read-only royalty report for this title.",
                  "이 도서의 인세보고 내역 (조회 전용)"
                )}
              </p>
            )}

            <div className="royalty-edit-grid">
              {EDIT_KEYS.map((f) => {
                const raw = draft[f.key];
                const display =
                  raw == null || raw === undefined ? "" : String(raw);
                const isAuto = f.role === "auto";
                const isMember = f.role === "member";
                const isSheetOnly = f.role === "base";
                const locked = !canEdit || isAuto || isSheetOnly;
                return (
                  <div
                    className={[
                      "form-row",
                      f.full ? "royalty-edit-full" : "",
                      canEdit && isMember ? "royalty-field-member" : "",
                      canEdit && isAuto ? "royalty-field-auto" : "",
                      !canEdit || isSheetOnly ? "royalty-field-sheet" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={f.key}
                  >
                    <label htmlFor={`edit-${f.key}`}>
                      {lang === "ko" ? f.ko : f.en}
                      {canEdit && isMember ? (
                        <span className="royalty-field-tag member-tag">
                          {t("input", "입력")}
                        </span>
                      ) : null}
                      {canEdit && isAuto ? (
                        <span className="royalty-field-tag auto-tag">
                          {t("auto", "자동")}
                        </span>
                      ) : null}
                      {canEdit && isSheetOnly ? (
                        <span className="royalty-field-tag sheet-tag">
                          {t("sheet", "시트")}
                        </span>
                      ) : null}
                    </label>
                    {f.kind === "text" ? (
                      <input
                        id={`edit-${f.key}`}
                        type="text"
                        value={display}
                        readOnly={locked}
                        tabIndex={locked ? -1 : undefined}
                        onChange={(e) =>
                          setField(f.key, e.target.value, "text")
                        }
                      />
                    ) : (
                      <input
                        id={`edit-${f.key}`}
                        type="number"
                        inputMode="decimal"
                        value={display}
                        readOnly={locked}
                        tabIndex={locked ? -1 : undefined}
                        onChange={(e) =>
                          setField(f.key, e.target.value, "number")
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {formatRoyaltyBreakdown(draft, lang === "ko" ? "ko" : "en") ? (
              <p className="royalty-calc-breakdown" role="status">
                <strong>
                  {t("Royalty breakdown", "인세 구간 계산")}
                </strong>
                {": "}
                {formatRoyaltyBreakdown(draft, lang === "ko" ? "ko" : "en")}
              </p>
            ) : null}

            {canEdit ? (
              <p className="royalty-calc-hint">
                {t(
                  "Auto: cumulative sales = prior cumulative + year sales. Stock = prev + printed − destroyed − sales. Print royalty uses escalating rates on cumulative volume. Ebook: net receipts × rate. Additional royalty = year royalty − remaining advance.",
                  "자동: 누적 판매 = 직전 누적 + 해당년도 판매. 당기재고 = 전년재고+인쇄−증정파기−판매. 종이책 인세는 누적 판매 기준 구간 인세. 전자책: 순수입×인세율. 추가인세 = 해당년도 인세 − 선인세 잔여."
                )}
              </p>
            ) : null}

            {saveErr ? (
              <p className="form-error" role="alert">
                {saveErr}
              </p>
            ) : null}
            {saveMsg ? (
              <p className="royalty-save-ok" role="status">
                {saveMsg}
              </p>
            ) : null}

            <div className="royalty-modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeEditor}
              >
                {canEdit ? t("Cancel", "취소") : t("Close", "닫기")}
              </button>
              {canEdit ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={saveEdit}
                >
                  {saving
                    ? t("Saving…", "저장 중…")
                    : t("Save royalty report", "인세보고 저장")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
