import { SiteHeader } from "@/components/shared/site-header";

export const metadata = {
  title: "이용약관 - InviteHub"
};

export default function TermsPage() {
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
            서비스 이용약관
          </h1>

          <div style={{ color: "#444", fontSize: "0.92rem", lineHeight: 1.8 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              제1조 (목적)
            </h2>
            <p style={{ marginBottom: 24 }}>
              본 약관은 InviteHub가 제공하는 모바일 초대장 플랫폼의 이용 조건과 절차,
              서비스와 이용자의 권리 및 의무를 규정합니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              제2조 (서비스 내용)
            </h2>
            <p style={{ marginBottom: 24 }}>
              서비스는 온라인 초대장 제작, 미리보기, 발행, 하객 응답 수집, 방명록 기능을
              제공합니다. 초안 작성, 미리보기, 공개 링크 발행은 무료로 제공됩니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              제3조 (무료 제공 범위)
            </h2>
            <p style={{ marginBottom: 24 }}>
              현재 제출 버전의 서비스는 무료로 제공됩니다. 향후 유료 기능이 추가되는 경우
              앱 내 고지 및 약관 개정을 통해 별도로 안내합니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              제4조 (이용자의 의무)
            </h2>
            <p style={{ marginBottom: 24 }}>
              이용자는 타인의 권리를 침해하는 콘텐츠를 업로드해서는 안 됩니다. 불법적 또는
              부적절한 콘텐츠가 포함된 초대장은 사전 통보 없이 제한될 수 있습니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              제5조 (서비스 중단)
            </h2>
            <p style={{ marginBottom: 24 }}>
              시스템 유지보수, 장애 대응 등의 사유로 서비스가 일시 중단될 수 있습니다.
            </p>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 12px" }}>
              제6조 (면책)
            </h2>
            <p style={{ marginBottom: 24 }}>
              서비스는 이용자가 작성한 콘텐츠의 정확성 및 적법성에 대해 책임지지 않으며,
              불가항력적인 사유로 인한 장애에 대해서는 책임을 지지 않습니다.
            </p>

            <p style={{ color: "#999", fontSize: "0.82rem", marginTop: 40 }}>
              본 약관은 2026년 3월 25일부터 시행됩니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
