"use client";

import Link from "next/link";
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

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    <header className="site-header">
      <div className="header-inner">
        <Link aria-label="InviteHub 홈으로 이동" className="logo" href="/">
          <span className="logo-icon">💌</span>
          <span className="logo-text">InviteHub</span>
        </Link>
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
            시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}
