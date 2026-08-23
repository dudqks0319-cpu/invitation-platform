import { SiteHeader } from "@/components/shared/site-header";
import { isPaidPublishingEnabled } from "@/lib/release-flags";

export const metadata = {
  title: "FAQ - 오삼오삼"
};

export default function FaqPage() {
  const paidPublishingEnabled = isPaidPublishingEnabled();

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
                {paidPublishingEnabled
                  ? "템플릿 선택, 초안 작성, 미리보기, 사진 없는 공개 링크 발행은 무료입니다. 사진이 포함된 초대장 발행은 앱 스토어 결제 화면에서 안내되는 발행권이 필요합니다."
                  : "템플릿 선택, 초안 작성, 미리보기와 대표·배경·갤러리 사진 최대 10장이 포함된 공개 링크 발행까지 무료입니다."}
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>로그인 없이 사용할 수 있나요?</h2>
              <p>
                {paidPublishingEnabled
                  ? "무료 작성과 사진 없는 무료 발행은 로그인 없이 시작할 수 있습니다. 사진 포함 발행, 원격 저장, 계정 관리가 필요한 경우에만 이메일 또는 소셜 로그인을 요청합니다."
                  : "무료 작성과 공개 링크 발행은 로그인 없이 시작할 수 있습니다. 사진 업로드 때는 자산 소유권 보호를 위한 익명 게스트 세션을 사용하며 이메일 입력은 필요하지 않습니다."}
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>공개 링크는 어떻게 만드나요?</h2>
              <p>
                {paidPublishingEnabled
                  ? "필수 입력을 모두 채운 뒤 발행 화면에서 무료 발행 또는 사진 포함 발행권 사용을 완료하면 공개 링크가 자동으로 생성됩니다."
                  : "필수 입력을 모두 채운 뒤 발행 화면에서 무료 발행을 진행하면 공개 링크가 자동으로 생성됩니다."}
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>지도는 앱 안에 바로 표시되나요?</h2>
              <p>도로명주소를 입력하고 확인 버튼을 누르면 카카오 정적 지도가 표시됩니다. 서버 지도 설정이 없거나 일시적으로 사용할 수 없어도 카카오맵과 네이버지도 외부 길찾기 링크는 계속 사용할 수 있습니다.</p>
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
