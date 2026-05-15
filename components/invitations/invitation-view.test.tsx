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
    expect(document.body.innerHTML).toContain("공유하기</button>");
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
    expect(document.body.innerHTML).toContain("공유하기</button>");
    expect(document.body.innerHTML).not.toContain(
      "미리보기 단계에서는 나만 볼 수 있습니다."
    );
  });

  it("hides optional empty contact and account sections from guest-facing invitations", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="public"
        payload={{
          ...defaultInvitationDraft,
          groomPhone: "",
          bridePhone: "",
          groomBank: "",
          groomBankAccount: "",
          groomBankHolder: "",
          brideBank: "",
          brideBankAccount: "",
          brideBankHolder: "",
          kakaoPayLink: ""
        }}
        shareUrl="/invitations/demo"
        slug="demo"
      />
    );

    expect(document.body.textContent).not.toContain("연락처를 입력해 주세요.");
    expect(document.body.textContent).not.toContain("계좌 정보를 입력해 주세요.");
    expect(document.body.textContent).not.toContain("카카오페이 송금 링크가 등록되지 않았습니다.");
  });

  it("shows guest-facing account and share guidance without dead KakaoPay links", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <InvitationView
        mode="public"
        payload={{
          ...defaultInvitationDraft,
          groomBank: "카카오뱅크",
          groomBankAccount: "3333-01-1234567",
          groomBankHolder: "홍길동",
          kakaoPayLink: ""
        }}
        shareUrl="/invitations/demo"
        slug="demo"
      />
    );

    expect(document.body.textContent).toContain("이 초대장 공유하기");
    expect(document.body.innerHTML).toContain("공유하기</button>");
    expect(document.body.innerHTML).toContain("링크 복사</button>");
    expect(document.body.innerHTML).not.toContain("기본 공유</button>");
    expect(document.body.innerHTML).not.toContain("href=\"#\"");
  });

  it("confirms account copy and disables companion count when RSVP is declined", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <InvitationView
          mode="public"
          payload={{
            ...defaultInvitationDraft,
            groomBank: "카카오뱅크",
            groomBankAccount: "3333-01-1234567",
            groomBankHolder: "홍길동"
          }}
          shareUrl="/invitations/demo"
          slug="demo"
        />
      );
    });

    const accountButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("신랑측 계좌 복사")
    );
    expect(accountButton).not.toBeUndefined();

    await act(async () => {
      accountButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(writeText).toHaveBeenCalledWith("3333-01-1234567");
    expect(container.textContent).toContain("계좌번호를 복사했습니다.");

    const attendingSelect = container.querySelector('select[name="attending"]') as HTMLSelectElement | null;
    const guestsInput = container.querySelector('input[name="guests"]') as HTMLInputElement | null;

    expect(attendingSelect).not.toBeNull();
    expect(guestsInput?.disabled).toBe(false);

    await act(async () => {
      attendingSelect!.value = "no";
      attendingSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(guestsInput?.disabled).toBe(true);
    expect(guestsInput?.value).toBe("0");

    await act(async () => {
      root.unmount();
    });
  });

  it("prefers a server-provided Kakao platform key over client env lookup", () => {
    const config = resolveInvitationPlatformConfig({
      draftKakaoJsKey: "",
      platformKakaoJsKey: "server-kakao-key"
    });

    expect(config.kakaoJsKey).toBe("server-kakao-key");
  });

  it("keeps guestbook input values when the server submission fails", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "서버 설정이 완료되지 않았습니다." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    ) as typeof fetch;

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <InvitationView
          mode="public"
          payload={defaultInvitationDraft}
          shareUrl="/invitations/demo"
          slug="demo"
        />
      );
    });

    const nicknameInput = container.querySelector('input[name="nickname"]') as HTMLInputElement | null;
    const messageInput = container.querySelector('textarea[name="guestbookMessage"]') as HTMLTextAreaElement | null;
    const guestbookForm = messageInput?.closest("form");

    expect(nicknameInput).not.toBeNull();
    expect(messageInput).not.toBeNull();
    expect(guestbookForm).not.toBeNull();

    await act(async () => {
      nicknameInput!.value = "축하객";
      nicknameInput!.dispatchEvent(new Event("input", { bubbles: true }));
      messageInput!.value = "진심으로 축하드립니다";
      messageInput!.dispatchEvent(new Event("input", { bubbles: true }));
      guestbookForm!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain("서버 설정이 완료되지 않았습니다.");
    expect(nicknameInput?.value).toBe("축하객");
    expect(messageInput?.value).toBe("진심으로 축하드립니다");

    await act(async () => {
      root.unmount();
    });
    globalThis.fetch = originalFetch;
  });
});
