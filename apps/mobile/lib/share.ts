import { Share, Alert, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

const siteUrl = Constants.expoConfig?.extra?.siteUrl ?? "https://invitehub.co.kr";

export function getInvitationUrl(slug: string): string {
  return `${siteUrl}/i/${slug}`;
}

export async function shareInvitation(slug: string, title?: string): Promise<void> {
  const url = getInvitationUrl(slug);
  const message = title
    ? `${title} - 초대장을 확인해 주세요!`
    : "초대장을 확인해 주세요!";

  try {
    await Share.share(
      Platform.OS === "ios"
        ? { url, message }
        : { message: `${message}\n${url}` }
    );
  } catch (error) {
    if ((error as Error).message !== "User did not share") {
      Alert.alert("공유 실패", "링크를 클립보드에 복사합니다.");
      await copyInvitationLink(slug);
    }
  }
}

export async function copyInvitationLink(slug: string): Promise<void> {
  const url = getInvitationUrl(slug);
  await Clipboard.setStringAsync(url);
  Alert.alert("복사 완료", "초대장 링크가 클립보드에 복사되었습니다.");
}
