/* eslint-disable jsx-a11y/alt-text */

import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";
import { MAX_GALLERY_PHOTOS } from "@/lib/invitation-shared";

type PhotoSlot = "main" | "background" | "gallery";

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

function UploadedPhotoPreview({
  height,
  label,
  onRemove,
  uri
}: {
  height: number;
  label: string;
  onRemove: () => void;
  uri: string;
}) {
  return (
    <View style={{ marginBottom: 12, position: "relative" }}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={label}
        source={{ uri }}
        style={{ width: "100%", height, borderRadius: 16 }}
      />
      <Pressable
        accessibilityLabel={`${label} 삭제`}
        accessibilityRole="button"
        onPress={onRemove}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          minWidth: 58,
          minHeight: 40,
          borderRadius: 999,
          backgroundColor: "rgba(44,44,44,0.78)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 14
        }}
      >
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>삭제</Text>
      </Pressable>
    </View>
  );
}

function PhotoActionButton({
  label,
  pending,
  onPress
}: {
  label: string;
  pending: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: pending ? theme.colors.primary : "rgba(143,111,82,0.18)",
        borderRadius: 14,
        padding: 12,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>
        {pending ? `${label} 처리 중...` : label}
      </Text>
      <View
        style={{
          borderRadius: 999,
          backgroundColor: pending ? theme.colors.primaryDark : "#C9935A",
          paddingHorizontal: 14,
          paddingVertical: 8
        }}
      >
        <Text style={{ color: "#fff8f1", fontSize: 13, fontWeight: "700" }}>
          {pending ? "처리 중" : label.includes("추가") ? "추가" : "업로드"}
        </Text>
      </View>
    </Pressable>
  );
}

export default function BuilderStep3PhotosScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { addGalleryPhoto, draft, removeGalleryPhoto, removePhoto, updatePhoto } = useInvitationDraft("local-preview-owner", localId);
  const [pendingSlot, setPendingSlot] = useState<"" | PhotoSlot>("");
  const [error, setError] = useState("");
  const galleryPhotos = draft?.payload.photos.gallery ?? [];

  async function handlePick(slot: PhotoSlot) {
    setError("");
    setPendingSlot(slot);

    try {
      if (slot === "gallery" && galleryPhotos.length >= MAX_GALLERY_PHOTOS) {
        throw new Error(`갤러리 사진은 최대 ${MAX_GALLERY_PHOTOS}장까지 추가할 수 있습니다.`);
      }

      const localUri = await pickPreparedImage();
      if (!localUri) return;

      if (slot === "gallery") {
        addGalleryPhoto(localUri);
        return;
      }

      updatePhoto(slot, localUri);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "사진을 준비하지 못했습니다.");
    } finally {
      setPendingSlot("");
    }
  }

  return (
    <Screen subtitle="메인, 배경, 갤러리 사진을 로컬 초안에 연결하고 무료 발행에 반영합니다." title="초대장 만들기">
      <StepIndicator current={3} title="사진 설정" />
      {error ? (
        <Card eyebrow="사진 준비" title="작업 실패">
          <Text style={{ color: theme.colors.primaryDark, lineHeight: 22 }}>{error}</Text>
        </Card>
      ) : null}
      <Card eyebrow="메인 사진" title="대표 사진">
        {draft?.payload.photos.mainUri ? (
          <UploadedPhotoPreview
            height={180}
            label="대표 사진 미리보기"
            onRemove={() => removePhoto("main")}
            uri={draft.payload.photos.mainUri}
          />
        ) : null}
        <PhotoActionButton
          label="메인 사진 선택"
          onPress={() => void handlePick("main")}
          pending={pendingSlot === "main"}
        />
      </Card>
      <Card eyebrow="배경 사진" title="커버 배경">
        {draft?.payload.photos.backgroundUri ? (
          <UploadedPhotoPreview
            height={140}
            label="배경 사진 미리보기"
            onRemove={() => removePhoto("background")}
            uri={draft.payload.photos.backgroundUri}
          />
        ) : null}
        <PhotoActionButton
          label="배경 사진 선택"
          onPress={() => void handlePick("background")}
          pending={pendingSlot === "background"}
        />
      </Card>
      <Card eyebrow="갤러리" title={`현재 ${galleryPhotos.length}/${MAX_GALLERY_PHOTOS}장`}>
        <Text style={{ color: theme.colors.muted, lineHeight: 22, marginBottom: 12 }}>
          한 장씩 추가해 초대장 갤러리에 연결합니다.
        </Text>
        <Text style={{ color: theme.colors.primaryDark, lineHeight: 22, marginBottom: 12 }}>
          업로드 대기: {draft?.pendingPhotos.length ?? 0}개
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          {galleryPhotos.map((photo) => (
            <View key={photo.order} style={{ position: "relative" }}>
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel="갤러리 사진 미리보기"
                source={{ uri: photo.uri }}
                style={{ width: 92, height: 92, borderRadius: 14 }}
              />
              <Pressable
                accessibilityLabel="갤러리 사진 삭제"
                onPress={() => removeGalleryPhoto(photo.order)}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "rgba(44,44,44,0.72)",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <PhotoActionButton
          label={galleryPhotos.length >= MAX_GALLERY_PHOTOS ? "갤러리 최대 장수 도달" : "갤러리 사진 추가"}
          onPress={() => void handlePick("gallery")}
          pending={pendingSlot === "gallery"}
        />
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
