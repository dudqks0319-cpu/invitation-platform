import { Share } from "react-native";
import * as ExpoLinking from "expo-linking";

const DEFAULT_WEB_BASE_URL = "https://invitehub.co.kr";

export function getPublicInvitationUrl(slug: string) {
  const baseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL || DEFAULT_WEB_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}/i/${slug}`;
}

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

export async function openInvitationPublicPage(slug: string) {
  const url = getPublicInvitationUrl(slug);
  await ExpoLinking.openURL(url);
  return url;
}
