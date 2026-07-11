"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { createBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "signin" | "signup";
type SocialProvider = "google" | "apple" | "kakao";

function getOAuthRedirectUrl(nextPath: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const targetOrigin = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const redirectUrl = new URL("/auth/callback", targetOrigin);
  redirectUrl.searchParams.set("next", normalizeNextPath(nextPath, authDestination.dashboard));
  return redirectUrl.toString();
}

function mapErrorMessage(errorCode: string | undefined) {
  if (!errorCode) {
    return "";
  }

  switch (errorCode) {
    case "oauth_callback_failed":
      return "소셜 로그인 처리에 실패했습니다. 다시 시도해 주세요.";
    default:
      return errorCode;
  }
}

export function SignInCard({
  nextPath = authDestination.dashboard,
  initialError
}: {
  nextPath?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(() => mapErrorMessage(initialError));
  const [pending, setPending] = useState(false);

  const isConfigured = Boolean(supabase);
  const safeNextPath = normalizeNextPath(nextPath, authDestination.dashboard);

  async function handleOAuth(provider: SocialProvider) {
    if (!supabase) {
      setError("Supabase 환경 변수가 없어 로그인 기능이 비활성화되어 있습니다.");
      setMessage("");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getOAuthRedirectUrl(safeNextPath)
      }
    });

    if (oauthError) {
      setError(oauthError.message);
      setPending(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setError("Supabase 환경 변수가 없어 로그인 기능이 비활성화되어 있습니다.");
      setMessage("");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    const authCall =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error: authError } = await authCall;

    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }

    if (mode === "signin") {
      setMessage("로그인되었습니다. 이동 중입니다.");
      setPending(false);
      router.replace(safeNextPath);
      router.refresh();
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (session?.user) {
      setMessage("회원가입 및 로그인에 성공했습니다. 이동 중입니다.");
      setPending(false);
      router.replace(safeNextPath);
      router.refresh();
      return;
    }

    setMessage("계정이 생성되었습니다. 이메일 인증 설정이 있다면 메일을 확인해 주세요.");
    setPending(false);
  }

  return (
    <div className="modal-box" style={{ maxWidth: "480px", margin: "0 auto", display: "block" }}>
      <div className="modal-logo">오삼오삼</div>
      <h2 className="modal-title">
        {mode === "signin" ? "이메일 로그인" : "새 계정 만들기"}
      </h2>
      <p className="modal-hint">
        작성과 미리보기는 비회원으로 유지하고, 실제 관리와 결제 단계에서 계정을 연결합니다.
      </p>
      <button
        className="btn-google"
        disabled={!isConfigured || pending}
        onClick={() => handleOAuth("google")}
        type="button"
      >
        Google로 계속
      </button>
      <button
        className="btn-outline"
        disabled={!isConfigured || pending}
        onClick={() => handleOAuth("apple")}
        type="button"
      >
        Apple로 계속
      </button>
      <button
        className="btn-kakao"
        disabled={!isConfigured || pending}
        onClick={() => handleOAuth("kakao")}
        type="button"
      >
        Kakao로 계속
      </button>
      <div className="modal-or"><span>또는</span></div>
      <form onSubmit={handleSubmit}>
        <input
          className="modal-input"
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={!isConfigured || pending}
          required
        />
        <input
          className="modal-input"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={!isConfigured || pending}
          minLength={6}
          required
        />
        <div className="auth-mode-actions">
          <button className="btn-primary auth-mode-btn" disabled={!isConfigured || pending} type="submit">
            {pending ? "처리 중..." : mode === "signin" ? "로그인" : "회원가입"}
          </button>
          <button
            className="btn-outline auth-mode-btn"
            disabled={pending}
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setMessage("");
            }}
            type="button"
          >
            {mode === "signin" ? "회원가입으로 전환" : "로그인으로 전환"}
          </button>
        </div>
      </form>
      {!isConfigured ? (
        <p className="form-message error">
          `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 없어서 인증이 비활성화되었습니다.
        </p>
      ) : null}
      {message ? <p className="form-message success">{message}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}
    </div>
  );
}
