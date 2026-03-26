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

  it("renders optional media and thank-you sections when provided", () => {
    const { container } = render(
      <InvitationView
        mode="public"
        payload={{
          ...defaultInvitationDraft,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          backgroundMusicUrl: "https://cdn.example.com/music.mp3",
          thankYouMessage: "함께해 주셔서 감사합니다.\n좋은 날에 다시 뵙겠습니다."
        }}
        shareUrl="https://invitehub.test/invitations/kim-lee-demo"
        slug="kim-lee-demo"
      />
    );

    expect(screen.getByRole("heading", { name: "식전 영상" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "영상 보기" })).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
    expect(screen.getByRole("heading", { name: "배경음악" })).toBeInTheDocument();
    expect(container.querySelector("audio")).toHaveAttribute("src", "https://cdn.example.com/music.mp3");
    expect(screen.getByRole("heading", { name: "감사 인사" })).toBeInTheDocument();
    expect(screen.getByText((content, node) => node?.textContent === "함께해 주셔서 감사합니다.\n좋은 날에 다시 뵙겠습니다.")).toBeInTheDocument();
  });
});
