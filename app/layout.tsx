import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from "next/font/google";
import "./globals.css";

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
    default: "오삼오삼 | 쉽고 빠른 모바일 초대장",
    template: "%s | 오삼오삼"
  },
  description: "사진과 문구만 바꾸면 완성되는 모바일 초대장. 무료로 만들고 링크로 간편하게 공유하세요.",
  applicationName: "오삼오삼"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${bodyFont.variable} ${serifFont.variable} ${displayFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
