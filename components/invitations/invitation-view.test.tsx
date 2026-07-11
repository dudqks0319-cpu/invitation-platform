import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";
import { InvitationView, resolveInvitationPlatformConfig } from "@/components/invitations/invitation-view";
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
    expect(document.body.textContent).toContain("네이버 지도 열기");
    expect(document.body.textContent).not.toContain("네이버 지도 API 키가 설정되면");
    expect(document.body.innerHTML).not.toContain(
      "미리보기 단계에서는 나만 볼 수 있습니다."
    );
  });

  it("renders image-first public invitations without covering the image with the old text card", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="public"
        payload={{
          ...defaultInvitationDraft,
          templateId: "image-text-overlay",
          backgroundImageUrl: "https://example.com/invitation.png"
        }}
        shareUrl="/i/demo"
        slug="demo"
      />
    );

    expect(document.body.innerHTML).toContain("invitation-public-image-hero");
    expect(document.body.innerHTML).toContain("https://example.com/invitation.png");
    expect(document.body.innerHTML).not.toContain("invitation-hero-copy");
  });

  it("keeps image invitation preview and public layouts identical", () => {
    const payload = {
      ...defaultInvitationDraft,
      templateId: "image-text-overlay",
      backgroundImageUrl: "https://example.com/invitation.png"
    };
    const previewMarkup = renderToStaticMarkup(
      <InvitationView mode="preview" payload={payload} shareUrl="/preview" />
    );
    const publicMarkup = renderToStaticMarkup(
      <InvitationView mode="public" payload={payload} shareUrl="/i/demo" slug="demo" />
    );

    for (const markup of [previewMarkup, publicMarkup]) {
      expect(markup).toContain("invitation-public-image-hero");
      expect(markup).toContain("https://example.com/invitation.png");
      expect(markup).not.toContain("invitation-hero-copy");
      expect(markup).not.toContain("invitation-content");
    }
  });

  it("renders standalone artwork templates as the primary image instead of covering them with a text card", () => {
    const markup = renderToStaticMarkup(
      <InvitationView
        mode="public"
        payload={{
          ...defaultInvitationDraft,
          templateId: "wedding-barunson-anime-01",
          templateTextPlacement: "bottom",
          title: "우리 결혼합니다",
          groomName: "김민준",
          brideName: "이서연"
        }}
        shareUrl="/i/demo"
        slug="demo"
      />
    );

    expect(markup).toContain("invitation-public-image-hero");
    expect(markup).toContain("invitation-public-image-split-copy");
    expect(markup).toContain("invitation-public-image-split-top");
    expect(markup).toContain("invitation-public-image-split-bottom");
    expect(markup).toContain("/images/custom/barunson-category-anime-2026/wedding-01.jpg");
    expect(markup).not.toContain("invitation-public-image-copy");
    expect(markup).toContain("김민준");
    expect(markup).toContain("이서연");
    expect(markup).not.toContain("invitation-hero-copy");
  });

  it("keeps template preview and public layouts on the same image text structure", () => {
    const payload = {
      ...defaultInvitationDraft,
      title: "우리 결혼합니다",
      groomName: "이준서",
      brideName: "김은재",
      venueName: "테스트 웨딩홀",
      venueAddress: "서울 강남구 테헤란로 123",
      zonecode: "06133",
      message: "소중한 날 함께해 주세요."
    };

    const previewMarkup = renderToStaticMarkup(
      <InvitationView mode="preview" payload={payload} shareUrl="/preview" />
    );
    const publicMarkup = renderToStaticMarkup(
      <InvitationView mode="public" payload={payload} shareUrl="/i/demo" slug="demo" />
    );

    for (const expectedText of [
      "이준서",
      "김은재",
      "우리 결혼합니다",
      "테스트 웨딩홀",
      "서울 강남구 테헤란로 123",
      "우편번호 06133",
      "소중한 날 함께해 주세요."
    ]) {
      expect(previewMarkup).toContain(expectedText);
      expect(publicMarkup).toContain(expectedText);
    }

    expect(previewMarkup).toContain("invitation-public-image-hero");
    expect(publicMarkup).toContain("invitation-public-image-hero");
    expect(previewMarkup).toContain("invitation-public-image-copy");
    expect(publicMarkup).toContain("invitation-public-image-copy");
    expect(previewMarkup).not.toContain("invitation-hero-copy");
    expect(publicMarkup).not.toContain("invitation-hero-copy");
  });

  it("prefers a server-provided Kakao platform key over client env lookup", () => {
    const config = resolveInvitationPlatformConfig({
      draftKakaoJsKey: "",
      platformKakaoJsKey: "server-kakao-key"
    });

    expect(config.kakaoJsKey).toBe("server-kakao-key");
  });

  it("opens Kakao sharing with the public invitation URL", async () => {
    const sendDefault = vi.fn();
    const init = vi.fn();
    window.Kakao = {
      isInitialized: () => false,
      init,
      Share: {
        sendDefault
      }
    };
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <InvitationView
          mode="public"
          payload={defaultInvitationDraft}
          platformKakaoJsKey="public-kakao-key"
          shareUrl="/i/demo"
          slug="demo"
        />
      );
    });

    const kakaoButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "카카오톡 공유"
    );

    await act(async () => {
      kakaoButton?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    await vi.waitFor(() => expect(init).toHaveBeenCalledWith("public-kakao-key"));
    expect(sendDefault).toHaveBeenCalledWith(
      expect.objectContaining({
        objectType: "text",
        link: expect.objectContaining({
          mobileWebUrl: expect.stringContaining("/i/demo"),
          webUrl: expect.stringContaining("/i/demo")
        })
      })
    );
    expect(container.textContent).toContain("카카오톡 공유창을 열었습니다.");

    await act(async () => {
      root.unmount();
    });
    delete window.Kakao;
  });
});
