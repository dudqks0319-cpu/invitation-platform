export type TemplatePreviewDestination = {
  pathname: "/template-preview";
  params: { templateId: string; previewIntentKey: string };
};

let previewIntentSequence = 0;

export function isValidTemplatePreviewIntentKey(value: unknown): value is string {
  return typeof value === "string" && /^preview-intent-[a-z0-9]{1,40}(?:-[a-z0-9]{1,16})?$/.test(value);
}

export function createTemplatePreviewIntentKey(now = Date.now()) {
  previewIntentSequence = (previewIntentSequence + 1) % Number.MAX_SAFE_INTEGER;
  const safeNow = Number.isFinite(now) ? Math.max(0, now) : Date.now();
  return `preview-intent-${safeNow.toString(36)}-${previewIntentSequence.toString(36)}`;
}

export function createTemplatePreviewDestination(
  templateId: string,
  previewIntentKey = createTemplatePreviewIntentKey()
): TemplatePreviewDestination | null {
  if (!/^[a-z0-9-]{2,80}$/.test(templateId)) return null;
  if (!isValidTemplatePreviewIntentKey(previewIntentKey)) return null;
  return { pathname: "/template-preview", params: { templateId, previewIntentKey } };
}
