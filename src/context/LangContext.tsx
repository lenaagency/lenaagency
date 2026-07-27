"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "@/lib/types";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (en: string, ko?: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lena-lang");
    if (saved === "en" || saved === "ko") setLangState(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang;
    localStorage.setItem("lena-lang", lang);
  }, [lang, ready]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

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
