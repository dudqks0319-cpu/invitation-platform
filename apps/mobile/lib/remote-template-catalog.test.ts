import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("expo/fetch", () => ({ fetch: globalThis.fetch }));

import {
  MOBILE_TEMPLATE_CATALOG_CACHE_KEY,
  MOBILE_TEMPLATE_CATALOG_MAX_BYTES,
  MOBILE_TEMPLATE_CATALOG_URL,
  fetchRemoteTemplateCatalog,
  mergeTemplateCatalog,
  parseRemoteTemplateCatalog,
  parseRemoteTemplateCatalogText,
  readCachedTemplateCatalog,
  refreshRemoteTemplateCatalog,
  writeCachedTemplateCatalog
} from "./remote-template-catalog";
import { mobileTemplateGallery } from "./template-gallery";

function validCatalog() {
  return {
    schemaVersion: 1,
    catalogVersion: "v1-deadbeef",
    templates: [
      {
        id: "remote-wedding",
        category: "wedding",
        name: "새 웨딩",
        badge: "결혼식",
        desc: "배포 후 추가된 원격 템플릿",
        tags: ["#신규"],
        previewUrl: "https://invitation-platform-plum.vercel.app/images/custom/remote.png?v=v1-deadbeef",
        sampleTextOverlay: true,
        textPlacement: "bottom",
        textSafeArea: { topPct: 70, bottomPct: 92, leftPct: 8, rightPct: 92, backdrop: "none" }
      }
    ]
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("remote mobile template catalog", () => {
  it("accepts bounded canonical records and marks them as remote", () => {
    const parsed = parseRemoteTemplateCatalog(validCatalog());

    expect(parsed.templates[0]).toMatchObject({ id: "remote-wedding", remote: true });
    expect(parsed.templates[0].textPlacement).toBe("bottom");
    expect(parsed.templates[0].textSafeArea).toEqual(validCatalog().templates[0].textSafeArea);
  });

  it("falls back for old schema-version-1 payloads without a safe area", () => {
    const legacy = validCatalog();
    const template: Partial<(typeof legacy.templates)[number]> = { ...legacy.templates[0] };
    delete template.textSafeArea;
    const parsed = parseRemoteTemplateCatalog({ ...legacy, templates: [template] });

    expect(parsed.templates[0].textSafeArea).toMatchObject({ topPct: 57, bottomPct: 92 });
  });

  it("rejects malformed and out-of-bounds safe areas", () => {
    for (const textSafeArea of [
      { topPct: 70, bottomPct: 92, leftPct: 8, rightPct: 92 },
      { topPct: -1, bottomPct: 92, leftPct: 8, rightPct: 92, backdrop: "none" },
      { topPct: 70, bottomPct: 101, leftPct: 8, rightPct: 92, backdrop: "none" },
      { topPct: 92, bottomPct: 70, leftPct: 8, rightPct: 92, backdrop: "none" },
      { topPct: 70, bottomPct: 92, leftPct: 93, rightPct: 92, backdrop: "none" },
      { topPct: 70, bottomPct: 92, leftPct: 8, rightPct: 92, backdrop: "dark" }
    ]) {
      expect(() => parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: [{ ...validCatalog().templates[0], textSafeArea }]
      })).toThrow(/항목/);
    }
  });

  it("rejects malformed, duplicate, oversized, and untrusted records", () => {
    expect(() => parseRemoteTemplateCatalog({ ...validCatalog(), schemaVersion: 2 })).toThrow();
    expect(() =>
      parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: [
          {
            ...validCatalog().templates[0],
            previewUrl: "https://attacker.example/template.png"
          }
        ]
      })
    ).toThrow();
    expect(() =>
      parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: [
          {
            ...validCatalog().templates[0],
            previewUrl: "https://invitation-platform-plum.vercel.app/api/private?v=v1-deadbeef"
          }
        ]
      })
    ).toThrow();
    expect(() =>
      parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: [
          {
            ...validCatalog().templates[0],
            previewUrl: "https://invitation-platform-plum.vercel.app/images/custom/remote.png?v=v1-cafebabe"
          }
        ]
      })
    ).toThrow(/버전/);
    expect(() =>
      parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: [validCatalog().templates[0], validCatalog().templates[0]]
      })
    ).toThrow(/중복/);
    expect(() => parseRemoteTemplateCatalogText("x".repeat(MOBILE_TEMPLATE_CATALOG_MAX_BYTES + 1))).toThrow(
      /너무 큽니다/
    );
    expect(() => parseRemoteTemplateCatalogText("not-json")).toThrow(/JSON/);
  });

  it("persists and restores only a validated last-known-good catalog", async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: vi.fn(async (key: string) => values.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        values.set(key, value);
      })
    };
    const catalog = parseRemoteTemplateCatalog(validCatalog());

    await writeCachedTemplateCatalog(catalog, storage);
    await expect(readCachedTemplateCatalog(storage)).resolves.toEqual(catalog);
    expect(values.has(MOBILE_TEMPLATE_CATALOG_CACHE_KEY)).toBe(true);

    values.set(MOBILE_TEMPLATE_CATALOG_CACHE_KEY, "{bad-json");
    await expect(readCachedTemplateCatalog(storage)).resolves.toBeNull();
  });

  it("keeps the cached last-known-good catalog after a network failure", async () => {
    const cached = parseRemoteTemplateCatalog(validCatalog());
    const failingFetcher = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    const storage = { getItem: vi.fn(), setItem: vi.fn() };

    await expect(refreshRemoteTemplateCatalog(cached, failingFetcher, storage, 25)).resolves.toEqual(cached);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("fetches the fixed production endpoint and aborts a stalled request", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn((_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      })
    ) as typeof fetch;

    const request = fetchRemoteTemplateCatalog(fetcher, 50);
    const rejection = expect(request).rejects.toThrow("aborted");
    await vi.advanceTimersByTimeAsync(50);

    await rejection;
    expect(fetcher).toHaveBeenCalledWith(
      MOBILE_TEMPLATE_CATALOG_URL,
      expect.objectContaining({ method: "GET", signal: expect.any(AbortSignal) })
    );
  });

  it("rejects an oversized response before reading its body", async () => {
    const text = vi.fn();
    const fetcher = vi.fn(async () => ({
      ok: true,
      headers: new Headers({ "content-length": String(MOBILE_TEMPLATE_CATALOG_MAX_BYTES + 1) }),
      text
    })) as unknown as typeof fetch;

    await expect(fetchRemoteTemplateCatalog(fetcher)).rejects.toThrow(/너무 큽니다/);
    expect(text).not.toHaveBeenCalled();
  });

  it("counts streamed bytes instead of trusting an understated content length", async () => {
    const oversizedBody = "x".repeat(MOBILE_TEMPLATE_CATALOG_MAX_BYTES + 1);
    const fetcher = vi.fn(async () =>
      new Response(oversizedBody, {
        headers: {
          "content-length": "1",
          "content-type": "application/json"
        }
      })) as unknown as typeof fetch;

    await expect(fetchRemoteTemplateCatalog(fetcher)).rejects.toThrow(/너무 큽니다/);
  });

  it("fails closed when the runtime cannot expose a bounded response stream", async () => {
    const text = vi.fn(async () => JSON.stringify(validCatalog()));
    const fetcher = vi.fn(async () => ({
      ok: true,
      body: null,
      headers: new Headers({
        "content-length": "100",
        "content-type": "application/json"
      }),
      text
    })) as unknown as typeof fetch;

    await expect(fetchRemoteTemplateCatalog(fetcher)).rejects.toThrow(/안전하게 읽을 수 없습니다/);
    expect(text).not.toHaveBeenCalled();
  });

  it("parses a valid bounded streamed response", async () => {
    const body = JSON.stringify(validCatalog());
    const fetcher = vi.fn(async () =>
      new Response(body, {
        headers: {
          "content-length": String(new TextEncoder().encode(body).byteLength),
          "content-type": "application/json"
        }
      })) as unknown as typeof fetch;

    await expect(fetchRemoteTemplateCatalog(fetcher)).resolves.toEqual(parseRemoteTemplateCatalog(validCatalog()));
  });

  it("rejects a non-JSON response before parsing its body", async () => {
    const text = vi.fn();
    const fetcher = vi.fn(async () => ({
      ok: true,
      headers: new Headers({ "content-type": "text/html" }),
      text
    })) as unknown as typeof fetch;

    await expect(fetchRemoteTemplateCatalog(fetcher)).rejects.toThrow(/응답 형식/);
    expect(text).not.toHaveBeenCalled();
  });

  it("merges remote updates first while retaining bundled offline fallbacks", () => {
    const remote = parseRemoteTemplateCatalog(validCatalog()).templates;
    const merged = mergeTemplateCatalog(mobileTemplateGallery, remote);

    expect(merged[0].id).toBe("remote-wedding");
    expect(merged).toHaveLength(mobileTemplateGallery.length + 1);
    expect(merged.some((template) => template.id === mobileTemplateGallery[0].id)).toBe(true);
  });
});
