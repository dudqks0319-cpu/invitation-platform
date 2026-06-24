import { describe, expect, it } from "vitest";
import { checkPublicGuestbookContent } from "@/lib/public-content-policy";

describe("public content policy", () => {
  it("allows normal guestbook congratulations", () => {
    expect(checkPublicGuestbookContent({
      nickname: "친구",
      message: "결혼 진심으로 축하해요"
    })).toEqual({
      ok: true
    });
  });

  it("blocks inappropriate guestbook language even when spaced out", () => {
    expect(checkPublicGuestbookContent({
      nickname: "방문자",
      message: "시 발"
    })).toEqual({
      ok: false,
      message: "운영 정책상 등록할 수 없는 표현이 포함되어 있습니다."
    });
  });
});
