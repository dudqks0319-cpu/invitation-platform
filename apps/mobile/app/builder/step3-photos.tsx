/* eslint-disable jsx-a11y/alt-text */

import { Link, useLocalSearchParams } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
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
        <Pressable
          accessibilityLabel="메인 사진 선택"
          onPress={() => void handlePick("main")}
          style={{
            borderWidth: 1,
            borderColor: "rgba(143,111,82,0.18)",
            borderRadius: 14,
            padding: 12,
            backgroundColor: "#fff",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>메인 사진 선택</Text>
          <View
            style={{
              borderRadius: 999,
              backgroundColor: "#C9935A",
              paddingHorizontal: 14,
              paddingVertical: 8
            }}
          >
            <Text style={{ color: "#fff8f1", fontSize: 13, fontWeight: "700" }}>업로드</Text>
          </View>
        </Pressable>
      </Card>
      <Card eyebrow="배경 사진" title="커버 배경">
        {draft?.payload.photos.backgroundUri ? (
          <Image
            source={{ uri: draft.payload.photos.backgroundUri }}
            style={{ width: "100%", height: 140, borderRadius: 16, marginBottom: 12 }}
          />
        ) : null}
        <Pressable
          accessibilityLabel="배경 사진 선택"
          onPress={() => void handlePick("background")}
          style={{
            borderWidth: 1,
            borderColor: "rgba(143,111,82,0.18)",
            borderRadius: 14,
            padding: 12,
            backgroundColor: "#fff",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>배경 사진 선택</Text>
          <View
            style={{
              borderRadius: 999,
              backgroundColor: "#C9935A",
              paddingHorizontal: 14,
              paddingVertical: 8
            }}
          >
            <Text style={{ color: "#fff8f1", fontSize: 13, fontWeight: "700" }}>업로드</Text>
          </View>
        </Pressable>
      </Card>
      <Card eyebrow="갤러리" title={`현재 ${draft?.payload.photos.gallery.length ?? 0}장`}>
        <Text style={{ color: theme.colors.muted, lineHeight: 22, marginBottom: 12 }}>
          v1에서는 한 장씩 추가하는 방식으로 먼저 연결합니다.
        </Text>
        <Text style={{ color: theme.colors.primaryDark, lineHeight: 22, marginBottom: 12 }}>
          업로드 대기: {draft?.pendingPhotos.length ?? 0}개
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          {draft?.payload.photos.gallery.map((photo) => (
            <Image
              key={photo.order}
              source={{ uri: photo.uri }}
              style={{ width: 92, height: 92, borderRadius: 14 }}
            />
          ))}
        </View>
        <Pressable
          accessibilityLabel="갤러리 사진 추가"
          onPress={() => void handlePick("gallery")}
          style={{
            borderWidth: 1,
            borderColor: "rgba(143,111,82,0.18)",
            borderRadius: 14,
            padding: 12,
            backgroundColor: "#fff",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>갤러리 사진 추가</Text>
          <View
            style={{
              borderRadius: 999,
              backgroundColor: "#C9935A",
              paddingHorizontal: 14,
              paddingVertical: 8
            }}
          >
            <Text style={{ color: "#fff8f1", fontSize: 13, fontWeight: "700" }}>추가</Text>
          </View>
        </Pressable>
      </Card>
      <View style={{ gap: 12, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Link asChild href={{ pathname: "/builder/step2-people", params: localId ? { localId } : {} }}>
            <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
          </Link>
        </View>
        <View style={{ flex: 2 }}>
          <Link asChild href={{ pathname: "/builder/step4-accounts", params: localId ? { localId } : {} }}>
            <Button accessibilityLabel="다음 단계로 이동">다음</Button>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
