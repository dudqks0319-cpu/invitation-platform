import { Share, Alert, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

const BASE_URL =
  Constants.expoConfig?.extra?.siteUrl ?? "https://invitehub.co.kr";

export async function shareInvitation(
  slug: string,
  title: string
): Promise<{ shared: boolean; method?: string }> {
  const url = `${BASE_URL}/i/${slug}`;

  try {
    const result = await Share.share(
      Platform.OS === "ios"
        ? { url, message: title }
        : { message: `${title}\n${url}` }
    );

    if (result.action === Share.sharedAction) {
      return { shared: true, method: result.activityType ?? "share" };
    }

    return { shared: false };
  } catch {
    await copyLink(slug);
    Alert.alert("링크 복사 완료", "초대장 링크가 클립보드에 복사되었습니다.");
    return { shared: true, method: "clipboard" };
  }
}

export async function copyLink(slug: string): Promise<void> {
  const url = `${BASE_URL}/i/${slug}`;
  await Clipboard.setStringAsync(url);
}

export function getInvitationUrl(slug: string): string {
  return `${BASE_URL}/i/${slug}`;
}
