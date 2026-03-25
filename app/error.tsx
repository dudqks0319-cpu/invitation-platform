"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="app-shell">
      <section
        className="hero"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480, padding: "0 20px" }}>
          <p style={{ fontSize: "3rem", marginBottom: 16 }}>😢</p>
          <h1
            style={{
              fontFamily: "var(--font-serif, 'Noto Serif KR', serif)",
              fontSize: "1.6rem",
              marginBottom: 12
            }}
          >
            앗, 문제가 발생했어요
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              marginBottom: 28
            }}
          >
            일시적인 오류입니다. 잠시 후 다시 시도해 주세요.
            <br />
            문제가 계속되면 새로고침하거나 홈으로 돌아가 주세요.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-primary" onClick={reset} type="button">
              다시 시도
            </button>
            <Link className="btn-outline" href="/">
              홈으로
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
