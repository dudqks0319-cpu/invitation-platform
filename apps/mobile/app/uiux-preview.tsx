/* eslint-disable jsx-a11y/alt-text */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  type ImageSourcePropType
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TemplateSampleTextOverlay } from "@/components/templates/TemplateSampleTextOverlay";
import { AppText as Text } from "@/components/ui/AppText";
import { theme } from "@/components/ui/theme";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import { getTemplatePreviewSource } from "@/lib/template-image-source";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { shareInvitationLink } from "@/lib/share";
import {
  clampUiuxPreviewStep,
  getUiuxEventTemplates,
  uiuxEventOptions,
  uiuxPreviewSteps,
  type UiuxEventKey
} from "@/lib/uiux-preview-flow";

const invitationFixture = {
  title: "서윤이의 첫돌",
  date: "2026. 09. 12 토요일 12:00",
  venue: "라비에벨 가든홀"
} as const;
const invitationFixtureSlug = "kim-lee-demo";

const eventIcons: Record<UiuxEventKey, keyof typeof Ionicons.glyphMap> = {
  dol: "balloon-outline",
  hwangap: "gift-outline",
  housewarming: "home-outline"
};

function ActionButton({
  children,
  icon,
  onPress,
  variant = "primary"
}: {
  children: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: "primary" | "outline" | "quiet";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === "primary"
          ? styles.actionButtonPrimary
          : variant === "outline"
            ? styles.actionButtonOutline
            : styles.actionButtonQuiet,
        pressed ? styles.pressed : null
      ]}
    >
      {icon ? (
        <Ionicons
          color={variant === "primary" ? "#FFFFFF" : theme.colors.primaryDark}
          name={icon}
          size={20}
        />
      ) : null}
      <Text
        style={[
          styles.actionButtonText,
          variant === "primary" ? styles.actionButtonTextPrimary : styles.actionButtonTextSecondary
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

function SectionCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.sectionCard, style]}>{children}</View>;
}

function Artwork({
  source,
  template,
  compact = false
}: {
  source: ImageSourcePropType | null;
  template: MobileTemplateGalleryItem | null;
  compact?: boolean;
}) {
  return (
    <View style={[styles.artwork, compact ? styles.artworkCompact : null]}>
      {source ? (
        <>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={source}
            style={StyleSheet.absoluteFill}
          />
          {template?.sampleTextOverlay ? (
            <TemplateSampleTextOverlay compact={compact} template={template} />
          ) : null}
        </>
      ) : (
        <View style={styles.artworkFallback}>
          <Ionicons color={theme.colors.primaryDark} name="images-outline" size={28} />
          <Text style={styles.mutedText}>기존 템플릿을 불러오는 중이에요</Text>
        </View>
      )}
    </View>
  );
}

function ScreenHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

function EventScreen({
  category,
  eventTemplates,
  onSelectCategory,
  onContinue
}: {
  category: UiuxEventKey;
  eventTemplates: Record<UiuxEventKey, MobileTemplateGalleryItem | null>;
  onSelectCategory: (category: UiuxEventKey) => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.screenBody}>
      <ScreenHeading
        description="행사를 고르면 문구와 디자인을 추천해드려요"
        eyebrow="오삼오삼"
        title={"어떤 초대를\n만드시나요?"}
      />
      <View style={styles.eventList}>
        {uiuxEventOptions.map((event) => {
          const selected = event.key === category;
          const template = eventTemplates[event.key];
          const previewSource = template ? getTemplatePreviewSource(template) : null;

          return (
            <Pressable
              accessibilityHint="이 행사에 맞는 디자인 추천을 준비합니다."
              accessibilityLabel={`${event.label} 선택`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={event.key}
              onPress={() => onSelectCategory(event.key)}
              style={({ pressed }) => [
                styles.eventCard,
                selected ? styles.eventCardSelected : null,
                pressed ? styles.pressed : null
              ]}
            >
              <View style={styles.eventCopy}>
                <View style={[styles.eventIcon, selected ? styles.eventIconSelected : null]}>
                  <Ionicons
                    color={selected ? "#FFFFFF" : theme.colors.primaryDark}
                    name={eventIcons[event.key]}
                    size={24}
                  />
                </View>
                <Text style={styles.eventTitle}>{event.label}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </View>
              <View style={styles.eventArtwork}>
                {previewSource ? (
                  <Image
                    accessibilityIgnoresInvertColors
                    resizeMode="cover"
                    source={previewSource}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <ActionButton icon="sparkles-outline" onPress={onContinue}>
        추천 디자인 보기
      </ActionButton>
    </View>
  );
}

function TemplatesScreen({
  templates,
  onContinue
}: {
  templates: MobileTemplateGalleryItem[];
  onContinue: () => void;
}) {
  return (
    <View style={styles.screenBody}>
      <ScreenHeading
        description="서윤이의 첫돌에 어울리는 기존 디자인이에요"
        eyebrow="행사별 디자인"
        title="돌잔치 디자인"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {["따뜻한", "단정한", "사진 중심", "글 중심"].map((filter, index) => (
          <View key={filter} style={[styles.filterChip, index === 0 ? styles.filterChipActive : null]}>
            <Text style={[styles.filterText, index === 0 ? styles.filterTextActive : null]}>{filter}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.templateList}>
        {templates.map((template) => (
          <SectionCard key={template.id} style={styles.templateCard}>
            <Artwork
              compact
              source={getTemplatePreviewSource(template)}
              template={template}
            />
            <View style={styles.templateCopy}>
              <Text style={styles.eyebrow}>{template.badge}</Text>
              <Text style={styles.cardTitle}>{template.name}</Text>
              <Text numberOfLines={3} style={styles.mutedText}>{template.desc}</Text>
              <ActionButton onPress={() => {}} variant="outline">전체 보기</ActionButton>
              <ActionButton onPress={onContinue}>이 디자인으로 시작</ActionButton>
            </View>
          </SectionCard>
        ))}
      </View>
    </View>
  );
}

function BuilderScreen({
  source,
  template,
  onContinue
}: {
  source: ImageSourcePropType | null;
  template: MobileTemplateGalleryItem | null;
  onContinue: () => void;
}) {
  return (
    <View style={styles.screenBody}>
      <ScreenHeading
        description="행사의 기본 내용을 입력해 주세요."
        eyebrow="저장됨"
        title="초대장 만들기"
      />
      <View style={styles.progressRow}>
        {["기본 정보", "초대 문구", "사진", "장소·참석 여부", "공개 설정"].map((label, index) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.progressDot, index === 0 ? styles.progressDotActive : null]}>
              <Text style={[styles.progressNumber, index === 0 ? styles.progressNumberActive : null]}>
                {index + 1}
              </Text>
            </View>
            <Text numberOfLines={2} style={styles.progressLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.builderGrid}>
        <View style={styles.fieldList}>
          {[
            ["행사명", invitationFixture.title],
            ["날짜·시간", invitationFixture.date],
            ["장소", invitationFixture.venue]
          ].map(([label, value]) => (
            <View key={label} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <View style={styles.field}>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            </View>
          ))}
          <View style={styles.inlineInfo}>
            <Ionicons color={theme.colors.primaryDark} name="eye-outline" size={18} />
            <Text style={styles.mutedText}>손님에게 이렇게 보여요</Text>
          </View>
        </View>
        <Artwork compact source={source} template={template} />
      </View>
      <ActionButton icon="arrow-forward" onPress={onContinue}>
        다음: 초대 문구
      </ActionButton>
    </View>
  );
}

function LivePreviewScreen({
  source,
  template,
  onContinue
}: {
  source: ImageSourcePropType | null;
  template: MobileTemplateGalleryItem | null;
  onContinue: () => void;
}) {
  const [largeText, setLargeText] = useState(true);
  const [slowMode, setSlowMode] = useState(false);

  return (
    <View style={styles.screenBody}>
      <ScreenHeading
        description="공개 화면과 같은 템플릿을 크기별로 확인해요."
        title="실시간 미리보기"
      />
      <View style={styles.segmented}>
        {["360", "390", "430"].map((width) => (
          <View key={width} style={[styles.segment, width === "390" ? styles.segmentActive : null]}>
            <Text style={[styles.segmentText, width === "390" ? styles.segmentTextActive : null]}>
              {width}
            </Text>
          </View>
        ))}
      </View>
      {[
        {
          icon: "text-outline" as const,
          label: "글자 크게 보기",
          value: largeText,
          onValueChange: setLargeText
        },
        {
          icon: "speedometer-outline" as const,
          label: "저속 모드 미리보기",
          value: slowMode,
          onValueChange: setSlowMode
        }
      ].map((item) => (
        <SectionCard key={item.label} style={styles.switchRow}>
          <View style={styles.inlineInfo}>
            <Ionicons color={theme.colors.primaryDark} name={item.icon} size={21} />
            <Text style={styles.switchLabel}>{item.label}</Text>
          </View>
          <Switch
            accessibilityLabel={item.label}
            onValueChange={item.onValueChange}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            value={item.value}
          />
        </SectionCard>
      ))}
      <View style={styles.previewFrame}>
        <Artwork source={source} template={template} />
      </View>
      <SectionCard style={styles.warningCard}>
        <View style={styles.inlineInfo}>
          <Ionicons color={theme.colors.primaryDark} name="alert-circle-outline" size={22} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>문구가 길어요</Text>
            <Text style={styles.mutedText}>초대 문구를 줄이면 가독성이 더 좋아져요.</Text>
          </View>
          <Text style={styles.linkText}>문구 줄이기</Text>
        </View>
      </SectionCard>
      <ActionButton onPress={onContinue}>게시 전 점검</ActionButton>
    </View>
  );
}

function SafetyScreen({ onContinue }: { onContinue: () => void }) {
  const checks = [
    ["calendar-outline", "날짜와 장소 확인"],
    ["lock-closed-outline", "검색 비공개"],
    ["time-outline", "행사 후 30일 만료"],
    ["card-outline", "계좌번호 접어두기"]
  ] as const;

  return (
    <View style={styles.screenBody}>
      <ScreenHeading
        description="5개 항목 중 4개 확인"
        eyebrow="소중한 정보를 안전하게 보호해요"
        title="게시 전 안심 점검"
      />
      <View style={styles.checkList}>
        {checks.map(([icon, label]) => (
          <SectionCard key={label} style={styles.checkRow}>
            <View style={styles.inlineInfo}>
              <View style={styles.checkIcon}>
                <Ionicons color={theme.colors.primaryDark} name={icon} size={23} />
              </View>
              <Text style={styles.checkLabel}>{label}</Text>
            </View>
            <Ionicons color={theme.colors.success} name="checkmark-circle" size={26} />
          </SectionCard>
        ))}
      </View>
      <SectionCard style={styles.warningCard}>
        <View style={styles.inlineInfo}>
          <View style={styles.warningIcon}>
            <Ionicons color="#B66A2E" name="location-outline" size={23} />
          </View>
          <View style={styles.grow}>
            <Text style={styles.warningTitle}>주소가 공개됩니다</Text>
            <Text style={styles.mutedText}>길찾기와 주소 복사에 사용돼요.</Text>
          </View>
        </View>
        <ActionButton onPress={() => {}} variant="outline">공개 범위 확인</ActionButton>
      </SectionCard>
      <SectionCard>
        <View style={styles.inlineInfo}>
          <Ionicons color={theme.colors.success} name="shield-checkmark-outline" size={25} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>링크를 가진 사람만 볼 수 있어요</Text>
            <Text style={styles.mutedText}>검색 결과에는 나오지 않아요.</Text>
          </View>
        </View>
      </SectionCard>
      <ActionButton icon="shield-checkmark-outline" onPress={onContinue}>
        안심하고 게시하기
      </ActionButton>
    </View>
  );
}

function ShareScreen({
  source,
  template,
  onContinue
}: {
  source: ImageSourcePropType | null;
  template: MobileTemplateGalleryItem | null;
  onContinue: () => void;
}) {
  const [sharing, setSharing] = useState(false);
  const shareActions = [
    ["chatbubble-outline", "카카오톡"],
    ["link-outline", "링크 복사"],
    ["chatbox-outline", "문자"],
    ["qr-code-outline", "QR 저장"]
  ] as const;

  async function shareToKakao() {
    if (sharing) return;

    setSharing(true);

    try {
      await shareInvitationLink(invitationFixtureSlug, invitationFixture.title);
    } catch {
      Alert.alert("보내기 실패", "카카오톡 보내기 화면을 열지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={styles.screenBody}>
      <ScreenHeading
        description="이제 소중한 분들께 공유해보세요."
        eyebrow="게시 완료"
        title="초대장이 게시됐어요"
      />
      <SectionCard style={styles.privacySummary}>
        <View style={styles.summaryItem}>
          <Ionicons color={theme.colors.success} name="lock-closed-outline" size={22} />
          <Text style={styles.cardTitle}>검색 비공개</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons color={theme.colors.primaryDark} name="calendar-outline" size={22} />
          <Text style={styles.cardTitle}>2026. 10. 12 만료</Text>
        </View>
      </SectionCard>
      <SectionCard>
        <Text style={styles.fieldLabel}>메신저 미리보기</Text>
        <View style={styles.messagePreview}>
          <Artwork compact source={source} template={template} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{invitationFixture.title}</Text>
            <Text style={styles.mutedText}>{invitationFixture.date}</Text>
            <Text style={styles.mutedText}>{invitationFixture.venue}</Text>
          </View>
        </View>
      </SectionCard>
      <View style={styles.shareGrid}>
        {shareActions.map(([icon, label]) => (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ disabled: label !== "카카오톡" || sharing }}
            disabled={label !== "카카오톡" || sharing}
            key={label}
            onPress={() => void shareToKakao()}
            style={({ pressed }) => [
              styles.shareAction,
              label !== "카카오톡" ? styles.shareActionDisabled : null,
              pressed ? styles.pressed : null
            ]}
          >
            <Ionicons color={theme.colors.primaryDark} name={icon} size={26} />
            <Text style={styles.shareActionLabel}>{label === "카카오톡" && sharing ? "여는 중..." : label}</Text>
          </Pressable>
        ))}
      </View>
      <SectionCard>
        {[
          ["refresh-outline", "링크 회수", "공유한 링크를 즉시 비공개로 전환해요"],
          ["add-circle-outline", "새 링크 만들기", "새 링크를 만들어 다시 공유해요"]
        ].map(([icon, title, description]) => (
          <View key={title} style={styles.manageRow}>
            <Ionicons color={theme.colors.primaryDark} name={icon as keyof typeof Ionicons.glyphMap} size={23} />
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.mutedText}>{description}</Text>
            </View>
            <Ionicons color={theme.colors.muted} name="chevron-forward" size={20} />
          </View>
        ))}
      </SectionCard>
      <ActionButton onPress={onContinue}>초대장 관리하기</ActionButton>
    </View>
  );
}

function ManageScreen({
  source,
  template,
  onContinue
}: {
  source: ImageSourcePropType | null;
  template: MobileTemplateGalleryItem | null;
  onContinue: () => void;
}) {
  return (
    <View style={styles.screenBody}>
      <ScreenHeading
        description="저장한 초대장과 참석 현황을 한곳에서 관리합니다."
        eyebrow="오삼오삼"
        title="내 초대장"
      />
      <SectionCard style={styles.invitationSummary}>
        <Artwork compact source={source} template={template} />
        <View style={styles.grow}>
          <Text style={styles.cardTitle}>{invitationFixture.title}</Text>
          <View style={styles.statusPill}><Text style={styles.statusText}>게시 중</Text></View>
          <Text style={styles.mutedText}>행사까지 18일</Text>
        </View>
        <Ionicons color={theme.colors.ink} name="chevron-forward" size={24} />
      </SectionCard>
      <SectionCard style={styles.rsvpSummary}>
        {[
          ["참석", "24명"],
          ["미정", "6명"],
          ["불참", "3명"]
        ].map(([label, value], index) => (
          <View key={label} style={[styles.rsvpItem, index > 0 ? styles.rsvpItemBorder : null]}>
            <Text style={styles.mutedText}>{label}</Text>
            <Text style={styles.rsvpValue}>{value}</Text>
          </View>
        ))}
      </SectionCard>
      <SectionCard>
        <Text style={styles.fieldLabel}>참석 현황</Text>
        <View style={styles.rsvpBar}>
          <View style={styles.rsvpBarAttend} />
          <View style={styles.rsvpBarMaybe} />
          <View style={styles.rsvpBarDecline} />
        </View>
        <Text style={styles.mutedText}>참석 73% · 미정 18% · 불참 9%</Text>
      </SectionCard>
      <SectionCard>
        {["최근 응답 보기", "링크 공유", "내용 수정", "만료·삭제 관리"].map((label, index) => (
          <View key={label} style={styles.manageRow}>
            <Ionicons
              color={theme.colors.primaryDark}
              name={(["list-outline", "link-outline", "create-outline", "trash-outline"] as const)[index]}
              size={22}
            />
            <Text style={[styles.cardTitle, styles.grow]}>{label}</Text>
            <Ionicons color={theme.colors.muted} name="chevron-forward" size={20} />
          </View>
        ))}
      </SectionCard>
      <View style={styles.inlineInfo}>
        <Ionicons color={theme.colors.success} name="lock-closed-outline" size={19} />
        <Text style={styles.mutedText}>게스트 목록 비공개</Text>
      </View>
      <ActionButton onPress={onContinue}>게스트 화면 보기</ActionButton>
    </View>
  );
}

function GuestScreen({
  source,
  template,
  onRestart
}: {
  source: ImageSourcePropType | null;
  template: MobileTemplateGalleryItem | null;
  onRestart: () => void;
}) {
  return (
    <View style={styles.guestScreen}>
      <Artwork source={source} template={template} />
      <View style={styles.guestCopy}>
        <Text style={styles.guestTitle}>{invitationFixture.title}</Text>
        <View style={styles.guestDetail}>
          <Ionicons color={theme.colors.primaryDark} name="calendar-outline" size={22} />
          <Text style={styles.guestDetailText}>{invitationFixture.date}</Text>
        </View>
        <View style={styles.guestDetail}>
          <Ionicons color={theme.colors.primaryDark} name="location-outline" size={22} />
          <Text style={styles.guestDetailText}>{invitationFixture.venue}</Text>
        </View>
      </View>
      <ActionButton icon="checkmark-circle-outline" onPress={() => {}}>
        참석 여부 알려주기
      </ActionButton>
      <ActionButton icon="navigate-outline" onPress={() => {}} variant="outline">
        길찾기 · 주소 복사
      </ActionButton>
      <ActionButton icon="calendar-outline" onPress={() => {}} variant="quiet">
        캘린더에 저장
      </ActionButton>
      <SectionCard>
        {["초대의 말씀", "선물 · 계좌 보기"].map((label, index) => (
          <View key={label} style={styles.manageRow}>
            <Ionicons
              color={theme.colors.primaryDark}
              name={index === 0 ? "flower-outline" : "gift-outline"}
              size={22}
            />
            <Text style={[styles.cardTitle, styles.grow]}>{label}</Text>
            <Ionicons color={theme.colors.muted} name="chevron-down" size={20} />
          </View>
        ))}
      </SectionCard>
      <Text style={styles.expiryText}>이 초대장은 행사 후 30일 뒤 만료됩니다</Text>
      <ActionButton onPress={onRestart} variant="outline">처음부터 다시 보기</ActionButton>
    </View>
  );
}

export default function UiuxPreviewScreen() {
  const router = useRouter();
  const { templates } = useTemplateCatalog();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<UiuxEventKey>("dol");
  const eventTemplates = useMemo(
    () => ({
      dol: getUiuxEventTemplates(templates, "dol", 1)[0] ?? null,
      hwangap: getUiuxEventTemplates(templates, "hwangap", 1)[0] ?? null,
      housewarming: getUiuxEventTemplates(templates, "housewarming", 1)[0] ?? null
    }),
    [templates]
  );
  const selectedTemplates = useMemo(
    () => getUiuxEventTemplates(templates, selectedCategory, 2),
    [selectedCategory, templates]
  );
  const selectedTemplate = selectedTemplates[0] ?? eventTemplates.dol ?? templates[0] ?? null;
  const selectedSource = selectedTemplate ? getTemplatePreviewSource(selectedTemplate) : null;
  const step = uiuxPreviewSteps[stepIndex];

  function goToStep(index: number) {
    setStepIndex(clampUiuxPreviewStep(index));
  }

  function renderStep() {
    switch (step.id) {
      case "event":
        return (
          <EventScreen
            category={selectedCategory}
            eventTemplates={eventTemplates}
            onContinue={() => goToStep(1)}
            onSelectCategory={setSelectedCategory}
          />
        );
      case "templates":
        return <TemplatesScreen onContinue={() => goToStep(2)} templates={selectedTemplates} />;
      case "builder":
        return (
          <BuilderScreen
            onContinue={() => goToStep(3)}
            source={selectedSource}
            template={selectedTemplate}
          />
        );
      case "preview":
        return (
          <LivePreviewScreen
            onContinue={() => goToStep(4)}
            source={selectedSource}
            template={selectedTemplate}
          />
        );
      case "safety":
        return <SafetyScreen onContinue={() => goToStep(5)} />;
      case "share":
        return (
          <ShareScreen
            onContinue={() => goToStep(6)}
            source={selectedSource}
            template={selectedTemplate}
          />
        );
      case "manage":
        return (
          <ManageScreen
            onContinue={() => goToStep(7)}
            source={selectedSource}
            template={selectedTemplate}
          />
        );
      case "guest":
        return (
          <GuestScreen
            onRestart={() => goToStep(0)}
            source={selectedSource}
            template={selectedTemplate}
          />
        );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityHint={stepIndex === 0 ? "홈 화면으로 돌아갑니다." : "이전 미리보기 화면으로 돌아갑니다."}
          accessibilityLabel="뒤로가기"
          accessibilityRole="button"
          onPress={() => {
            if (stepIndex === 0) {
              router.back();
              return;
            }
            goToStep(stepIndex - 1);
          }}
          style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
        >
          <Ionicons color={theme.colors.ink} name="chevron-back" size={22} />
        </Pressable>
        <View style={styles.topBarTitle}>
          <Text style={styles.topBarEyebrow}>오삼오삼</Text>
          <Text numberOfLines={1} style={styles.topBarText}>{step.title}</Text>
        </View>
        <View style={styles.stepCounter}>
          <Text style={styles.stepCounterText}>{stepIndex + 1}/{uiuxPreviewSteps.length}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        key={step.id}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
        <View accessibilityLabel={`전체 ${uiuxPreviewSteps.length}단계 중 ${stepIndex + 1}단계`} style={styles.stepDots}>
          {uiuxPreviewSteps.map((previewStep, index) => (
            <Pressable
              accessibilityLabel={`${index + 1}단계 ${previewStep.title}`}
              accessibilityRole="button"
              accessibilityState={{ selected: index === stepIndex }}
              key={previewStep.id}
              onPress={() => goToStep(index)}
              style={styles.stepDotButton}
            >
              <View
                style={[
                  styles.stepDot,
                  index === stepIndex ? styles.stepDotActive : null
                ]}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  topBar: {
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.96)"
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface
  },
  topBarTitle: {
    flex: 1,
    gap: 2
  },
  topBarEyebrow: {
    color: theme.colors.primaryDark,
    fontSize: 11,
    fontWeight: "800"
  },
  topBarText: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  stepCounter: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight
  },
  stepCounterText: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: "800"
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40
  },
  screenBody: {
    gap: 18
  },
  guestScreen: {
    gap: 14
  },
  heading: {
    gap: 9
  },
  eyebrow: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: "800"
  },
  title: {
    color: theme.colors.ink,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 44
  },
  description: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 25
  },
  eventList: {
    gap: 12
  },
  eventCard: {
    minHeight: 140,
    flexDirection: "row",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    ...theme.shadow.card
  },
  eventCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2
  },
  eventCopy: {
    flex: 1.1,
    padding: 18,
    gap: 7,
    justifyContent: "center"
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  eventIconSelected: {
    backgroundColor: theme.colors.primary
  },
  eventTitle: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "800"
  },
  eventDescription: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  eventArtwork: {
    flex: 0.9,
    backgroundColor: theme.colors.surfaceSoft
  },
  actionButton: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  actionButtonPrimary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.heroButton
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface
  },
  actionButtonQuiet: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  actionButtonTextPrimary: {
    color: "#FFFFFF"
  },
  actionButtonTextSecondary: {
    color: theme.colors.primaryDark
  },
  pressed: {
    opacity: 0.76
  },
  filterRow: {
    gap: 8,
    paddingRight: 18
  },
  filterChip: {
    minHeight: 44,
    paddingHorizontal: 17,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  filterText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  filterTextActive: {
    color: "#FFFFFF"
  },
  templateList: {
    gap: 14
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center"
  },
  templateCopy: {
    flex: 1,
    gap: 8
  },
  sectionCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
    gap: 12,
    ...theme.shadow.card
  },
  cardTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22
  },
  mutedText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  artwork: {
    width: "100%",
    aspectRatio: 941 / 1672,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    overflow: "hidden"
  },
  artworkCompact: {
    width: 132
  },
  artworkFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4
  },
  progressItem: {
    flex: 1,
    alignItems: "center",
    gap: 6
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  progressDotActive: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink
  },
  progressNumber: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  progressNumberActive: {
    color: "#FFFFFF"
  },
  progressLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center"
  },
  builderGrid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  fieldList: {
    flex: 1,
    gap: 12
  },
  fieldGroup: {
    gap: 6
  },
  fieldLabel: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: "800"
  },
  field: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 13,
    justifyContent: "center"
  },
  fieldValue: {
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 20
  },
  inlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  grow: {
    flex: 1
  },
  segmented: {
    minHeight: 48,
    flexDirection: "row",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 4
  },
  segment: {
    flex: 1,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentActive: {
    backgroundColor: theme.colors.primary
  },
  segmentText: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  segmentTextActive: {
    color: "#FFFFFF"
  },
  switchRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  switchLabel: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "700"
  },
  previewFrame: {
    width: "76%",
    alignSelf: "center",
    borderRadius: theme.radius.lg,
    borderWidth: 8,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    ...theme.shadow.card
  },
  warningCard: {
    borderColor: "#E9C9A9",
    backgroundColor: "#FFF9F0"
  },
  linkText: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: "800"
  },
  checkList: {
    gap: 10
  },
  checkRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  checkIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  checkLabel: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "700"
  },
  warningIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF0DD",
    alignItems: "center",
    justifyContent: "center"
  },
  warningTitle: {
    color: "#9A5928",
    fontSize: 17,
    fontWeight: "800"
  },
  privacySummary: {
    flexDirection: "row",
    alignItems: "center"
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 7
  },
  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: theme.colors.border
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  shareGrid: {
    flexDirection: "row",
    gap: 8
  },
  shareAction: {
    flex: 1,
    minHeight: 92,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 7
  },
  shareActionDisabled: {
    opacity: 0.45
  },
  shareActionLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  },
  manageRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border
  },
  invitationSummary: {
    flexDirection: "row",
    alignItems: "center"
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  statusText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: "800"
  },
  rsvpSummary: {
    flexDirection: "row",
    paddingHorizontal: 0
  },
  rsvpItem: {
    flex: 1,
    alignItems: "center",
    gap: 6
  },
  rsvpItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border
  },
  rsvpValue: {
    color: theme.colors.ink,
    fontSize: 23,
    fontWeight: "800"
  },
  rsvpBar: {
    height: 12,
    flexDirection: "row",
    borderRadius: 6,
    overflow: "hidden"
  },
  rsvpBarAttend: {
    flex: 73,
    backgroundColor: theme.colors.primary
  },
  rsvpBarMaybe: {
    flex: 18,
    backgroundColor: theme.colors.primaryLight
  },
  rsvpBarDecline: {
    flex: 9,
    backgroundColor: theme.colors.rose
  },
  guestCopy: {
    alignItems: "center",
    gap: 13,
    paddingVertical: 10
  },
  guestTitle: {
    color: theme.colors.ink,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 43,
    textAlign: "center"
  },
  guestDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  guestDetailText: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "700"
  },
  expiryText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center"
  },
  stepDots: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  stepDotButton: {
    width: 44,
    height: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  stepDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border
  },
  stepDotActive: {
    width: 36,
    backgroundColor: theme.colors.primary
  }
});
