"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/context/LangContext";

function LoginForm() {
  const { t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/royalties";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError(
          t(
            "Invalid email or password. Contact LENA Agency for an account.",
            "이메일 또는 비밀번호가 올바르지 않습니다. 계정은 레나에이전시에 문의해 주세요."
          )
        );
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(t("Something went wrong. Please try again.", "오류가 발생했습니다. 다시 시도해 주세요."));
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 440 }}>
        <div className="section-head" style={{ marginBottom: 20 }}>
          <div>
            <h2>{t("Member login", "회원 로그인")}</h2>
            <p>
              {t(
                "Royalty reports are available to partners with an account issued by LENA Agency.",
                "인세보고는 레나에이전시에서 발급한 계정이 있는 파트너만 이용할 수 있습니다."
              )}
            </p>
          </div>
        </div>

        <form className="form-card login-card" onSubmit={onSubmit}>
          <div className="form-row">
            <label htmlFor="email">{t("Email", "이메일")}</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@publisher.com"
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">{t("Password", "비밀번호")}</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading
              ? t("Signing in…", "로그인 중…")
              : t("Sign in", "로그인")}
          </button>

          <p className="form-note" style={{ marginTop: 16, marginBottom: 0 }}>
            {t(
              "No public sign-up. Need access? ",
              "공개 가입은 없습니다. 계정이 필요하시면 "
            )}
            <Link href="/contact">{t("Contact us", "문의해 주세요")}</Link>
            {t(".", ".")}
          </p>
        </form>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="section">
          <div className="container">
            <p className="muted">{/* loading */}</p>
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
