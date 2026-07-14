"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { createBrowserClient } from "@/lib/supabase/browser";

const navLinks = [
  { href: "/#templates", label: "디자인" },
  { href: "/#create-methods", label: "만드는 방법" },
  { href: "/#features", label: "오삼오삼 안내" },
  { href: "/dashboard", label: "내 초대장" }
];

type SiteHeaderProps = {
  mode?: "default" | "focus";
};

export function SiteHeader({ mode = "default" }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setIsAuthenticated(Boolean(data.user));
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsAuthenticated(Boolean(session?.user));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const currentPath = normalizeNextPath(pathname, authDestination.dashboard);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <header className={mode === "focus" ? "site-header site-header-focus" : "site-header"}>
      <div className="header-inner">
        {mode === "focus" ? (
          <button aria-label="이전 화면으로 돌아가기" className="focus-back-button" onClick={handleBack} type="button">
            <span aria-hidden="true">‹</span>
            뒤로
          </button>
        ) : null}
        <Link aria-label="오삼오삼 홈으로 이동" className="logo" href="/">
          <span className="logo-icon" aria-hidden="true">53</span>
          <span className="logo-text">오삼오삼</span>
        </Link>
        {mode === "focus" ? null : (
          <>
            <button
              aria-controls="site-mobile-menu"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="hamburger"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
            <nav aria-label="주요 메뉴" className="main-nav">
              {navLinks.map((link) => (
                <Link
                  aria-current={link.href === "/dashboard" && pathname.startsWith("/dashboard") ? "page" : undefined}
                  href={link.href}
                  key={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="header-actions">
              {pathname === "/sign-in" ? null : isAuthenticated ? (
                <>
                  <Link className="btn-outline" href="/dashboard">
                    내 초대장
                  </Link>
                  <button className="btn-outline" onClick={handleSignOut} type="button">
                    로그아웃
                  </button>
                </>
              ) : (
                <Link className="btn-outline" href={`/sign-in?next=${encodeURIComponent(currentPath)}`} onClick={() => setIsMenuOpen(false)}>
                  로그인
                </Link>
              )}
              <Link className="btn-primary" href="/#create-methods" onClick={() => setIsMenuOpen(false)}>
                초대장 만들기
              </Link>
            </div>
          </>
        )}
      </div>
      {mode === "focus" ? null : (
        <div
          aria-hidden={!isMenuOpen}
          className={`mobile-menu ${isMenuOpen ? "open" : ""}`}
          id="site-mobile-menu"
        >
          {navLinks.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {pathname === "/sign-in" ? null : isAuthenticated ? (
            <>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>내 초대장</Link>
              <button onClick={handleSignOut} type="button">
                로그아웃
              </button>
            </>
          ) : (
            <Link href={`/sign-in?next=${encodeURIComponent(currentPath)}`} onClick={() => setIsMenuOpen(false)}>
              로그인
            </Link>
          )}
          <Link href="/#create-methods" onClick={() => setIsMenuOpen(false)}>
            초대장 만들기
          </Link>
        </div>
      )}
    </header>
  );
}
