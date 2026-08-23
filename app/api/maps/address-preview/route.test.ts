import { vi } from "vitest";

const { createSupabaseAdminClientMock, rpcMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  rpcMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/maps/address-preview/route";

function createRequest(address = "경기 성남시 분당구 판교역로 166", ip = "203.0.113.20") {
  return new Request("https://invitehub.test/api/maps/address-preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip
    },
    body: JSON.stringify({ address })
  });
}

describe("POST /api/maps/address-preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_ENV;
    process.env.KAKAO_REST_API_KEY = "server-only-kakao-key";
    process.env.KAKAO_MAPS_REST_ENABLED = "true";
    process.env.RATE_LIMIT_FINGERPRINT_SECRET = "test-rate-limit-fingerprint-secret-32-bytes-minimum";
    rpcMock.mockResolvedValue({
      data: [{ allowed: true, remaining: 9, reset_at: new Date(Date.now() + 60_000).toISOString() }],
      error: null
    });
    createSupabaseAdminClientMock.mockReturnValue({ rpc: rpcMock });
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/v2/local/search/address.json")) {
        return new Response(JSON.stringify({
          documents: [{
            address_name: "경기 성남시 분당구 백현동 532",
            x: "127.1086228",
            y: "37.4012191",
            road_address: { address_name: "경기 성남시 분당구 판교역로 166" }
          }]
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), {
        status: 200,
        headers: { "Content-Type": "image/png" }
      });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.KAKAO_REST_API_KEY;
    delete process.env.KAKAO_MAPS_REST_ENABLED;
  });

  it("returns a canonical road address and real Kakao static map without exposing the key", async () => {
    const response = await POST(createRequest());
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      success: true,
      canonicalAddress: "경기 성남시 분당구 판교역로 166",
      latitude: 37.4012191,
      longitude: 127.1086228
    });
    expect(result.imageDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(JSON.stringify(result)).not.toContain("server-only-kakao-key");
    const calls = vi.mocked(fetch).mock.calls;
    expect(new Headers(calls[0]?.[1]?.headers).get("Authorization")).toBe("KakaoAK server-only-kakao-key");
    expect(calls[1]?.[0].toString()).toContain("/v2/maps/staticmap");
    const bucketKeys = rpcMock.mock.calls.map(([, args]) => String(args.bucket_key));
    expect(bucketKeys).toEqual(expect.arrayContaining([
      expect.stringMatching(/^kakao_map:burst:fp1_/),
      expect.stringMatching(/^kakao_map:daily:fp1_/),
      "kakao_map:global:daily"
    ]));
    expect(bucketKeys.join(" ")).not.toContain("203.0.113.20");
  });

  it("fails closed when the provider is disabled, input is invalid, or quota is unavailable", async () => {
    process.env.KAKAO_MAPS_REST_ENABLED = "false";
    expect((await POST(createRequest())).status).toBe(503);

    process.env.KAKAO_MAPS_REST_ENABLED = "true";
    expect((await POST(createRequest("x"))).status).toBe(400);

    rpcMock.mockResolvedValue({ data: null, error: { message: "offline" } });
    expect((await POST(createRequest())).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects missing addresses and invalid provider image responses", async () => {
    expect((await POST(createRequest(" "))).status).toBe(400);

    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      if (String(input).includes("/v2/local/search/address.json")) {
        return new Response(JSON.stringify({
          documents: [{ address_name: "서울", x: "127", y: "37", road_address: null }]
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response("not an image", { status: 200, headers: { "Content-Type": "text/plain" } });
    }));
    expect((await POST(createRequest())).status).toBe(502);

    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      if (String(input).includes("/v2/local/search/address.json")) {
        return new Response(JSON.stringify({
          documents: [{ address_name: "서울", x: "127", y: "37", road_address: null }]
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response("not really a png", { status: 200, headers: { "Content-Type": "image/png" } });
    }));
    expect((await POST(createRequest())).status).toBe(502);
  });
});
