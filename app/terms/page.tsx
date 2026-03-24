import { SiteHeader } from "@/components/shared/site-header";

export const metadata = {
  title: "이용약관 - InviteHub"
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 16px", lineHeight: 1.8 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24 }}>이용약관</h1>
        <p style={{ color: "#888", marginBottom: 24 }}>시행일: 2026년 3월 24일</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>제1조 (목적)</h2>
        <p>본 약관은 InviteHub(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 이용자와 서비스 제공자의 권리·의무를 규정합니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>제2조 (서비스 내용)</h2>
        <p>서비스는 온라인 초대장 생성, 공유, RSVP(참석여부 확인), 방명록 기능을 제공합니다. 현재 서비스는 무료로 제공되며, 추후 유료 기능이 추가될 수 있습니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>제3조 (회원가입)</h2>
        <p>서비스 이용을 위해 Apple ID를 통한 회원가입이 필요합니다. 이용자는 정확한 정보를 제공해야 하며, 타인의 정보를 사용할 수 없습니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>제4조 (이용자의 의무)</h2>
        <p>이용자는 서비스를 법령에 위반하지 않는 범위에서 이용해야 합니다. 타인의 권리를 침해하는 콘텐츠, 허위 정보, 스팸성 초대장 생성, 서비스의 정상적인 운영을 방해하는 행위는 금지됩니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>제5조 (서비스 중단)</h2>
        <p>서비스 제공자는 시스템 유지보수, 장비 교체, 천재지변 등의 사유로 서비스를 일시 중단할 수 있습니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>제6조 (면책)</h2>
        <p>서비스 제공자는 이용자가 서비스를 이용하여 기대하는 결과를 보장하지 않으며, 이용자의 귀책사유로 인한 손해에 대해 책임지지 않습니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>제7조 (계정 삭제)</h2>
        <p>이용자는 언제든지 계정 삭제를 요청할 수 있으며, 요청 후 14일 이내에 모든 데이터가 삭제됩니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>제8조 (분쟁 해결)</h2>
        <p>서비스 이용과 관련한 분쟁은 대한민국 법률에 따르며, 관할 법원은 서비스 제공자의 주소지를 관할하는 법원으로 합니다.</p>
      </main>
    </>
  );
}
