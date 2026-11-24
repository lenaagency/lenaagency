"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLang } from "@/context/LangContext";
import { localizeHref } from "@/lib/locale-path";

type Props = ComponentProps<typeof NextLink>;

/** Next link that keeps English visitors under /en. */
export default function LocaleLink({ href, ...props }: Props) {
  const { lang } = useLang();
  const localized = typeof href === "string" ? localizeHref(href, lang) : href;
  return <NextLink href={localized} {...props} />;
}
