"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="모바일 하단 내비게이션">
      <div className="nav-items">
        <Link
          href="/"
          className={`nav-item ${pathname === "/" ? "active" : ""}`}
        >
          <span className="nav-item-icon">🏠</span>
          <span>홈</span>
        </Link>

        <Link
          href="/dashboard"
          className={`nav-item ${pathname.startsWith("/dashboard") ? "active" : ""}`}
        >
          <span className="nav-item-icon">📋</span>
          <span>내 초대장</span>
        </Link>

        <div className="nav-fab-wrap">
          <Link href="/builder" className="nav-fab" aria-label="초대장 만들기">
            +
          </Link>
        </div>

        <Link
          href="/dashboard"
          className="nav-item"
        >
          <span className="nav-item-icon">📨</span>
          <span>청첩관리</span>
        </Link>

        <Link
          href="/sign-in"
          className={`nav-item ${pathname.startsWith("/sign-in") ? "active" : ""}`}
        >
          <span className="nav-item-icon">👤</span>
          <span>마이페이지</span>
        </Link>
      </div>
    </nav>
  );
}
