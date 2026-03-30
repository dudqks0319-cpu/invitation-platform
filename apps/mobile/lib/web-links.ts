const DEFAULT_WEB_BASE_URL = "https://invitehub.co.kr";

export function getInviteHubBaseUrl(baseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL || DEFAULT_WEB_BASE_URL) {
  return baseUrl.replace(/\/$/, "");
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
  return `${getInviteHubBaseUrl(baseUrl)}/i/${slug}`;
}
