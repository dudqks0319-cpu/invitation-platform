import { render, screen } from "@testing-library/react";
import { InvitationView } from "@/components/invitations/invitation-view";
import { defaultInvitationDraft } from "@/lib/invitation-payload";

describe("InvitationView", () => {
  it("renders non-wedding invitations without wedding-only copy", () => {
    render(
      <InvitationView
        mode="public"
        payload={{
          ...defaultInvitationDraft,
          category: "dol",
          templateId: "dol-cute",
          title: "하린이의 첫돌 초대장",
          groomName: "하린",
          brideName: "",
          groomFatherName: "이준호",
          groomMotherName: "김소연",
          groomPhone: "010-1111-2222",
          bridePhone: ""
        }}
        shareUrl="https://invitehub.test/invitations/harin-first-birthday"
        slug="harin-first-birthday"
      />
    );

    expect(screen.getByRole("heading", { name: "하린이의 첫돌 초대장" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "아이 · 가족 정보" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "보호자 연락처" })).toBeInTheDocument();
    expect(screen.queryByText("혼주 정보")).not.toBeInTheDocument();
    expect(screen.queryByText("신랑측 계좌 복사")).not.toBeInTheDocument();
    expect(screen.queryByText(/신랑/)).not.toBeInTheDocument();
  });
});
