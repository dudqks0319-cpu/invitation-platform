import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("expo/fetch", () => ({ fetch: globalThis.fetch }));

import {
  MOBILE_TEMPLATE_CATALOG_CACHE_KEY,
  MOBILE_TEMPLATE_CATALOG_MAX_BYTES,
  MOBILE_TEMPLATE_CATALOG_STORAGE_TIMEOUT_MS,
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
import { templateCatalogContract } from "./template-catalog.contract.fixture";
import { buildPublicMobileTemplateCatalog } from "../../../lib/mobile-template-catalog";
import { templates as canonicalTemplates } from "../../../lib/templates";

const validCatalogFixture = buildPublicMobileTemplateCatalog(
  canonicalTemplates,
  "remote-contract-test"
).catalog;

function validCatalog(templateOverrides: Record<string, unknown> = {}) {
  return {
    ...validCatalogFixture,
    templates: [
      { ...validCatalogFixture.templates[0], ...templateOverrides },
      ...validCatalogFixture.templates.slice(1)
    ]
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("remote mobile template catalog", () => {
  it("accepts bounded canonical records and marks them as remote", () => {
    const parsed = parseRemoteTemplateCatalog(validCatalog());

    expect(parsed.templates[0]).toMatchObject({ id: validCatalog().templates[0].id, remote: true });
    expect(parsed.templates[0].textSafeArea).toBeDefined();
    expect(parsed.meta.count).toBe(templateCatalogContract.remoteTemplateCount);
  });

  it("always resolves safe areas locally instead of trusting a remote API field", () => {
    const remoteTextSafeArea = { topPct: 0, bottomPct: 1, leftPct: 0, rightPct: 1, backdrop: "solid" };
    const parsed = parseRemoteTemplateCatalog(validCatalog({
      textPlacement: "bottom",
      textSafeArea: remoteTextSafeArea
    }));

    expect(parsed.templates[0].textSafeArea).toMatchObject({ topPct: 57, bottomPct: 92 });
    expect(parsed.templates[0].textSafeArea).not.toEqual(remoteTextSafeArea);
  });

  it("rejects malformed, duplicate, oversized, and untrusted records", () => {
    expect(() => parseRemoteTemplateCatalog({ ...validCatalog(), schemaVersion: 2 })).toThrow();
    expect(() =>
      parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: validCatalog().templates.map((template, index) => index === 0
          ? { ...template, previewUrl: "https://attacker.example/template.png" }
          : template)
      })
    ).toThrow();
    expect(() =>
      parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: validCatalog().templates.map((template, index) => index === 0
          ? { ...template, previewUrl: `https://invitation-platform-plum.vercel.app/api/private?v=${validCatalog().catalogVersion}` }
          : template)
      })
    ).toThrow();
    expect(() =>
      parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: validCatalog().templates.map((template, index) => index === 0
          ? { ...template, previewUrl: "https://invitation-platform-plum.vercel.app/images/custom/remote.png?v=v1-cafebabe" }
          : template)
      })
    ).toThrow(/버전/);
    expect(() =>
      parseRemoteTemplateCatalog({
        ...validCatalog(),
        templates: validCatalog().templates.map((template, index) =>
          index === validCatalog().templates.length - 1 ? validCatalog().templates[0] : template)
      })
    ).toThrow(/중복/);
    expect(() => parseRemoteTemplateCatalogText("x".repeat(MOBILE_TEMPLATE_CATALOG_MAX_BYTES + 1))).toThrow(
      /너무 큽니다/
    );
    expect(() => parseRemoteTemplateCatalogText("not-json")).toThrow(/JSON/);
  });

  it.each([
    ["179 records", (catalog: ReturnType<typeof validCatalog>) => ({
      ...catalog,
      templates: catalog.templates.slice(0, -1),
      meta: { ...catalog.meta, count: catalog.templates.length - 1 }
    })],
    ["181 records", (catalog: ReturnType<typeof validCatalog>) => ({
      ...catalog,
      templates: [...catalog.templates, {
        ...catalog.templates[0],
        id: "remote-extra-contract-record",
        previewUrl: catalog.templates[0].previewUrl.replace("/images/custom/", "/images/custom/extra-")
      }],
      meta: { ...catalog.meta, count: catalog.templates.length + 1 }
    })],
    ["a missing bundled ID", (catalog: ReturnType<typeof validCatalog>) => ({
      ...catalog,
      templates: catalog.templates.map((template, index) => index === 0
        ? {
            ...template,
            id: "remote-replacement-without-bundle-id",
            previewUrl: template.previewUrl.replace("/images/custom/", "/images/custom/replacement-")
          }
        : template)
    })],
    ["an inconsistent meta.count", (catalog: ReturnType<typeof validCatalog>) => ({
      ...catalog,
      meta: { ...catalog.meta, count: catalog.templates.length - 1 }
    })]
  ])("rejects %s and keeps the last-known-good cache intact", async (_name, mutate) => {
    const cached = parseRemoteTemplateCatalog(validCatalog());
    const invalid = mutate(validCatalog());
    const fetcher = vi.fn(async () => new Response(JSON.stringify(invalid), {
      headers: { "content-type": "application/json" }
    })) as unknown as typeof fetch;
    const storage = { getItem: vi.fn(), setItem: vi.fn() };

    await expect(refreshRemoteTemplateCatalog(cached, fetcher, storage)).resolves.toEqual(cached);
    expect(storage.setItem).not.toHaveBeenCalled();
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
    await expect(readCachedTemplateCatalog(storage)).resolves.toBe(
      templateCatalogContract.cache.acceptsOnlyValidatedCatalogs ? null : catalog
    );
  });

  it("bounds stalled cache reads and writes", async () => {
    vi.useFakeTimers();
    const storage = {
      getItem: vi.fn(() => new Promise<string | null>(() => undefined)),
      setItem: vi.fn(() => new Promise<void>(() => undefined))
    };
    const catalog = parseRemoteTemplateCatalog(validCatalog());

    const read = readCachedTemplateCatalog(storage);
    const write = writeCachedTemplateCatalog(catalog, storage);
    await vi.advanceTimersByTimeAsync(MOBILE_TEMPLATE_CATALOG_STORAGE_TIMEOUT_MS);

    await expect(read).resolves.toBeNull();
    await expect(write).resolves.toBeUndefined();
  });

  it("keeps the cached last-known-good catalog after a network failure", async () => {
    const cached = parseRemoteTemplateCatalog(validCatalog());
    const failingFetcher = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    const storage = { getItem: vi.fn(), setItem: vi.fn() };

    await expect(refreshRemoteTemplateCatalog(cached, failingFetcher, storage, 25)).resolves.toEqual(
      templateCatalogContract.cache.keepsLastKnownGoodOnRefreshFailure ? cached : null
    );
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

  it("uses the remote record exactly once when it replaces a bundled ID, while retaining offline fallbacks", () => {
    const remote = parseRemoteTemplateCatalog(validCatalog({
      name: "원격 로즈 프레임",
      badge: "원격 결혼식",
      desc: "원격 카탈로그가 번들 항목을 교체합니다.",
      tags: ["#원격"],
      previewUrl: validCatalog().templates[0].previewUrl.replace("/images/custom/", "/images/custom/replacement-")
    })).templates;
    const remoteId = remote[0].id;
    const merged = mergeTemplateCatalog(mobileTemplateGallery, remote);
    const replaced = merged.filter((template) => template.id === remoteId);

    expect(merged[0].id).toBe(
      templateCatalogContract.merge.remoteTemplatesAppearFirst ? remoteId : mobileTemplateGallery[0].id
    );
    expect(replaced).toHaveLength(1);
    expect(replaced[0]).toMatchObject({
      id: remoteId,
      name: "원격 로즈 프레임",
      badge: "원격 결혼식",
      tags: ["#원격"],
      remote: true
    });
    expect(merged).toHaveLength(templateCatalogContract.remoteTemplateCount);
    expect(merged.some((template) => template.id === mobileTemplateGallery[0].id)).toBe(
      templateCatalogContract.merge.bundledTemplatesRemainAvailableOffline
    );
  });
});
