import { describe, expect, it } from "vitest";
import {
  getInvitationPreviewAccessibility,
  getInvitationPreviewFocusOrder
} from "./invitation-preview-accessibility";

describe("invitation preview accessibility tree", () => {
  it("exposes one passive summary followed by two independent map buttons", () => {
    const tree = getInvitationPreviewFocusOrder(getInvitationPreviewAccessibility({
      title: "도윤이의 첫돌",
      dateTime: "2026년 9월 20일",
      venueName: "라움 패밀리홀",
      message: "가상 예시 초대 문구",
      hasKakaoTarget: true,
      hasNaverTarget: true
    }));

    expect(tree.map(({ kind, role }) => [kind, role])).toEqual([
      ["summary", "image"],
      ["kakao", "button"],
      ["naver", "button"]
    ]);
    expect(tree.filter((node) => node.role === "image")).toHaveLength(1);
    expect(tree.filter((node) => node.role === "button")).toHaveLength(2);
  });

  it("keeps each unavailable map action reachable but explicitly disabled", () => {
    const accessibility = getInvitationPreviewAccessibility({
      title: "예시",
      dateTime: "일시 미정",
      venueName: "장소 미정",
      message: "예시 문구",
      hasKakaoTarget: false,
      hasNaverTarget: false
    });

    expect(accessibility.mapButtons.kakao).toEqual({ role: "button", disabled: true });
    expect(accessibility.mapButtons.naver).toEqual({ role: "button", disabled: true });
  });
});
