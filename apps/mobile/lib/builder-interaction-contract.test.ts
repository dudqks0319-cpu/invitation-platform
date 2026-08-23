import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const mobileRoot = join(process.cwd(), "apps/mobile");
const read = (path: string) => readFileSync(join(mobileRoot, path), "utf8");

describe("mobile builder interaction contract", () => {
  it("keeps photo controls available while paid publishing remains off", () => {
    const source = read("app/builder/step3-photos.tsx");

    expect(source).not.toContain("사진 포함 발행 준비 중");
    expect(source).not.toContain("if (!paidPublishingEnabled)");
    expect(source).toContain("MAX_FREE_GALLERY_PHOTOS");
    expect(source).toContain('accessibilityLabel="메인 사진 선택"');
    expect(source).toContain('accessibilityLabel="배경 사진 선택"');
    expect(source).toContain('accessibilityLabel="갤러리 사진 추가"');
  });

  it("renders a real Kakao map result after an explicit address lookup", () => {
    const source = read("app/builder/step5-location.tsx");

    expect(source).toContain("fetchKakaoAddressPreview");
    expect(source).toContain('accessibilityLabel="카카오에서 도로명주소 확인"');
    expect(source).toContain("mapPreview.imageDataUrl");
    expect(source).toContain("accessibilityLiveRegion");
  });

  it("never makes publish and draft buttons inert only because auth is loading", () => {
    const source = read("app/builder/preview.tsx");

    expect(source).not.toContain('onPress={remoteAccessMode === "loading" ? undefined');
    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).toContain("발행 요청을 확인하는 중입니다.");
  });

  it("keeps every preview action bound to a handler with a clear accessibility label", () => {
    const source = read("app/builder/preview.tsx");

    const contracts = [
      ['accessibilityLabel="공개 링크 발행"', 'handleSave("published")'],
      ['accessibilityLabel="서버에 초안 저장"', 'handleSave("draft")'],
      ['accessibilityLabel="공유 시트 열기"', "handleShare()"],
      ['accessibilityLabel="공개 페이지 열기"', "openInvitationPublicPage"],
      ['accessibilityLabel="운영 화면 예시로 이동"', 'pathname: "/invitation/[id]"']
    ];

    for (const [label, handler] of contracts) {
      expect(source).toContain(label);
      expect(source).toContain(handler);
    }
  });

  it("keeps both external map fallbacks wired when the embedded preview is unavailable", () => {
    const source = read("app/builder/step5-location.tsx");

    expect(source).toContain('accessibilityLabel="카카오 지도 열기"');
    expect(source).toContain('accessibilityLabel="네이버 지도 열기"');
    expect(source).toContain("openMapUrl(mapLinks.kakaoUrl, mapLinks.kakaoFallbackUrl)");
    expect(source).toContain("openMapUrl(mapLinks.naverUrl, mapLinks.naverFallbackUrl)");
  });

  it("keeps every builder step linked forward and backward with labeled controls", () => {
    const contracts: Array<[string, string[]]> = [
      ["app/builder/step1-basic.tsx", ["/builder/step2-people", "다음 단계로 이동"]],
      ["app/builder/step2-people.tsx", ["/builder/step1-basic", "/builder/step3-photos", "이전 단계로 이동", "다음 단계로 이동"]],
      ["app/builder/step3-photos.tsx", ["/builder/step2-people", "/builder/step4-accounts"]],
      ["app/builder/step4-accounts.tsx", ["/builder/step3-photos", "/builder/step5-location"]],
      ["app/builder/step5-location.tsx", ["/builder/step4-accounts", "/builder/preview"]]
    ];

    for (const [path, snippets] of contracts) {
      const source = read(path);
      for (const snippet of snippets) expect(source).toContain(snippet);
    }
  });
});
