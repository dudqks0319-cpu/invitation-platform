"use client";

import Link from "next/link";
import { ArrowRight, Mail, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { createBrowserClient } from "@/lib/supabase/browser";

const navLinks = [
  { href: "/#templates", label: "템플릿" },
  { href: "/builder", label: "초대장 만들기" },
  { href: "/dashboard", label: "대시보드" },
  { href: "/#pricing", label: "요금" }
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
    router.push("/");
    router.refresh();
  }

  return (
    <header className={mode === "focus" ? "site-header site-header-focus" : "site-header"}>
      <div className="header-inner">
        <Link aria-label="InviteHub 홈으로 이동" className="logo" href="/">
          <span aria-hidden="true" className="logo-icon">
            <Mail size={18} strokeWidth={2} />
          </span>
          <span className="logo-text">InviteHub</span>
        </Link>
        {mode === "focus" ? null : (
          <>
            <nav className="main-nav">
              {navLinks.map((link) => (
                <Link href={link.href} key={link.href}>
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
                <Link className="btn-outline" href={`/sign-in?next=${encodeURIComponent(currentPath)}`}>
                  로그인
                </Link>
              )}
              <Link className="btn-primary" href="/builder">
                <span>시작하기</span>
                <ArrowRight aria-hidden="true" size={16} strokeWidth={2.2} />
              </Link>
            </div>
            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="mobile-nav-toggle"
              onClick={() => setIsMenuOpen((open) => !open)}
              type="button"
            >
              {isMenuOpen ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}
            </button>
          </>
        )}
      </div>
      {mode === "default" && isMenuOpen ? (
        <nav aria-label="모바일 메뉴" className="mobile-menu open" id="mobile-navigation">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="mobile-menu-actions">
            {isAuthenticated ? (
              <Link className="btn-outline" href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                내 대시보드
              </Link>
            ) : (
              <Link
                className="btn-outline"
                href={`/sign-in?next=${encodeURIComponent(currentPath)}`}
                onClick={() => setIsMenuOpen(false)}
              >
                로그인
              </Link>
            )}
            <Link className="btn-primary" href="/builder" onClick={() => setIsMenuOpen(false)}>
              <span>시작하기</span>
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2.2} />
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
