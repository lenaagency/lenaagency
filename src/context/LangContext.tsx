"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Lang } from "@/lib/types";
import { isEnglishPath, localizeHref, stripLocale } from "@/lib/locale-path";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (en: string, ko?: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const lang: Lang = isEnglishPath(pathname) ? "en" : "ko";

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lena-lang", lang);
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      const search = window.location.search
        .replace(/([?&])lang=en(?=&|$)/, "$1")
        .replace(/^\?&/, "?")
        .replace(/\?$/, "");
      const hash = window.location.hash;
      const target = localizeHref(stripLocale(pathname) + search + hash, next);
      const current = `${pathname}${window.location.search}${hash}`;
      if (target !== current) router.push(target);
    },
    [pathname, router]
  );

  const t = useCallback(
    (en: string, ko?: string) => (lang === "ko" && ko ? ko : en),
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
