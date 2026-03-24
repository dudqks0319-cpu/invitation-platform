import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-shell">
      <section className="hero" style={{ minHeight: "100vh", justifyContent: "center" }}>
        <div className="hero-content" style={{ maxWidth: "520px", paddingRight: 0, textAlign: "center" }}>
          <p className="hero-badge">404</p>
          <h1 className="hero-title">
            찾으시는 초대장이
            <br />
            존재하지 않습니다
          </h1>
          <p className="hero-subtitle">
            링크가 만료되었거나 아직 발행되지 않은 초대장일 수 있습니다.
          </p>
          <div className="hero-btns" style={{ justifyContent: "center" }}>
            <Link className="btn-hero-primary" href="/">
              홈으로 이동
            </Link>
            <Link className="btn-hero-outline" href="/builder">
              새 초대장 만들기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
