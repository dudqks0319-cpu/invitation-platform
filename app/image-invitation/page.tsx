import { ImageInvitationStudio } from "@/components/image-invitation/image-invitation-studio";
import { SiteHeader } from "@/components/shared/site-header";

export default function ImageInvitationPage() {
  return (
    <main className="image-invite-page">
      <SiteHeader />
      <section className="image-invite-hero">
        <div className="section-inner">
          <p className="section-kicker">오삼오삼 이미지 초대장</p>
          <h1>이미지 한 장이면 모바일 초대장이 완성됩니다</h1>
          <p>
            이미지는 사용자가 준비하고, 오삼오삼은 문구 생성과 글자 배치를 자동으로 완성합니다.
            결과물은 9:16 이미지로 바로 저장할 수 있습니다.
          </p>
        </div>
      </section>
      <section className="image-invite-section-page">
        <div className="section-inner">
          <ImageInvitationStudio />
        </div>
      </section>
    </main>
  );
}
