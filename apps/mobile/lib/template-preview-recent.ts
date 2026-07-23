import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_TEMPLATE_IDS_KEY = "invitehub:mobile:recent-template-ids";
const MAX_RECENT_TEMPLATE_IDS = 6;

type RecentTemplateStorage = Pick<typeof AsyncStorage, "getItem" | "setItem">;
const storageQueues = new WeakMap<object, Promise<void>>();

function isSafeTemplateId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]{2,80}$/.test(value);
}

function serializeStorageOperation<T>(storage: RecentTemplateStorage, operation: () => Promise<T>) {
  const previous = storageQueues.get(storage) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);
  storageQueues.set(storage, current.then(() => undefined, () => undefined));
  return current;
}

async function readRecentTemplateIds(storage: RecentTemplateStorage) {
  let raw: string | null;
  try {
    raw = await storage.getItem(RECENT_TEMPLATE_IDS_KEY);
  } catch {
    return { ids: [], readable: false, needsCleanup: false };
  }

  if (!raw) return { ids: [], readable: true, needsCleanup: false };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return { ids: [], readable: true, needsCleanup: true };

    const ids = parsed.filter(isSafeTemplateId).filter((id, index, values) => values.indexOf(id) === index);
    return { ids, readable: true, needsCleanup: ids.length !== parsed.length };
  } catch {
    return { ids: [], readable: true, needsCleanup: true };
  }
}

async function writeRecentTemplateIds(storage: RecentTemplateStorage, ids: readonly string[]) {
  try {
    await storage.setItem(RECENT_TEMPLATE_IDS_KEY, JSON.stringify(ids.slice(0, MAX_RECENT_TEMPLATE_IDS)));
  } catch {
    // Preview history is best-effort and must never block discovery or preview.
  }
}

export function loadRecentlyViewedTemplates<T extends { id: string }>(
  templates: readonly T[],
  storage: RecentTemplateStorage = AsyncStorage
) {
  return serializeStorageOperation(storage, async () => {
    const recent = await readRecentTemplateIds(storage);
    if (!recent.readable) return [];

    const activeTemplatesById = new Map(templates.map((template) => [template.id, template]));
    const activeRecentIds = recent.ids.filter((id) => activeTemplatesById.has(id)).slice(0, MAX_RECENT_TEMPLATE_IDS);
    if (recent.needsCleanup || activeRecentIds.length !== recent.ids.length) {
      await writeRecentTemplateIds(storage, activeRecentIds);
    }
    return activeRecentIds.map((id) => activeTemplatesById.get(id)).filter((template): template is T => template !== undefined);
  });
}

export async function recordRecentlyViewedTemplate(
  templateId: string,
  storage: RecentTemplateStorage = AsyncStorage
) {
  if (!isSafeTemplateId(templateId)) return;
  await serializeStorageOperation(storage, async () => {
    const existing = await readRecentTemplateIds(storage);
    const next = [templateId, ...existing.ids.filter((id) => id !== templateId)].slice(0, MAX_RECENT_TEMPLATE_IDS);
    await writeRecentTemplateIds(storage, next);
  });
}
