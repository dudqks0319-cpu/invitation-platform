import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetch as expoFetch } from "expo/fetch";
import { isTemplateTextSafeArea, resolveTemplateTextSafeArea } from "@invitehub/shared";
import type { MobileTemplateGalleryItem } from "./template-gallery";

export const MOBILE_TEMPLATE_CATALOG_URL =
  "https://invitation-platform-plum.vercel.app/api/mobile/v1/templates";
export const MOBILE_TEMPLATE_CATALOG_CACHE_KEY = "invitehub.mobile-template-catalog.v1";
export const MOBILE_TEMPLATE_CATALOG_MAX_ITEMS = 250;
export const MOBILE_TEMPLATE_CATALOG_MAX_BYTES = 192 * 1024;
export const MOBILE_TEMPLATE_CATALOG_TIMEOUT_MS = 4_000;
export const MOBILE_TEMPLATE_CATALOG_STORAGE_TIMEOUT_MS = 750;

const allowedCategories = new Set([
  "wedding",
  "dol",
  "hwangap",
  "bridal",
  "birthday",
  "housewarming",
  "baby",
  "graduation",
  "business"
]);
const canonicalAssetOrigin = new URL(MOBILE_TEMPLATE_CATALOG_URL).origin;

type Storage = Pick<typeof AsyncStorage, "getItem" | "setItem">;
type Fetcher = typeof fetch;
const defaultCatalogFetcher = expoFetch as unknown as Fetcher;

async function settleStorageWithin<T>(operation: Promise<T>, fallback: T) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => resolve(fallback), MOBILE_TEMPLATE_CATALOG_STORAGE_TIMEOUT_MS);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export type RemoteMobileTemplateCatalog = {
  schemaVersion: 1;
  catalogVersion: string;
  templates: MobileTemplateGalleryItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown, maxLength: number, minLength = 0): value is string {
  return typeof value === "string" && value.length >= minLength && value.length <= maxLength;
}

export function utf8ByteLength(value: string) {
  let bytes = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.charCodeAt(index);
    if (codePoint < 0x80) bytes += 1;
    else if (codePoint < 0x800) bytes += 2;
    else if (codePoint >= 0xd800 && codePoint <= 0xdbff && index + 1 < value.length) {
      bytes += 4;
      index += 1;
    } else bytes += 3;
  }

  return bytes;
}

function normalizePreviewUrl(value: unknown) {
  if (!isBoundedString(value, 500, 10)) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.origin !== canonicalAssetOrigin ||
      !url.pathname.startsWith("/images/custom/") ||
      url.username ||
      url.password ||
      url.hash
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeTemplate(value: unknown): MobileTemplateGalleryItem | null {
  if (!isRecord(value)) return null;
  const previewUrl = normalizePreviewUrl(value.previewUrl);
  const tags = value.tags;

  if (
    !isBoundedString(value.id, 80, 2) ||
    !/^[a-z0-9-]+$/.test(value.id) ||
    !isBoundedString(value.category, 32, 2) ||
    !allowedCategories.has(value.category) ||
    !isBoundedString(value.name, 60, 1) ||
    !isBoundedString(value.badge, 20) ||
    !isBoundedString(value.desc, 120) ||
    !Array.isArray(tags) ||
    tags.length > 5 ||
    !tags.every((tag) => isBoundedString(tag, 24)) ||
    !previewUrl ||
    typeof value.sampleTextOverlay !== "boolean" ||
    (value.textPlacement !== undefined && !["top", "center", "bottom"].includes(String(value.textPlacement))) ||
    (value.textSafeArea !== undefined && !isTemplateTextSafeArea(value.textSafeArea))
  ) {
    return null;
  }

  const textPlacement = (value.textPlacement as "top" | "center" | "bottom" | undefined) ?? "center";

  return {
    id: value.id,
    category: value.category,
    name: value.name,
    badge: value.badge,
    desc: value.desc,
    tags: [...tags],
    previewUrl,
    sampleTextOverlay: value.sampleTextOverlay,
    textPlacement,
    textSafeArea: value.textSafeArea ?? resolveTemplateTextSafeArea({
      templateId: value.id,
      category: value.category,
      textPlacement
    }),
    remote: true
  };
}

export function parseRemoteTemplateCatalog(value: unknown): RemoteMobileTemplateCatalog {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isBoundedString(value.catalogVersion, 80, 3) ||
    !/^v1-[a-f0-9]{8}$/.test(value.catalogVersion) ||
    !Array.isArray(value.templates) ||
    value.templates.length > MOBILE_TEMPLATE_CATALOG_MAX_ITEMS
  ) {
    throw new Error("원격 템플릿 카탈로그 형식이 올바르지 않습니다.");
  }

  const templates = value.templates.map(normalizeTemplate);
  if (templates.some((template) => template === null)) {
    throw new Error("원격 템플릿 항목 형식이 올바르지 않습니다.");
  }

  const ids = new Set<string>();
  for (const template of templates as MobileTemplateGalleryItem[]) {
    if (ids.has(template.id)) {
      throw new Error("원격 템플릿 식별자가 중복되었습니다.");
    }
    ids.add(template.id);

    const previewUrl = new URL(template.previewUrl || "");
    if (
      previewUrl.searchParams.get("v") !== value.catalogVersion ||
      [...previewUrl.searchParams.keys()].some((key) => key !== "v")
    ) {
      throw new Error("원격 템플릿 자산 버전이 올바르지 않습니다.");
    }
  }

  return {
    schemaVersion: 1,
    catalogVersion: value.catalogVersion,
    templates: templates as MobileTemplateGalleryItem[]
  };
}

export function parseRemoteTemplateCatalogText(text: string) {
  if (utf8ByteLength(text) > MOBILE_TEMPLATE_CATALOG_MAX_BYTES) {
    throw new Error("원격 템플릿 카탈로그가 너무 큽니다.");
  }

  try {
    return parseRemoteTemplateCatalog(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("원격 템플릿 카탈로그 JSON이 올바르지 않습니다.");
    }
    throw error;
  }
}

async function readBoundedResponseText(response: Response) {
  if (!response.body) {
    throw new Error("원격 템플릿 카탈로그 응답을 안전하게 읽을 수 없습니다.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.byteLength;
      if (bytesRead > MOBILE_TEMPLATE_CATALOG_MAX_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new Error("원격 템플릿 카탈로그가 너무 큽니다.");
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

export async function readCachedTemplateCatalog(storage: Storage = AsyncStorage) {
  try {
    const cached = await settleStorageWithin(
      storage.getItem(MOBILE_TEMPLATE_CATALOG_CACHE_KEY),
      null
    );
    return cached ? parseRemoteTemplateCatalogText(cached) : null;
  } catch {
    return null;
  }
}

export async function writeCachedTemplateCatalog(
  catalog: RemoteMobileTemplateCatalog,
  storage: Storage = AsyncStorage
) {
  const serialized = JSON.stringify(catalog);
  if (utf8ByteLength(serialized) > MOBILE_TEMPLATE_CATALOG_MAX_BYTES) return;

  await settleStorageWithin(
    storage.setItem(MOBILE_TEMPLATE_CATALOG_CACHE_KEY, serialized),
    undefined
  ).catch(() => undefined);
}

export async function fetchRemoteTemplateCatalog(
  fetcher: Fetcher = defaultCatalogFetcher,
  timeoutMs = MOBILE_TEMPLATE_CATALOG_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(MOBILE_TEMPLATE_CATALOG_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error("원격 템플릿 카탈로그를 불러오지 못했습니다.");
    }

    const contentLengthHeader = response.headers.get("content-length");
    const contentLength = contentLengthHeader && /^\d+$/.test(contentLengthHeader)
      ? Number(contentLengthHeader)
      : null;
    if (contentLength !== null && contentLength > MOBILE_TEMPLATE_CATALOG_MAX_BYTES) {
      throw new Error("원격 템플릿 카탈로그가 너무 큽니다.");
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      throw new Error("원격 템플릿 카탈로그 응답 형식이 올바르지 않습니다.");
    }

    return parseRemoteTemplateCatalogText(await readBoundedResponseText(response));
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshRemoteTemplateCatalog(
  lastKnownGood: RemoteMobileTemplateCatalog | null,
  fetcher: Fetcher = defaultCatalogFetcher,
  storage: Storage = AsyncStorage,
  timeoutMs = MOBILE_TEMPLATE_CATALOG_TIMEOUT_MS
) {
  try {
    const remote = await fetchRemoteTemplateCatalog(fetcher, timeoutMs);
    await writeCachedTemplateCatalog(remote, storage);
    return remote;
  } catch {
    return lastKnownGood;
  }
}

export function mergeTemplateCatalog(
  bundledTemplates: MobileTemplateGalleryItem[],
  remoteTemplates: MobileTemplateGalleryItem[]
) {
  const remoteIds = new Set(remoteTemplates.map((template) => template.id));
  return [...remoteTemplates, ...bundledTemplates.filter((template) => !remoteIds.has(template.id))];
}
