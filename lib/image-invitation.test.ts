import {
  generateImageInvitationCopy,
  recommendPlacementFromZones,
  recommendReadableText,
  type ImageZoneMap
} from "@/lib/image-invitation";

describe("image invitation copy generation", () => {
  it("builds wedding text from names, date, time, venue, and tone", () => {
    const copy = generateImageInvitationCopy("wedding", "formal", {
      groomName: "강우",
      brideName: "빛나",
      date: "2026년 6월 27일 토요일",
      time: "오후 1:00",
      venue: "전주 엔타워컨벤션웨딩 1층 베일리"
    });

    expect(copy.title).toBe("강우 그리고 빛나");
    expect(copy.subtitle).toBe("정중히 모십니다");
    expect(copy.body).toContain("정중히 모시고자 합니다");
    expect(copy.dateLine).toBe("2026년 6월 27일 토요일 오후 1:00");
    expect(copy.venueLine).toBe("전주 엔타워컨벤션웨딩 1층 베일리");
  });

  it("adds gathering preparation text when fee or supplies are present", () => {
    const copy = generateImageInvitationCopy("gathering", "casual", {
      gatheringName: "오삼오삼 회식",
      feeOrSupplies: "회비 3만원"
    });

    expect(copy.title).toBe("오삼오삼 회식");
    expect(copy.body).toContain("준비: 회비 3만원");
  });
});

describe("image invitation layout recommendation", () => {
  it("prefers the calmest readable zone with deterministic priority", () => {
    const zones: ImageZoneMap = {
      top: { brightness: 160, complexity: 0.44 },
      center: { brightness: 130, complexity: 0.36 },
      bottom: { brightness: 245, complexity: 0.08 },
      left: { brightness: 80, complexity: 0.26 },
      right: { brightness: 92, complexity: 0.3 }
    };

    expect(recommendPlacementFromZones(zones)).toBe("bottom");
  });

  it("uses dark text on bright backgrounds and adds correction layers for complex areas", () => {
    expect(recommendReadableText({ brightness: 232, complexity: 0.08 }, "center")).toEqual({
      color: "#222222",
      shadowEnabled: false,
      gradientEnabled: false
    });

    expect(recommendReadableText({ brightness: 96, complexity: 0.32 }, "top")).toEqual({
      color: "#FFFFFF",
      shadowEnabled: true,
      gradientEnabled: true
    });
  });
});
