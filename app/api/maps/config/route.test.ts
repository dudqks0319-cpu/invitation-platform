import { GET } from "./route";

describe("GET /api/maps/config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_KAKAO_JS_KEY: "kakao-js-key",
      NEXT_PUBLIC_KAKAO_MAPS_ENABLED: "true",
      NEXT_PUBLIC_NAVER_MAPS_ENABLED: "true",
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
        configured: true,
        enabled: true,
        jsKey: "kakao-js-key",
        status: "enabled"
      },
      naver: {
        clientId: "naver-client-id",
        configured: true,
        enabled: true,
        status: "enabled"
      }
    });
  });

  it("does not treat configured keys as runtime-ready without explicit enable flags", async () => {
    process.env.NEXT_PUBLIC_KAKAO_MAPS_ENABLED = "";
    process.env.NEXT_PUBLIC_NAVER_MAPS_ENABLED = "";

    const response = await GET();
    const payload = await response.json();

    expect(payload.kakao).toMatchObject({
      configured: true,
      enabled: false,
      status: "key_configured_disabled"
    });
    expect(payload.naver).toMatchObject({
      configured: true,
      enabled: false,
      status: "key_configured_disabled"
    });
  });

  it("marks providers disabled when keys are absent", async () => {
    process.env.NEXT_PUBLIC_KAKAO_JS_KEY = "";
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID = "";

    const response = await GET();
    const payload = await response.json();

    expect(payload.kakao.enabled).toBe(false);
    expect(payload.naver.enabled).toBe(false);
    expect(payload.kakao.status).toBe("missing_key");
    expect(payload.naver.status).toBe("missing_key");
  });
});
