import { SiteHeader } from "@/components/shared/site-header";

export const metadata = {
  title: "개인정보처리방침 - InviteHub"
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 16px", lineHeight: 1.8 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24 }}>개인정보처리방침</h1>
        <p style={{ color: "#888", marginBottom: 24 }}>시행일: 2026년 3월 24일</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. 수집하는 개인정보</h2>
        <p>InviteHub(이하 &quot;서비스&quot;)는 다음과 같은 개인정보를 수집합니다.</p>
        <p><strong>필수 수집 항목:</strong> Apple ID 이메일, 이름(Apple Sign-In 제공 시)</p>
        <p><strong>자동 수집 항목:</strong> 접속 IP 주소(해시 처리), 브라우저/기기 정보(User-Agent), 서비스 이용 기록</p>
        <p><strong>사용자 입력 항목:</strong> 초대장 내용(행사 정보, 사진, 연락처, 계좌 정보), RSVP 응답(이름, 연락처, 참석여부), 방명록(닉네임, 메시지)</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. 수집 목적</h2>
        <p>수집된 개인정보는 서비스 제공(초대장 생성, 공유, RSVP 관리), 회원 식별 및 인증, 서비스 개선 및 통계 분석, 악용 방지(스팸, 도배 차단)를 위해 사용됩니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. 보유 기간</h2>
        <p>회원 탈퇴 시 개인정보는 14일 이내에 파기됩니다. 초대장 데이터는 생성자의 요청에 따라 즉시 삭제할 수 있습니다. IP 해시 정보는 차단 해제 시 삭제됩니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. 제3자 제공</h2>
        <p>서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 요청이 있는 경우 예외로 합니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>5. 위탁 처리</h2>
        <p>서비스 운영을 위해 다음 외부 서비스를 이용합니다: Supabase(데이터베이스, 인증, 파일 저장), Vercel(웹 호스팅), Upstash(요청 제한 관리).</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>6. 이용자의 권리</h2>
        <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 계정 삭제를 요청할 수 있습니다. 앱 설정 &gt; 계정 삭제 요청 또는 이메일(support@invitehub.co.kr)로 요청할 수 있습니다.</p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 32, marginBottom: 12 }}>7. 연락처</h2>
        <p>개인정보 관련 문의: support@invitehub.co.kr</p>
      </main>
    </>
  );
}
