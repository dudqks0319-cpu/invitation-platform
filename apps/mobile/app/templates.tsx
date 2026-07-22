/* eslint-disable jsx-a11y/alt-text */

import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pill } from "@/components/ui/Pill";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";
import { getDraftOwnerId } from "@/lib/auth-access";
import { createAndPersistDraft } from "@/lib/drafts";
import { mobileTemplateCategories, mobileTemplateGallery, type MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { getInviteHubBaseUrl } from "@/lib/web-links";
import { getBundledTemplatePreviewSource } from "@/lib/template-preview-source";

function getTemplatePreviewUrl(template: MobileTemplateGalleryItem) {
  if (!template.previewPath) return null;
  if (template.previewPath.startsWith("http")) return template.previewPath;
  return `${getInviteHubBaseUrl()}${template.previewPath}`;
}

function getTemplatePreviewSource(template: MobileTemplateGalleryItem) {
  const bundledSource = getBundledTemplatePreviewSource(template.id);
  if (bundledSource) {
    return bundledSource;
  }

  const imageUrl = getTemplatePreviewUrl(template);
  return imageUrl ? { uri: imageUrl } : null;
}

const templateSampleCopy = {
  wedding: {
    headline: "We are getting married",
    badge: "결혼식",
    title: "이준서 ♥ 김은재",
    date: "2026.09.20 SUN 12:30",
    venue: "라비에벨 가든홀"
  },
  dol: {
    headline: "Our first birthday",
    badge: "돌잔치",
    title: "도윤이의 첫돌",
    date: "2026.09.20 SUN 12:30",
    venue: "라움 패밀리홀"
  },
  hwangap: {
    headline: "Happy 60th Birthday",
    badge: "환갑잔치",
    title: "아버지의 환갑",
    date: "2026.10.18 SUN 12:00",
    venue: "더채플 연회장"
  },
  bridal: {
    headline: "Bride to be",
    badge: "브라이덜샤워",
    title: "은채의 브라이덜샤워",
    date: "2026.08.29 SAT 14:00",
    venue: "가든 스튜디오"
  },
  birthday: {
    headline: "Happy Birthday",
    badge: "생일파티",
    title: "서윤이의 생일",
    date: "2026.09.12 SAT 17:00",
    venue: "루프탑 파티룸"
  },
  housewarming: {
    headline: "Welcome Home",
    badge: "집들이",
    title: "새집에 초대합니다",
    date: "2026.09.05 SAT 18:00",
    venue: "서울 성동구 새빛로 53"
  },
  baby: {
    headline: "Welcome, Little One",
    badge: "베이비샤워",
    title: "아기를 기다려요",
    date: "2026.10.03 SAT 13:00",
    venue: "클라우드 스튜디오"
  },
  graduation: {
    headline: "Congratulations",
    badge: "졸업파티",
    title: "졸업을 축하해요",
    date: "2027.02.19 FRI 11:00",
    venue: "한빛대학교 강당"
  },
  business: {
    headline: "Grand Opening",
    badge: "비즈니스",
    title: "OPENING DAY",
    date: "2026.09.25 FRI 18:30",
    venue: "오삼오삼 라운지"
  }
} as const;

const templateSampleSafeZones = {
  wedding: { top: "25%", bottom: "40%" },
  dol: { top: "22%", bottom: "43%" },
  hwangap: { top: "16%", bottom: "54%" },
  bridal: { top: "24%", bottom: "41%" },
  birthday: { top: "20%", bottom: "45%" },
  housewarming: { top: "15%", bottom: "50%" },
  baby: { top: "25%", bottom: "40%" },
  graduation: { top: "22%", bottom: "43%" },
  business: { top: "22%", bottom: "43%" }
} as const;

function TemplateSampleTextOverlay({ category }: { category: string }) {
  const copy = templateSampleCopy[category as keyof typeof templateSampleCopy] ?? templateSampleCopy.wedding;
  const safeZone = templateSampleSafeZones[category as keyof typeof templateSampleSafeZones] ?? templateSampleSafeZones.wedding;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 8,
        right: 8,
        top: safeZone.top,
        bottom: safeZone.bottom,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "rgba(126,91,65,0.76)",
          fontSize: 8,
          fontStyle: "italic",
          fontWeight: "600",
          letterSpacing: 0,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.headline}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "rgba(198,144,114,0.9)",
          fontSize: 8,
          fontWeight: "800",
          letterSpacing: 0,
          marginTop: 2,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.badge}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "#2B2B2B",
          fontSize: 16,
          fontWeight: "900",
          letterSpacing: 0,
          lineHeight: 18,
          marginTop: 2,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.title}
      </Text>
      <View style={{ width: 36, height: 1, backgroundColor: "rgba(198,144,114,0.42)", marginVertical: 3 }} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "#2B2B2B",
          fontSize: 8,
          fontWeight: "900",
          letterSpacing: 0,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.date}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "rgba(55,55,55,0.78)",
          fontSize: 8,
          fontWeight: "800",
          letterSpacing: 0,
          marginTop: 2,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.venue}
      </Text>
    </View>
  );
}

export default function TemplatesScreen() {
  const router = useRouter();
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const { status, user } = useAuth();
  const { width } = useWindowDimensions();
  const draftOwnerId = getDraftOwnerId(status === "authenticated" ? user : null);
  const [category, setCategory] = useState<string>(() => {
    const categoryParam = Array.isArray(initialCategory) ? initialCategory[0] : initialCategory;
    return mobileTemplateCategories.some((item) => item.key === categoryParam)
      ? categoryParam
      : mobileTemplateCategories[0].key;
  });
  const cardWidth = Math.max(148, Math.floor((width - 54) / 2));

  const filteredTemplates = useMemo(
    () => mobileTemplateGallery.filter((template) => template.category === category),
    [category]
  );

  async function handleUseTemplate(template: MobileTemplateGalleryItem) {
    const draft = await createAndPersistDraft(draftOwnerId, {
      templateId: template.id,
      eventType: template.category,
      title: `${template.badge} 초대장`
    });
    router.push({ pathname: "/builder/step1-basic", params: { localId: draft.localId } });
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 20, paddingBottom: 36 }}>
        <View
          style={{
            height: 68,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Pressable
            accessibilityLabel="뒤로가기"
            onPress={handleBack}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.92)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: theme.colors.border
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>‹</Text>
          </Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>디자인 둘러보기</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
          {mobileTemplateCategories.find((item) => item.key === category)?.label ?? "초대장"} 디자인 {filteredTemplates.length}개를 볼 수 있습니다.
          고르면 편집 화면에서 이름, 날짜, 장소만 바꾸면 됩니다.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingRight: 8 }}
        >
          {mobileTemplateCategories.map((item) => (
            <Pressable
              key={item.key}
              accessibilityLabel={`${item.label} 템플릿 보기`}
              accessibilityRole="button"
              accessibilityState={{ selected: item.key === category }}
              onPress={() => setCategory(item.key)}
            >
              <Pill active={item.key === category} label={`${item.emoji} ${item.label}`} />
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {filteredTemplates.map((template) => {
            const previewSource = getTemplatePreviewSource(template);
            const isDarkFallback = template.id === "business-dark";
            return (
              <Pressable
                accessibilityLabel={`${template.name} 템플릿으로 시작`}
                accessibilityRole="button"
                key={template.id}
                onPress={() => void handleUseTemplate(template)}
                style={{
                  width: cardWidth,
                  backgroundColor: "#fff",
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  overflow: "hidden",
                  shadowColor: theme.shadow.card.shadowColor,
                  shadowOffset: { width: 0, height: 14 },
                  shadowOpacity: 1,
                  shadowRadius: 26,
                  elevation: 5
                }}
              >
                <View
                  style={{
                    height: 236,
                    backgroundColor: "#F7EFE6",
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {previewSource ? (
                    <View style={{ height: "100%", aspectRatio: 941 / 1672, borderRadius: 18, overflow: "hidden" }}>
                      <Image
                        accessibilityIgnoresInvertColors
                        accessibilityLabel={`${template.name} 템플릿 미리보기`}
                        source={previewSource}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                      {template.sampleTextOverlay ? <TemplateSampleTextOverlay category={template.category} /> : null}
                    </View>
                  ) : (
                    <View
                      style={{
                        width: "72%",
                        aspectRatio: 0.58,
                        borderRadius: 28,
                        backgroundColor: isDarkFallback ? "#111827" : "rgba(255,250,244,0.92)",
                        borderWidth: 1,
                        borderColor: isDarkFallback ? "rgba(214,179,106,0.42)" : "rgba(172,137,102,0.12)",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 18
                      }}
                    >
                      <Text
                        style={{
                          color: isDarkFallback ? "#D6B36A" : "#b28a5f",
                          fontSize: 12,
                          letterSpacing: 0,
                          textAlign: "center"
                        }}
                      >
                        {isDarkFallback ? "PREMIUM EVENT" : "INVITATION"}
                      </Text>
                      <Text
                        style={{
                          color: isDarkFallback ? "#F5E7C8" : "#7d5d42",
                          fontSize: 28,
                          fontStyle: "italic",
                          marginTop: 12,
                          textAlign: "center"
                        }}
                      >
                        {template.name}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ padding: 14, gap: 9 }}>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: theme.colors.primaryLight,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 6
                    }}
                  >
                    <Text style={{ color: theme.colors.primaryDark, fontSize: 12, fontWeight: "700" }}>{template.badge}</Text>
                  </View>
                  <Text style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "800", lineHeight: 23 }}>{template.name}</Text>
                  <Text numberOfLines={2} style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 19 }}>
                    {template.desc}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {template.tags.slice(0, 2).map((tag) => (
                      <View
                        key={tag}
                        style={{
                          borderRadius: 999,
                          backgroundColor: theme.colors.surfaceSoft,
                          paddingHorizontal: 12,
                          paddingVertical: 7
                        }}
                      >
                        <Text style={{ color: theme.colors.textLight, fontSize: 13, fontWeight: "600" }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
