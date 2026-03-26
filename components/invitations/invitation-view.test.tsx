import { renderToStaticMarkup } from "react-dom/server";
import { InvitationView } from "@/components/invitations/invitation-view";
import { defaultInvitationDraft } from "@/lib/invitation-payload";

describe("InvitationView", () => {
  it("warns that preview links cannot be shared yet", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="preview"
        payload={defaultInvitationDraft}
        shareUrl="/preview"
      />
    );

    expect(document.body.textContent).toContain(
      "미리보기 단계에서는 나만 볼 수 있습니다. 하객에게 보낼 링크는 발행 후 공개 링크를 사용해 주세요."
    );
    expect(document.body.innerHTML).toContain("카카오톡 공유</button>");
    expect(document.body.innerHTML).toContain("링크 복사</button>");
    expect(document.body.innerHTML).toContain("disabled=\"\"");
  });

  it("keeps sharing enabled on a public invitation and shows moderation guidance", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="public"
        payload={defaultInvitationDraft}
        shareUrl="/invitations/demo"
        slug="demo"
      />
    );

    expect(document.body.textContent).toContain(
      "방명록은 관리자 승인 후 공개됩니다. 작성 직후 목록에 보이지 않아도 정상입니다."
    );
    expect(document.body.innerHTML).toContain("카카오톡 공유</button>");
    expect(document.body.innerHTML).not.toContain(
      "미리보기 단계에서는 나만 볼 수 있습니다."
    );
  });
});
