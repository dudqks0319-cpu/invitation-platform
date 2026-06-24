import { renderToStaticMarkup } from "react-dom/server";
import { InvitationView, resolveInvitationPlatformConfig } from "@/components/invitations/invitation-view";
import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";

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
    expect(document.body.textContent).not.toContain("QR 코드");
    expect(document.body.innerHTML).toContain("카카오 지도");
    expect(document.body.innerHTML).toContain("네이버 지도");
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
    expect(document.body.textContent).toContain("카카오톡 공유창으로 공개 초대장 링크를 바로 보낼 수 있습니다.");
    expect(document.body.textContent).toContain("QR 코드");
    expect(document.body.innerHTML).toContain("/api/qr/demo");
    expect(document.body.innerHTML).toContain("download=\"demo-qr.png\"");
    expect(document.body.textContent).toContain("캘린더 추가");
    expect(document.body.innerHTML).toContain("https://calendar.google.com/calendar/render?");
    expect(document.body.innerHTML).toContain("/api/calendar/demo");
    expect(document.body.innerHTML).toContain("download=\"demo.ics\"");
    expect(document.body.textContent).toContain("네이버 지도 API 키가 설정되면 이 영역에 지도가 표시됩니다.");
    expect(document.body.textContent).toContain("신고하기");
    expect(document.body.textContent).toContain("부적절한 내용, 개인정보 노출, 저작권 문제가 있으면 운영자에게 알려 주세요.");
    expect(document.body.innerHTML).not.toContain(
      "미리보기 단계에서는 나만 볼 수 있습니다."
    );
  });

  it("does not expose the public report form in preview mode", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="preview"
        payload={defaultInvitationDraft}
        shareUrl="/preview"
      />
    );

    expect(document.body.textContent).not.toContain("신고하기");
  });

  it("hides public sections that are disabled by section policy", () => {
    const payload = normalizeDraft({
      groomPhone: "010-1111-2222",
      groomBank: "국민은행",
      groomBankHolder: "홍길동",
      groomBankAccount: "123-456",
      sections: {
        contact: false,
        accounts: false,
        venue: false,
        calendar: false,
        rsvp: false,
        guestbook: false
      }
    });

    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="public"
        payload={payload}
        shareUrl="/invitations/demo"
        slug="demo"
      />
    );

    expect(document.body.textContent).not.toContain("연락처");
    expect(document.body.textContent).not.toContain("010-1111-2222");
    expect(document.body.textContent).not.toContain("마음 전하실 곳");
    expect(document.body.textContent).not.toContain("국민은행");
    expect(document.body.textContent).not.toContain("위치");
    expect(document.body.textContent).not.toContain("캘린더 추가");
    expect(document.body.textContent).not.toContain("RSVP");
    expect(document.body.textContent).not.toContain("방명록");
  });

  it("renders public sections in the saved section order", () => {
    const payload = normalizeDraft({
      sectionOrder: ["guestbook", "rsvp", "venue", "people", "contact", "accounts", "calendar"]
    });

    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="public"
        payload={payload}
        shareUrl="/invitations/demo"
        slug="demo"
      />
    );

    const headings = Array.from(document.body.querySelectorAll(".invitation-content > article > h2"))
      .map((heading) => heading.textContent);

    expect(headings.slice(0, 7)).toEqual([
      "방명록",
      "RSVP",
      "위치",
      "혼주 정보",
      "연락처",
      "마음 전하실 곳",
      "캘린더 추가"
    ]);
  });

  it("renders the published template snapshot background when present", () => {
    const payload = normalizeDraft({
      templateId: "wedding-classic",
      templateSnapshot: {
        templateAssetId: "published-template",
        templateAssetVersion: 4,
        backgroundImageUrl: "/images/custom/wedding/wedding-02.jpeg",
        canvas: { width: 1080, height: 1920 },
        safeAreas: {},
        photoSlots: [],
        palette: {},
        typography: {}
      }
    });

    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="public"
        payload={payload}
        shareUrl="/invitations/demo"
        slug="demo"
      />
    );

    expect(document.body.innerHTML).toContain("/images/custom/wedding/wedding-02.jpeg");
  });

  it("prefers a server-provided Kakao platform key over client env lookup", () => {
    const config = resolveInvitationPlatformConfig({
      draftKakaoJsKey: "",
      platformKakaoJsKey: "server-kakao-key"
    });

    expect(config.kakaoJsKey).toBe("server-kakao-key");
  });
});
