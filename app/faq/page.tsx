import { SiteHeader } from "@/components/shared/site-header";
import {
  dataRetentionPolicyItems,
  freeInvitationUsagePolicy
} from "@/lib/data-retention-policy";

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
              <p>
                템플릿 선택, 초안 작성, 미리보기, 사용자 사진 업로드, 공개 링크 발행은 무료입니다.
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>로그인 없이 사용할 수 있나요?</h2>
              <p>
                무료 작성과 발행은 로그인 없이 시작할 수 있습니다. 원격 저장과 계정 관리가 필요한 경우에만 이메일 또는 소셜 로그인을 요청합니다.
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>공개 링크는 어떻게 만드나요?</h2>
              <p>
                필수 입력을 모두 채운 뒤 발행 화면에서 무료 발행을 진행하면 공개 링크가 자동으로 생성됩니다.
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>지도는 앱 안에 바로 표시되나요?</h2>
              <p>현재 버전은 지도 타일 API를 앱 안에 직접 삽입하지 않고, 입력한 장소를 기준으로 카카오맵과 네이버지도 검색 링크를 엽니다. 그래서 API 키 없이도 길찾기 버튼을 사용할 수 있습니다.</p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>계정 삭제는 어디서 하나요?</h2>
              <p>앱의 마이페이지에서 계정 삭제를 요청할 수 있습니다. 삭제 시 초대장과 관련 데이터가 함께 제거됩니다.</p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>초대장과 사진은 얼마나 보관되나요?</h2>
              <p>
                무료 공개 링크는 {freeInvitationUsagePolicy.value}되며, 작성자가 초대장이나 계정을 삭제하면 연결된 초대장 본문,
                사진, RSVP, 방명록 데이터도 함께 삭제됩니다. 접속·보안 로그는 {dataRetentionPolicyItems.find((item) => item.label === "접속·보안 로그")?.retention}합니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
