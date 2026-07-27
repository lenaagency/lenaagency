import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { LangProvider } from "@/context/LangContext";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LENA Agency · 레나에이전시",
    template: "%s · LENA Agency",
  },
  description:
    "레나에이전시 / LENA Agency — 국경을 넘는 파트너십. 탁월한 아이디어를 세계에 전합니다.",
  openGraph: {
    title: "LENA Agency · 레나에이전시",
    description: "Partnerships beyond borders. Outstanding ideas to the world.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "LENA Agency",
    statusBarStyle: "default",
  },
};

/** Explicit mobile viewport (safe-area friendly) */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>
        <AuthSessionProvider>
          <LangProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </LangProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
