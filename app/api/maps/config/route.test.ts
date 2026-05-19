import { GET } from "./route";

describe("GET /api/maps/config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_KAKAO_JS_KEY: "kakao-js-key",
      NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: "naver-client-id"
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns public map SDK configuration", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(payload).toEqual({
      kakao: {
        enabled: true,
        jsKey: "kakao-js-key"
      },
      naver: {
        clientId: "naver-client-id",
        enabled: true
      }
    });
  });

  it("marks providers disabled when keys are absent", async () => {
    process.env.NEXT_PUBLIC_KAKAO_JS_KEY = "";
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID = "";

    const response = await GET();
    const payload = await response.json();

    expect(payload.kakao.enabled).toBe(false);
    expect(payload.naver.enabled).toBe(false);
  });
});
