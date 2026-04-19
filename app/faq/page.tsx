import { SiteHeader } from "@/components/shared/site-header";

export const metadata = {
  title: "FAQ - InviteHub"
};

export default function FaqPage() {
  return (
    <main className="app-shell">
      <SiteHeader />
      <div className="app-page-offset">
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "100px 20px 80px" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif), 'Noto Serif KR', serif",
              fontSize: "1.8rem",
              marginBottom: 32
            }}
          >
            FAQ
          </h1>

          <div style={{ color: "#444", fontSize: "0.92rem", lineHeight: 1.8, display: "grid", gap: 24 }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>초대장은 무료인가요?</h2>
              <p>현재 제출 버전에서는 초대장 작성, 미리보기, 공개 링크 발행을 모두 무료로 제공합니다.</p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>로그인 없이 사용할 수 있나요?</h2>
              <p>무료 작성과 무료 발행은 로그인 없이 시작할 수 있습니다. 유료 발행과 계정 관리가 필요한 경우에만 이메일 또는 소셜 로그인을 요청합니다.</p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>공개 링크는 어떻게 만드나요?</h2>
              <p>필수 입력을 모두 채운 뒤 발행 화면에서 무료 발행을 완료하면 공개 링크가 자동으로 생성됩니다.</p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>계정 삭제는 어디서 하나요?</h2>
              <p>앱의 마이페이지에서 계정 삭제를 요청할 수 있습니다. 삭제 시 초대장과 관련 데이터가 함께 제거됩니다.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
