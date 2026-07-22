let entrySequence = 0;

export function createTemplateDiscoveryEntryKey(now = Date.now()) {
  entrySequence = (entrySequence + 1) % Number.MAX_SAFE_INTEGER;
  const safeNow = Number.isFinite(now) ? Math.max(0, now) : Date.now();
  return `templates-entry-${safeNow.toString(36)}-${entrySequence.toString(36)}`;
}
