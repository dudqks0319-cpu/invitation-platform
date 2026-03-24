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
    default: "InviteHub — 한국 결혼 초대장 플랫폼",
    template: "%s | InviteHub"
  },
  description: "양가 정보, 축의금 계좌, 네이버 지도, RSVP, 방명록까지. 한국 결혼식에 맞춘 디지털 초대장.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://invitehub.co.kr"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "InviteHub"
  }
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
