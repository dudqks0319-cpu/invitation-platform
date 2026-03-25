const ALLOWED_TAGS = new Set(["div", "span", "p", "strong", "em", "br", "img"]);
const ALLOWED_ATTRS = new Set(["class", "style", "src", "alt", "aria-hidden"]);
const BLOCKED_TAGS = /<\s*\/?\s*(script|style|iframe|object|embed|meta|link|base|form|input|button|textarea|select|option)[^>]*>/gi;

function decodeAttributeValue(value: string) {
  return value.replace(/^['"]|['"]$/g, "");
}

function escapeAttributeValue(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeStyleValue(styleValue: string) {
  const compact = styleValue.replace(/\s+/g, " ").trim();

  if (!compact) {
    return "";
  }

  if (/(javascript:|expression\s*\(|url\s*\(|@import)/i.test(compact)) {
    return "";
  }

  if (!/^[#%(),./:;\-0-9A-Za-z\s'"]+$/.test(compact)) {
    return "";
  }

  return compact;
}

function sanitizeTagAttributes(tagName: string, rawAttributes: string) {
  if (!rawAttributes.trim()) {
    return "";
  }

  const sanitizedAttributes: string[] = [];
  const attributePattern = /([:\w-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;

  rawAttributes.replace(attributePattern, (_match, attrName: string, attrValue?: string) => {
    const normalizedName = attrName.toLowerCase();

    if (normalizedName.startsWith("on") || !ALLOWED_ATTRS.has(normalizedName)) {
      return "";
    }

    const normalizedValue = attrValue ? decodeAttributeValue(attrValue) : "";

    if (normalizedName === "style") {
      const safeStyle = sanitizeStyleValue(normalizedValue);
      if (safeStyle) {
        sanitizedAttributes.push(`style="${escapeAttributeValue(safeStyle)}"`);
      }
      return "";
    }

    if ((normalizedName === "src" || normalizedName === "href") && /^javascript:/i.test(normalizedValue)) {
      return "";
    }

    if (normalizedName === "src" && tagName !== "img") {
      return "";
    }

    sanitizedAttributes.push(
      normalizedValue
        ? `${normalizedName}="${escapeAttributeValue(normalizedValue)}"`
        : normalizedName
    );

    return "";
  });

  return sanitizedAttributes.length ? ` ${sanitizedAttributes.join(" ")}` : "";
}

export function sanitizeTemplateMarkup(html: string) {
  return html
    .replace(BLOCKED_TAGS, "")
    .replace(/<\s*(\/?)([a-z0-9-]+)([^>]*)>/gi, (_match, closingSlash: string, tagName: string, rawAttributes: string) => {
      const normalizedTag = tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(normalizedTag)) {
        return "";
      }

      if (closingSlash) {
        return `</${normalizedTag}>`;
      }

      const attributes = sanitizeTagAttributes(normalizedTag, rawAttributes);
      return `<${normalizedTag}${attributes}>`;
    });
}
