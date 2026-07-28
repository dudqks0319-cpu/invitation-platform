import { describe, expect, it } from "vitest";
import { createInvitationShareMessage } from "./share-content";

describe("invitation sharing", () => {
  it("creates KakaoTalk-friendly text with a verified public invitation link", () => {
    expect(createInvitationShareMessage("kim-lee-demo", "서윤이의 첫돌")).toEqual({
      title: "서윤이의 첫돌",
      message:
        "서윤이의 첫돌\n초대장을 확인해 주세요.\nhttps://invitation-platform-plum.vercel.app/i/kim-lee-demo"
    });
  });

  it("uses a friendly fallback when the invitation title is blank", () => {
    expect(createInvitationShareMessage("kim-lee-demo", "  ").title).toBe("오삼오삼 초대장");
  });
});
