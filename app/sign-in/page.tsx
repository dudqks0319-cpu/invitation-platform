import { redirect } from "next/navigation";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { SignInCard } from "@/components/auth/sign-in-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params.next, authDestination.dashboard);
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      redirect(nextPath);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero" style={{ minHeight: "100vh", paddingBottom: "80px" }}>
        <div className="hero-content" style={{ maxWidth: "540px", margin: "0 auto", paddingRight: 0 }}>
          <p className="hero-badge">계정으로 초대장을 관리하세요</p>
          <h1 className="hero-title">
            오삼오삼에 로그인하고
            <br />
            초대장을 이어서 완성하세요
          </h1>
          <p className="hero-subtitle">
            발행한 초대장 관리, RSVP 확인, 방명록 검토, 수정 이력을
            <br />
            한 곳에서 관리할 수 있습니다.
          </p>
          <SignInCard initialError={params.error} nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
