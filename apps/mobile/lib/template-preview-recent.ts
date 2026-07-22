import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_TEMPLATE_IDS_KEY = "invitehub:mobile:recent-template-ids";
const MAX_RECENT_TEMPLATE_IDS = 6;

type RecentTemplateStorage = Pick<typeof AsyncStorage, "getItem" | "setItem">;

function isSafeTemplateId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]{2,80}$/.test(value);
}

async function readRecentTemplateIds(storage: RecentTemplateStorage) {
  try {
    const raw = await storage.getItem(RECENT_TEMPLATE_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isSafeTemplateId).slice(0, MAX_RECENT_TEMPLATE_IDS) : [];
  } catch {
    return [];
  }
}

export async function recordRecentlyViewedTemplate(
  templateId: string,
  storage: RecentTemplateStorage = AsyncStorage
) {
  if (!isSafeTemplateId(templateId)) return;
  const existing = await readRecentTemplateIds(storage);
  const next = [templateId, ...existing.filter((id) => id !== templateId)].slice(0, MAX_RECENT_TEMPLATE_IDS);
  try {
    await storage.setItem(RECENT_TEMPLATE_IDS_KEY, JSON.stringify(next));
  } catch {
    // Preview history is best-effort and must never block viewing a template.
  }
}
