import { SiteHeader } from "@/components/shared/site-header";

export const metadata = {
  title: "개인정보처리방침 - 오삼오삼"
};

export default function PrivacyPage() {
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
            개인정보처리방침
          </h1>

          <div style={{ color: "#444", fontSize: "0.92rem", lineHeight: 1.8 }}>
            <p style={{ marginBottom: 24 }}>
              오삼오삼(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 여기며,
              「개인정보 보호법」을 준수합니다. 본 방침은 서비스가 수집하는 개인정보 항목,
              이용 목적, 보유 기간과 이용자의 권리를 안내합니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              1. 수집하는 개인정보 항목
            </h2>
            <p style={{ marginBottom: 16 }}>
              회원 가입 시 이메일 주소와 소셜 로그인 프로필 정보를 수집합니다.
            </p>
            <p style={{ marginBottom: 16 }}>
              계정 삭제 요청, 문의 전달, 공개 링크 운영 과정에서 필요한 최소한의 연락 정보가
              수집될 수 있습니다.
            </p>
            <p style={{ marginBottom: 16 }}>
              RSVP 제출 시 하객 이름, 연락처(선택), 참석 여부, 동행 인원, 메모를 수집합니다.
            </p>
            <p style={{ marginBottom: 24 }}>
              방명록 작성 시 닉네임과 축하 메시지를 수집합니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              2. 개인정보 이용 목적
            </h2>
            <p style={{ marginBottom: 24 }}>
              수집한 개인정보는 초대장 생성 및 발행, 결제 처리 및 환불, RSVP 집계, 방명록
              운영, 서비스 개선 및 통계 분석 목적으로만 사용됩니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              3. 개인정보 보유 및 파기
            </h2>
            <p style={{ marginBottom: 24 }}>
              회원 탈퇴 시 서비스 계정과 연결된 개인정보는 파기합니다. 다만 법령상 보관 의무가
              있는 결제, 분쟁 대응, 보안 관련 기록은 필요한 범위에서 정해진 기간 동안 보관될 수
              있습니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              4. 개인정보의 제3자 제공
            </h2>
            <p style={{ marginBottom: 24 }}>
              서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 RSVP
              정보와 방명록 정보는 해당 초대장 소유자에게 전달됩니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              5. 이용자의 권리
            </h2>
            <p style={{ marginBottom: 24 }}>
              이용자는 언제든 자신의 개인정보에 대해 열람, 수정, 삭제, 처리정지를 요청할 수
              있습니다. 기타 요청은 아래 문의처로 연락해 주십시오.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              6. 문의처
            </h2>
            <p style={{ marginBottom: 8 }}>서비스 문의와 계정 관련 요청은 지원 페이지를 이용해 주세요.</p>
            <p style={{ marginBottom: 24 }}><a href="/support">/support</a></p>

            <p style={{ color: "#999", fontSize: "0.82rem", marginTop: 40 }}>
              본 방침은 2026년 3월 25일부터 시행됩니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
