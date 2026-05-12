import { renderToStaticMarkup } from "react-dom/server";
import { PublishRecoveryPanel } from "@/components/payments/publish-recovery-panel";

describe("PublishRecoveryPanel", () => {
  it("uses the same share-first CTA pattern after recovery is complete", () => {
    const markup = renderToStaticMarkup(
      <PublishRecoveryPanel
        invitationId="inv-1"
        missingFields={[]}
        slug="paid-invite"
        status="published"
        title="민준 수아 결혼식 초대장"
      />
    );

    expect(markup).toContain("공개 링크가 준비됐습니다");
    expect(markup).toContain("카카오톡, 문자, SNS로 초대장을 보낼 수 있습니다.");
    expect(markup).toContain("공유하기");
    expect(markup).toContain("링크 복사");
    expect(markup).toContain("실제 화면 보기");
    expect(markup).toContain("RSVP 운영");
  });
});
