"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { createBrowserClient } from "@/lib/supabase/browser";

const navLinks = [
  { href: "/#templates", label: "템플릿" },
  { href: "/builder", label: "초대장 만들기" },
  { href: "/dashboard", label: "대시보드" }
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

  return (
    <header className={mode === "focus" ? "site-header site-header-focus" : "site-header"}>
      <div className="header-inner">
        <Link aria-label="InviteHub 홈으로 이동" className="logo" href="/">
          <span className="logo-icon">💌</span>
          <span className="logo-text">InviteHub</span>
        </Link>
        {mode === "focus" ? null : (
          <>
            <button
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="hamburger"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
            <nav className="main-nav">
              {navLinks.map((link) => (
                <Link href={link.href} key={link.href} onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="header-actions">
              {pathname === "/sign-in" ? null : isAuthenticated ? (
                <>
                  <Link className="btn-outline" href="/dashboard">
                    내 대시보드
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
              <Link className="btn-primary" href="/builder" onClick={() => setIsMenuOpen(false)}>
                시작하기
              </Link>
            </div>
          </>
        )}
      </div>
      {mode === "focus" ? null : (
        <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
          {navLinks.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {pathname === "/sign-in" ? null : isAuthenticated ? (
            <>
              <Link href="/dashboard">내 대시보드</Link>
              <button onClick={handleSignOut} type="button">
                로그아웃
              </button>
            </>
          ) : (
            <Link href={`/sign-in?next=${encodeURIComponent(currentPath)}`} onClick={() => setIsMenuOpen(false)}>
              로그인
            </Link>
          )}
          <Link href="/builder" onClick={() => setIsMenuOpen(false)}>
            시작하기
          </Link>
        </div>
      )}
    </header>
  );
}
