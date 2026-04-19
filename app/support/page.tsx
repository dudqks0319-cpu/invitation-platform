import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";

export const metadata = {
  title: "지원 - InviteHub"
};

export default function SupportPage() {
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
            지원
          </h1>

          <div style={{ color: "#444", fontSize: "0.92rem", lineHeight: 1.8, display: "grid", gap: 24 }}>
            <p>
              InviteHub 사용 중 문제가 있으면 아래 문서를 먼저 확인해 주세요. 공개 링크, 로그인, 초대장 작성 흐름은 이 페이지에서 계속 안내합니다.
            </p>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>자주 찾는 문서</h2>
              <ul style={{ paddingLeft: 18, display: "grid", gap: 10 }}>
                <li><Link href="/faq">FAQ 보기</Link></li>
                <li><Link href="/privacy">개인정보처리방침 보기</Link></li>
                <li><Link href="/terms">이용약관 보기</Link></li>
              </ul>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>계정 및 데이터</h2>
              <p>계정 삭제와 개인정보 처리 요청은 앱의 마이페이지에서 직접 진행할 수 있습니다.</p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>현재 서비스 범위</h2>
              <p>현재 제출 버전은 무료 초대장을 로그인 없이 시작할 수 있고, 사진이 포함된 유료 발행은 앱 스토어 결제로 진행합니다.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
