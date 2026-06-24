import {
  dataRetentionPolicyItems,
  freeInvitationUsagePolicy,
  retentionPolicyNotice
} from "@/lib/data-retention-policy";

describe("data retention policy", () => {
  it("defines free usage and retention rules for launch surfaces", () => {
    expect(freeInvitationUsagePolicy.value).toBe("별도 만료일 없이 제공");
    expect(dataRetentionPolicyItems.map((item) => item.label)).toEqual([
      "초대장 본문과 공개 링크",
      "업로드 사진과 갤러리 이미지",
      "RSVP 응답",
      "방명록과 신고 내역",
      "접속·보안 로그",
      "고객지원 요청"
    ]);
    expect(dataRetentionPolicyItems.find((item) => item.label === "접속·보안 로그")?.retention).toContain("최대 90일");
    expect(retentionPolicyNotice).toContain("법령상 보관 의무");
  });
});
