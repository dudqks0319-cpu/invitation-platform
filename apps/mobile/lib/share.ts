import { Share } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { getPublicInvitationUrl, getWebBuilderUrl, getWebTemplatesUrl } from "./web-links";

export { getPublicInvitationUrl } from "./web-links";

export function createInvitationShareMessage(slug: string, title: string) {
  const url = getPublicInvitationUrl(slug);
  return {
    title,
    url,
    message: `${title}\n${url}`
  };
}

export async function shareInvitationLink(slug: string, title: string) {
  return Share.share(createInvitationShareMessage(slug, title));
}

export async function openInviteHubUrl(url: string) {
  await WebBrowser.openBrowserAsync(url);
  return url;
}

export async function openInvitationPublicPage(slug: string) {
  const url = getPublicInvitationUrl(slug);
  return openInviteHubUrl(url);
}

export async function openWebBuilder(options?: {
  templateId?: string;
  invitationId?: string;
  intent?: "checkout";
}) {
  const url = getWebBuilderUrl(options);
  return openInviteHubUrl(url);
}

export async function openWebTemplates() {
  return openInviteHubUrl(getWebTemplatesUrl());
}
