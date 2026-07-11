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
  title: "오삼오삼",
  description: "이미지에 글자를 얹어 만드는 무료 모바일 초대장"
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
