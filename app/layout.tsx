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
  title: "InviteHub",
  description: "소중한 순간을 위한 감성 초대장 플랫폼"
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
