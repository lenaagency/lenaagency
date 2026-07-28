"use client";

import Link from "next/link";
import { LENA } from "@/lib/data";
import { useLang } from "@/context/LangContext";

const IG = "https://www.instagram.com/lena.agency";

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  const { lang, t } = useLang();
  const a = LENA.agency;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="logo-mark">
              LENA <span style={{ color: "var(--coral)" }}>Agency</span>
            </span>
            <p style={{ marginTop: 6, fontSize: "0.85rem", opacity: 0.85 }}>레나에이전시</p>
            <p>{lang === "ko" ? a.leadKo : a.lead}</p>
            <div className="footer-social">
              <a
                className="btn-instagram"
                href={IG}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IgIcon />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t("Menu", "메뉴")}</h4>
            <Link href="/">{t("Home", "홈")}</Link>
            <Link href="/about">{t("About", "소개")}</Link>
            <Link href="/import">{t("Licensed", "수입")}</Link>
            <Link href="/export">{t("For sales", "수출")}</Link>
            <Link href="/royalties">{t("Royalties", "인세보고")}</Link>
          </div>

          <div className="footer-col">
            <h4>{t("Services", "서비스")}</h4>
            <Link href="/import">{t("Korean rights", "해외 저작물 수입")}</Link>
            <Link href="/export">{t("Foreign rights", "한국 저작물 수출")}</Link>
            <Link href="/about#services">{t("Co-production", "공동제작")}</Link>
            <Link href="/about#services">{t("IP consultation", "IP 상담")}</Link>
          </div>

          <div className="footer-col">
            <h4>{t("Contact", "문의")}</h4>
            <Link href="/contact">{t("Contact", "문의하기")}</Link>
            <Link href="/login">{t("Member login", "회원 로그인")}</Link>
            <Link href="/royalties">{t("Royalty reports", "인세보고")}</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} LENA Agency · 레나에이전시. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
