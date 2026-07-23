import { describe, expect, it } from "vitest";
import {
  getInvitationPreviewAccessibility,
  getInvitationPreviewDetails,
  getInvitationPreviewFocusOrder
} from "./invitation-preview-accessibility";

const completeDetails = getInvitationPreviewDetails({
  title: "도윤이의 첫돌",
  dateTime: "2026년 9월 20일",
  venueName: "라움 패밀리홀",
  venueAddress: "서울시 예시구 초대길 53",
  message: "가상 예시 초대 문구",
  transportNote: "지하철 3번 출구"
});

describe("invitation preview accessibility tree", () => {
  it("exposes one passive summary followed by two independent map buttons", () => {
    const tree = getInvitationPreviewFocusOrder(getInvitationPreviewAccessibility({
      details: completeDetails,
      hasKakaoTarget: true,
      hasNaverTarget: true
    }));

    expect(tree.map(({ kind, role }) => [kind, role])).toEqual([
      ["summary", "text"],
      ["kakao", "button"],
      ["naver", "button"]
    ]);
    expect(tree.filter((node) => node.role === "text")).toHaveLength(1);
    expect(tree.filter((node) => node.role === "button")).toHaveLength(2);
  });

  it("keeps each unavailable map action reachable but explicitly disabled", () => {
    const accessibility = getInvitationPreviewAccessibility({
      details: completeDetails,
      hasKakaoTarget: false,
      hasNaverTarget: false
    });

    expect(accessibility.mapButtons.kakao).toEqual({ role: "button", disabled: true });
    expect(accessibility.mapButtons.naver).toEqual({ role: "button", disabled: true });
  });

  it("keeps complete wrapping details, including address and optional transport, outside artwork", () => {
    expect(completeDetails.map(({ key }) => key)).toEqual([
      "title",
      "dateTime",
      "venueName",
      "venueAddress",
      "message",
      "transportNote"
    ]);
    const accessibility = getInvitationPreviewAccessibility({
      details: completeDetails,
      hasKakaoTarget: true,
      hasNaverTarget: true
    });
    expect(accessibility.summary.label).toContain("주소 서울시 예시구 초대길 53");
    expect(accessibility.summary.label).toContain("교통 안내 지하철 3번 출구");
  });
});
