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
  if (!errorCode) return "";
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
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
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
      options: { redirectTo: getOAuthRedirectUrl(safeNextPath) }
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
    if (mode === "signup") {
      if (password !== passwordConfirm) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
      if (!agreeTerms) {
        setError("이용약관 및 개인정보처리방침에 동의해주세요.");
        return;
      }
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

    const { data: { session } } = await supabase.auth.getSession();

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
    <div className="signin-card">
      {/* Logo */}
      <span className="signin-logo-icon">💌</span>
      <div className="signin-logo">invite</div>
      <p className="signin-tagline">소중한 순간을<br />특별한 초대장으로</p>

      {/* Mode title */}
      <p className="signin-title">
        {mode === "signin" ? "로그인" : "회원가입"}
      </p>

      {/* Email form */}
      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <input
            className="signin-input"
            type="text"
            placeholder="이름을 입력해주세요"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!isConfigured || pending}
          />
        )}
        <input
          className="signin-input"
          type="email"
          placeholder="이메일을 입력해주세요"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={!isConfigured || pending}
          required
        />
        <input
          className="signin-input"
          type="password"
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={!isConfigured || pending}
          minLength={6}
          required
        />
        {mode === "signup" && (
          <input
            className="signin-input"
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            disabled={!isConfigured || pending}
            minLength={6}
            required
          />
        )}
        {mode === "signup" && (
          <label className="signin-terms">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={!isConfigured || pending}
            />
            <span>이용약관 및 개인정보처리방침에 동의합니다.</span>
          </label>
        )}
        <button
          className="signin-btn"
          disabled={!isConfigured || pending}
          type="submit"
        >
          {pending ? "처리 중..." : mode === "signin" ? "로그인" : "회원가입"}
        </button>
      </form>

      {/* Links */}
      <div className="signin-links">
        {mode === "signin" && (
          <a href="#" onClick={(e) => e.preventDefault()}>비밀번호 찾기</a>
        )}
        <span style={{ color: "var(--border)" }}>|</span>
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
            setMessage("");
          }}
          type="button"
        >
          {mode === "signin" ? "회원가입" : "로그인으로 전환"}
        </button>
      </div>

      {/* Social */}
      <div className="signin-divider"><span>또는 소셜 계정으로 로그인</span></div>

      <div className="signin-social-row">
        <button
          className="social-circle social-naver"
          disabled={!isConfigured || pending}
          onClick={() => handleOAuth("kakao")}
          type="button"
          aria-label="네이버로 계속하기"
        >
          N
        </button>
        <button
          className="social-circle social-kakao"
          disabled={!isConfigured || pending}
          onClick={() => handleOAuth("kakao")}
          type="button"
          aria-label="카카오로 계속하기"
        >
          💬
        </button>
        <button
          className="social-circle social-google"
          disabled={!isConfigured || pending}
          onClick={() => handleOAuth("google")}
          type="button"
          aria-label="Google로 계속하기"
        >
          G
        </button>
      </div>

      {!isConfigured ? (
        <p className="form-message error" style={{ marginTop: "12px", textAlign: "center" }}>
          Supabase 환경 변수가 없어서 인증이 비활성화되었습니다.
        </p>
      ) : null}
      {message ? <p className="form-message success" style={{ marginTop: "12px", textAlign: "center" }}>{message}</p> : null}
      {error ? <p className="form-message error" style={{ marginTop: "12px", textAlign: "center" }}>{error}</p> : null}
    </div>
  );
}
