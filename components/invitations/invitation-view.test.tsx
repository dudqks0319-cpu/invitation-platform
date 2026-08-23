import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";
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
    expect(document.body.textContent).toContain("인스타 이미지");
    expect(document.body.textContent).toContain("A4 포스터");
    expect(document.body.innerHTML).toContain("/api/share/instagram/demo");
    expect(document.body.innerHTML).toContain("/api/share/a4/demo");
    expect(document.body.innerHTML).toContain("download=\"demo-instagram.png\"");
    expect(document.body.innerHTML).toContain("download=\"demo-a4.png\"");
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

  it("confirms account copy without putting the account number in the message", async () => {
    const payload = normalizeDraft({
      groomBank: "국민은행",
      groomBankHolder: "홍길동",
      groomBankAccount: "123-456-7890"
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    document.body.innerHTML = "";
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <InvitationView
          mode="public"
          payload={payload}
          shareUrl="/invitations/demo"
          slug="demo"
        />
      );
    });

    const copyButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "신랑측 계좌 복사"
    );
    expect(copyButton).toBeTruthy();

    await act(async () => {
      copyButton?.click();
    });

    const copyMessage = Array.from(container.querySelectorAll(".form-message.success")).find(
      (message) => message.textContent?.includes("신랑측 계좌를 복사했습니다.")
    );

    expect(writeText).toHaveBeenCalledWith("123-456-7890");
    expect(copyMessage?.textContent).toBe("신랑측 계좌를 복사했습니다.");
    expect(copyMessage?.textContent).not.toContain("123-456-7890");

    await act(async () => {
      root.unmount();
    });
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

  it("places the main image inside a published template photo slot", () => {
    const payload = normalizeDraft({
      mainImageUrl: "https://example.com/main.jpg",
      templateId: "wedding-classic",
      templateSnapshot: {
        templateAssetId: "published-template",
        templateAssetVersion: 4,
        backgroundImageUrl: "/images/custom/wedding/wedding-02.jpeg",
        canvas: { width: 1080, height: 1920 },
        safeAreas: {},
        photoSlots: [
          {
            key: "main",
            shape: "roundedRect",
            x: 0.18,
            y: 0.08,
            w: 0.64,
            h: 0.24,
            radius: 0.04,
            zIndex: 1,
            required: false
          }
        ],
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

    const slotImage = document.querySelector(".template-photo-slot img");
    expect(slotImage?.getAttribute("src")).toBe("https://example.com/main.jpg");
    expect(slotImage?.getAttribute("alt")).toBe("초대장 사진 슬롯 main");
    expect(document.querySelector(".invitation-hero.has-photo-slots")).not.toBeNull();
    expect(document.querySelector(".invitation-main-image-wrap")).toBeNull();
  });

  it("resolves stored slot asset paths through the public asset proxy", () => {
    const payload = normalizeDraft({
      mainImageUrl: "https://example.com/main.jpg",
      photoPlacements: [
        {
          slotKey: "main",
          assetPath: "user-1/slot.webp",
          crop: { x: 0.25, y: 0.4, scale: 1.1 },
          fit: "cover"
        }
      ],
      templateId: "wedding-classic",
      templateSnapshot: {
        templateAssetId: "published-template",
        templateAssetVersion: 4,
        backgroundImageUrl: "/images/custom/wedding/wedding-02.jpeg",
        canvas: { width: 1080, height: 1920 },
        safeAreas: {},
        photoSlots: [
          {
            key: "main",
            shape: "roundedRect",
            x: 0.18,
            y: 0.08,
            w: 0.64,
            h: 0.24,
            radius: 0.04,
            zIndex: 1,
            required: false
          }
        ],
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

    expect(document.querySelector(".template-photo-slot img")?.getAttribute("src")).toBe(
      "/api/public/assets?slug=demo&path=user-1%2Fslot.webp"
    );
  });

  it("prefers a server-provided Kakao platform key over client env lookup", () => {
    const config = resolveInvitationPlatformConfig({
      draftKakaoJsKey: "",
      platformKakaoJsKey: "server-kakao-key"
    });

    expect(config.kakaoJsKey).toBe("server-kakao-key");
  });
});
