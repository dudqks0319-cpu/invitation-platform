import { Share } from "react-native";
import { createInvitationShareMessage } from "./share-content";
import { getPublicInvitationUrl, getWebBuilderUrl, getWebTemplatesUrl } from "./web-links";

export { getPublicInvitationUrl } from "./web-links";
export { createInvitationShareMessage } from "./share-content";

export async function shareInvitationLink(slug: string, title: string) {
  return Share.share(createInvitationShareMessage(slug, title), {
    dialogTitle: "카카오톡으로 초대장 보내기"
  });
}

export async function openInviteHubUrl(url: string) {
  const WebBrowser = await import("expo-web-browser");
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
