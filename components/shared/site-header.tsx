"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { createBrowserClient } from "@/lib/supabase/browser";

const navLinks = [
  { href: "/#templates", label: "템플릿" },
  { href: "/#how-it-works", label: "만드는 방법" },
  { href: "/#features", label: "기능" },
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
    setIsMenuOpen(false);
  }, [pathname]);

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
  const isPublicInvitation = pathname.startsWith("/invitations/") || pathname.startsWith("/i/");

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

  const logo = (
    <Link aria-label="오삼오삼 홈으로 이동" className="logo" href="/">
      <span aria-hidden="true" className="brand-mark">
        53
      </span>
      <span className="logo-text">오삼오삼</span>
    </Link>
  );

  if (mode === "focus") {
    return (
      <header className="site-header site-header-focus">
        <div className="header-inner">
          <Link className="focus-back" href={isPublicInvitation ? "/" : "/#templates"}>
            <ChevronLeft aria-hidden="true" size={18} />
            {isPublicInvitation ? "홈" : "템플릿"}
          </Link>
          {logo}
          <p className="focus-header-hint">
            {isPublicInvitation ? "모바일 초대장" : "작성 내용은 이 기기에 임시 저장돼요"}
          </p>
        </div>
      </header>
    );
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        {logo}
        <button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="hamburger"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
        <nav aria-label="주요 메뉴" className="main-nav">
          {navLinks.map((link) => (
            <Link
              aria-current={link.href === "/dashboard" && pathname.startsWith("/dashboard") ? "page" : undefined}
              href={link.href}
              key={link.href}
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
            <Link className="header-login" href={`/sign-in?next=${encodeURIComponent(currentPath)}`}>
              로그인
            </Link>
          )}
          <Link className="btn-primary header-start" href="/builder">
            무료로 만들기
          </Link>
        </div>
      </div>
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
        {pathname === "/sign-in" ? null : isAuthenticated ? (
          <>
            <Link href="/dashboard">내 초대장</Link>
            <button onClick={handleSignOut} type="button">
              로그아웃
            </button>
          </>
        ) : (
          <Link href={`/sign-in?next=${encodeURIComponent(currentPath)}`}>로그인</Link>
        )}
        <Link className="mobile-menu-primary" href="/builder">
          무료로 만들기
        </Link>
      </div>
    </header>
  );
}
