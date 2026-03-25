/* eslint-disable jsx-a11y/alt-text */

import { Link, useLocalSearchParams } from "expo-router";
import { Image, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";

async function pickPreparedImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("사진 라이브러리 접근 권한이 필요합니다.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.9,
    allowsEditing: true
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  const manipulated = await manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.8, format: SaveFormat.JPEG }
  );

  return manipulated.uri;
}

export default function BuilderStep3PhotosScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { addGalleryPhoto, draft, updatePhoto } = useInvitationDraft("local-preview-owner", localId);

  async function handlePick(slot: "main" | "background" | "gallery") {
    const localUri = await pickPreparedImage();
    if (!localUri) return;

    if (slot === "gallery") {
      addGalleryPhoto(localUri);
      return;
    }

    updatePhoto(slot, localUri);
  }

  return (
    <Screen subtitle="메인, 배경, 갤러리 사진을 로컬 초안에 연결합니다." title="초대장 만들기">
      <StepIndicator current={3} title="사진 설정" />
      <Card eyebrow="메인 사진" title="대표 사진">
        {draft?.payload.photos.mainUri ? (
          <Image
            source={{ uri: draft.payload.photos.mainUri }}
            style={{ width: "100%", height: 180, borderRadius: 16, marginBottom: 12 }}
          />
        ) : null}
        <Button accessibilityLabel="메인 사진 선택" onPress={() => void handlePick("main")}>
          메인 사진 선택
        </Button>
      </Card>
      <Card eyebrow="배경 사진" title="커버 배경">
        {draft?.payload.photos.backgroundUri ? (
          <Image
            source={{ uri: draft.payload.photos.backgroundUri }}
            style={{ width: "100%", height: 140, borderRadius: 16, marginBottom: 12 }}
          />
        ) : null}
        <Button accessibilityLabel="배경 사진 선택" onPress={() => void handlePick("background")} variant="outline">
          배경 사진 선택
        </Button>
      </Card>
      <Card eyebrow="갤러리" title={`현재 ${draft?.payload.photos.gallery.length ?? 0}장`}>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginBottom: 12 }}>
          v1에서는 한 장씩 추가하는 방식으로 먼저 연결합니다.
        </Text>
        <Text style={{ color: "#8d5a2b", lineHeight: 22, marginBottom: 12 }}>
          업로드 대기: {draft?.pendingPhotos.length ?? 0}개
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {draft?.payload.photos.gallery.map((photo) => (
            <Image
              key={photo.order}
              source={{ uri: photo.uri }}
              style={{ width: 88, height: 88, borderRadius: 12 }}
            />
          ))}
        </View>
        <Button accessibilityLabel="갤러리 사진 추가" onPress={() => void handlePick("gallery")}>
          갤러리 사진 추가
        </Button>
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href={{ pathname: "/builder/step2-people", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href={{ pathname: "/builder/step4-accounts", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="다음 단계로 이동">다음</Button>
        </Link>
      </View>
    </Screen>
  );
}
