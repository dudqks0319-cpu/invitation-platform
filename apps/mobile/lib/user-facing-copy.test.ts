import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getMapApiStatusLabel } from "./map-api-config";

const mobileRoot = path.resolve(__dirname, "..");
const userFacingFiles = [
  "app/(tabs)/my-invitations.tsx",
  "app/(tabs)/mypage.tsx",
  "app/builder/preview.tsx",
  "app/invitation/[id]/index.tsx",
  "app/login.tsx",
  "hooks/useAuth.ts"
];

describe("user-facing mobile copy", () => {
  it.each(userFacingFiles)("%s does not expose internal configuration language", (relativePath) => {
    const source = readFileSync(path.join(mobileRoot, relativePath), "utf8");

    expect(source).not.toMatch(
      /EXPO_PUBLIC_|Supabase 설정|Supabase 환경 변수|누락된 환경변수|원격 기능 안내|로컬 프리뷰 모드|현재 세션|세션 확인 중|지도 API/
    );
  });

  it("describes map availability without developer configuration language", () => {
    const labels = [
      getMapApiStatusLabel(null),
      getMapApiStatusLabel({ kakao: { enabled: true }, naver: { enabled: true } }),
      getMapApiStatusLabel({ kakao: { enabled: true }, naver: { enabled: false } }),
      getMapApiStatusLabel({ kakao: { enabled: false }, naver: { enabled: true } }),
      getMapApiStatusLabel({ kakao: { enabled: false }, naver: { enabled: false } })
    ];

    expect(labels.join(" ")).not.toContain("API");
  });
});
