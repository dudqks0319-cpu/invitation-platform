const DEFAULT_WEB_BASE_URL = "https://invitation-platform-plum.vercel.app";
const LEGACY_VERCEL_PROJECT_HOST_PATTERN = /^invitation-platform(?:-[a-z0-9-]+)?-youngbeens-projects\.vercel\.app$/i;

export function getInviteHubBaseUrl(baseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL || DEFAULT_WEB_BASE_URL) {
  const trimmedBaseUrl = baseUrl.trim();

  try {
    const url = new URL(trimmedBaseUrl);

    if (LEGACY_VERCEL_PROJECT_HOST_PATTERN.test(url.hostname)) {
      return DEFAULT_WEB_BASE_URL;
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return DEFAULT_WEB_BASE_URL;
  }
}

function buildPathUrl(path: string, baseUrl?: string) {
  return new URL(path, `${getInviteHubBaseUrl(baseUrl)}/`).toString();
}

export function getWebTemplatesUrl(baseUrl?: string) {
  return `${getInviteHubBaseUrl(baseUrl)}/#templates`;
}

export function getWebBuilderUrl(
  options?: {
    templateId?: string;
    invitationId?: string;
    intent?: "checkout";
  },
  baseUrl?: string
) {
  const url = new URL("/builder", `${getInviteHubBaseUrl(baseUrl)}/`);

  if (options?.templateId) {
    url.searchParams.set("template", options.templateId);
  }

  if (options?.invitationId) {
    url.searchParams.set("invitationId", options.invitationId);
  }

  if (options?.intent) {
    url.searchParams.set("intent", options.intent);
  }

  return url.toString();
}

export function getPublicInvitationUrl(slug: string, baseUrl?: string) {
  return buildPathUrl(`/i/${slug}`, baseUrl);
}

export function getFaqUrl(baseUrl?: string) {
  return buildPathUrl("/faq", baseUrl);
}

export function getPrivacyUrl(baseUrl?: string) {
  return buildPathUrl("/privacy", baseUrl);
}

export function getTermsUrl(baseUrl?: string) {
  return buildPathUrl("/terms", baseUrl);
}

export function getSupportUrl(baseUrl?: string) {
  return buildPathUrl("/support", baseUrl);
}
