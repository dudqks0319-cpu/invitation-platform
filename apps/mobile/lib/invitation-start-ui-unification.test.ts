import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readMobileSource = (path: string) =>
  readFileSync(join(process.cwd(), "apps/mobile", path), "utf8");

describe("홈과 초대장 제작 과정의 시작 화면", () => {
  it("두 진입 경로가 동일한 행사 선택 화면을 재사용한다", () => {
    const homeSource = readMobileSource("components/home/HeroSection.tsx");
    const processSource = readMobileSource("app/uiux-preview.tsx");

    expect(homeSource).toContain("<InvitationStartSection");
    expect(processSource).toContain("<InvitationStartSection");
  });

  it("공통 화면에서 청첩장을 포함한 선택 UI와 다음 동작을 제공한다", () => {
    const sharedSource = readMobileSource("components/home/InvitationStartSection.tsx");

    expect(sharedSource).toContain("uiuxEventOptions.map");
    expect(sharedSource).toContain("onSelectEvent(entry.key)");
    expect(sharedSource).toContain("onContinue(selectedEventKey)");
    expect(sharedSource).toContain("추천 디자인 보기");
  });
});
