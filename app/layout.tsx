import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from "next/font/google";
import "./globals.css";
import "../css/osamosam-release-ui.css";

const bodyFont = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-body"
});

const serifFont = Noto_Serif_KR({
  subsets: ["latin"],
  variable: "--font-serif"
});

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: {
    default: "오삼오삼 | 마음을 전하는 모바일 초대장",
    template: "%s | 오삼오삼"
  },
  description:
    "초대는 짧지만, 기억은 오래 남으니까. 결혼식부터 첫돌, 생일, 집들이까지 우리다운 모바일 초대장을 만들어보세요.",
  applicationName: "오삼오삼"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="ko"
      className={`${bodyFont.variable} ${serifFont.variable} ${displayFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
