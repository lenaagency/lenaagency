"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/context/LangContext";

const IG = "https://www.instagram.com/lena.agency";

const NAV = [
  { href: "/", en: "Home", ko: "홈", key: "home" },
  { href: "/about", en: "About", ko: "소개", key: "about" },
  { href: "/import", en: "Licensed", ko: "수입", key: "import" },
  { href: "/export", en: "For sales", ko: "수출", key: "export" },
  { href: "/royalties", en: "Royalties", ko: "인세보고", key: "royalties" },
] as const;

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const isActive = (key: string, href: string) => {
    if (key === "home") return pathname === "/";
    if (key === "export") return pathname.startsWith("/export");
    if (key === "import") return pathname.startsWith("/import");
    if (key === "royalties")
      return pathname.startsWith("/royalties") || pathname.startsWith("/login");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="logo" href="/" aria-label="LENA Agency / 레나에이전시">
          <span className="logo-mark">
            LENA <span>Agency</span>
          </span>
          <span className="logo-sub">레나에이전시</span>
        </Link>

        <nav className={`nav ${open ? "open" : ""}`} id="main-nav">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={isActive(item.key, item.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {t(item.en, item.ko)}
            </Link>
          ))}
          <div className="lang-switch" style={{ marginLeft: 8 }}>
            <button
              type="button"
              className={lang === "ko" ? "active" : ""}
              onClick={() => setLang("ko")}
            >
              KO
            </button>
            <button
              type="button"
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a
            className="header-social"
            href={IG}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <IgIcon />
          </a>
          <Link className="header-cta" href="/contact">
            {t("Inquiry", "문의하기")}
          </Link>
        </div>

        <button
          className="menu-toggle"
          aria-label={open ? t("Close menu", "메뉴 닫기") : t("Menu", "메뉴")}
          aria-expanded={open}
          aria-controls="main-nav"
          type="button"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
