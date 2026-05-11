import { describe, expect, it } from "vitest";
import { getPublishMissingFields } from "./invitation-publish-readiness";

const validPublishPayload = {
  title: "민준 수아 결혼식 초대장",
  eventDateTime: "2026-05-10T14:00",
  venueName: "더파인 웨딩홀",
  venueAddress: "서울 강남구 논현로 456",
  groomName: "민준",
  brideName: "수아"
};

describe("getPublishMissingFields", () => {
  it("accepts real required publish fields", () => {
    expect(getPublishMissingFields(validPublishPayload)).toEqual([]);
  });

  it("rejects empty required publish fields", () => {
    expect(
      getPublishMissingFields({
        title: " ",
        eventDateTime: "",
        venueName: "",
        venueAddress: "",
        groomName: "",
        brideName: ""
      })
    ).toEqual([
      "초대장 제목",
      "행사 일시",
      "예식장 이름",
      "예식장 주소",
      "신랑 이름",
      "신부 이름"
    ]);
  });

  it("rejects demo placeholder values as missing publish fields", () => {
    expect(
      getPublishMissingFields({
        title: "결혼식 초대장",
        eventDateTime: "2026-04-12T14:00",
        venueName: "서울 더파인 웨딩홀",
        venueAddress: "서울 강남구 테헤란로 123",
        groomName: "홍길동",
        brideName: "김부인"
      })
    ).toEqual([
      "초대장 제목",
      "행사 일시",
      "예식장 이름",
      "예식장 주소",
      "신랑 이름",
      "신부 이름"
    ]);
  });
});
