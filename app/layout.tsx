import type { Metadata } from "next";
import "./globals.css";

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
    <html data-scroll-behavior="smooth" lang="ko">
      <body>{children}</body>
    </html>
  );
}
