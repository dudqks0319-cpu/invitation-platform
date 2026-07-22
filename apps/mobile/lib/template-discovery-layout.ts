export const TEMPLATE_DISCOVERY_HORIZONTAL_INSET = 16;
export const TEMPLATE_DISCOVERY_COLUMN_GAP = 12;
export const TEMPLATE_DISCOVERY_LARGE_TEXT_SCALE = 1.6;

export function getTemplateDiscoveryColumnCount(fontScale: number) {
  return Number.isFinite(fontScale) && fontScale >= TEMPLATE_DISCOVERY_LARGE_TEXT_SCALE ? 1 : 2;
}

export function getTemplateDiscoveryCardWidth(contentWidth: number, fontScale: number) {
  const safeWidth = Number.isFinite(contentWidth) ? Math.max(0, contentWidth) : 0;
  const innerWidth = Math.max(0, safeWidth - TEMPLATE_DISCOVERY_HORIZONTAL_INSET * 2);
  const columnCount = getTemplateDiscoveryColumnCount(fontScale);

  if (columnCount === 1) return Math.floor(innerWidth);
  return Math.floor((innerWidth - TEMPLATE_DISCOVERY_COLUMN_GAP) / 2);
}
