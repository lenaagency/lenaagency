"use client";

import Link from "next/link";
import { LENA } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function AboutPage() {
  const { lang, t } = useLang();
  const isKo = lang === "ko";

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">{t("Home", "홈")}</Link> /{" "}
            <span>{t("About", "소개")}</span>
          </div>
          <h1>{t("About", "소개")}</h1>
          <p>
            {t(
              "Partnerships beyond borders. Outstanding ideas, carefully placed.",
              "국경을 넘는 파트너십. 탁월한 아이디어를 세계에 전합니다."
            )}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container about-layout">
          <div className="about-prose">
            <h2>{t("Who we are", "레나에이전시는")}</h2>
            <p className="about-lead">
              {t(
                "Founded in 2019, LENA Agency is a literary rights agency based in Seoul. We introduce quality international books to Korean publishers, and bring selected Korean titles to partners around the world.",
                "2019년에 설립된 출판 해외저작권 에이전시입니다. 양질의 해외 도서를 한국 출판사에 소개하고, 선별된 한국 도서를 세계 파트너에게 전합니다."
              )}
            </p>

            <h2 className="stats-heading">
              {t("At a glance", "데이터로 보는")}
            </h2>
            <div className="about-stats">
              {LENA.stats.map((s) => (
                <div className="stat" key={s.label}>
                  <strong>{s.value}</strong>
                  <span>{t(s.label, s.labelKo)}</span>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div className="about-side-card">
              <div className="brand">
                LENA <span>Agency</span>
              </div>
              <div className="brand-ko">레나에이전시</div>
              <div className="info-row">
                <strong>{t("Based in", "거점")}</strong>
                <span>{t("Seoul, Korea", "서울, 한국")}</span>
              </div>
              <div className="info-row">
                <strong>{t("Focus", "초점")}</strong>
                <span>
                  {t("Trade, children’s & illustrated", "단행본·아동·일러스트")}
                </span>
              </div>
              <div className="info-row">
                <strong>{t("Markets", "시장")}</strong>
                <span>{t("Korea ↔ world", "한국 ↔ 세계")}</span>
              </div>
              <div className="info-row">
                <strong>{t("Languages", "언어")}</strong>
                <span>KO · EN</span>
              </div>
              <Link className="btn btn-primary side-cta" href="/contact">
                {t("Get in touch", "문의하기")}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-alt" id="services">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t("What we do", "서비스")}</h2>
              {!isKo && (
                <p className="about-services-intro">
                  Full-cycle literary rights representation—inbound, outbound,
                  co-production, and other rights.
                </p>
              )}
            </div>
          </div>
          <div className="service-cards">
            {LENA.services.map((s) => (
              <article className="service-card" key={s.num}>
                <div className="num">{s.num}</div>
                <h3>{t(s.title, s.titleKo)}</h3>
                <p>{t(s.body, s.bodyKo)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>
            {t(
              "Let’s find the right home for a book.",
              "국경을 넘는 파트너십을 함께 만듭니다."
            )}
          </h2>
          {!isKo && (
            <p>
              Whether you need Korean rights representation or partners for
              Korean titles abroad, we’d love to hear from you.
            </p>
          )}
          <Link className="btn btn-primary" href="/contact">
            {t("Contact us", "레나에이전시 문의")}
          </Link>
        </div>
      </section>
    </>
  );
}
