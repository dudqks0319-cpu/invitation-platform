export type ImageInvitationEventType =
  | "wedding"
  | "first-birthday"
  | "birthday"
  | "housewarming"
  | "gathering"
  | "other";

export type ImageInvitationTone =
  | "emotional"
  | "luxury"
  | "cute"
  | "simple"
  | "formal"
  | "casual";

export type ImageInvitationPlacement = "top" | "center" | "bottom" | "left" | "right";

export type ImageInvitationInfo = {
  groomName?: string;
  brideName?: string;
  childName?: string;
  parentNames?: string;
  birthdayName?: string;
  gatheringName?: string;
  date?: string;
  time?: string;
  venue?: string;
  feeOrSupplies?: string;
  customTitle?: string;
};

export type GeneratedInvitationCopy = {
  title: string;
  subtitle: string;
  body: string;
  dateLine: string;
  venueLine: string;
};

export type ImageZoneStats = {
  brightness: number;
  complexity: number;
};

export type ImageZoneMap = Record<ImageInvitationPlacement, ImageZoneStats>;

export type ReadableTextRecommendation = {
  color: "#222222" | "#FFFFFF";
  shadowEnabled: boolean;
  gradientEnabled: boolean;
};

export const imageInvitationEventTypes: Array<{
  value: ImageInvitationEventType;
  label: string;
}> = [
  { value: "wedding", label: "결혼식" },
  { value: "first-birthday", label: "돌잔치" },
  { value: "birthday", label: "생일" },
  { value: "housewarming", label: "집들이" },
  { value: "gathering", label: "모임/회식" },
  { value: "other", label: "기타 초대장" }
];

export const imageInvitationTones: Array<{
  value: ImageInvitationTone;
  label: string;
}> = [
  { value: "emotional", label: "감성적인" },
  { value: "luxury", label: "고급스러운" },
  { value: "cute", label: "귀여운" },
  { value: "simple", label: "심플한" },
  { value: "formal", label: "정중한" },
  { value: "casual", label: "캐주얼한" }
];

const fallbackTitles: Record<ImageInvitationEventType, string> = {
  wedding: "결혼식 초대장",
  "first-birthday": "돌잔치 초대장",
  birthday: "생일 초대장",
  housewarming: "집들이 초대장",
  gathering: "모임 초대장",
  other: "초대장"
};

const subtitlesByTone: Record<ImageInvitationTone, string> = {
  emotional: "소중한 분들을 초대합니다",
  luxury: "An Invitation",
  cute: "함께해 주세요",
  simple: "Invitation",
  formal: "정중히 모십니다",
  casual: "우리 이날 만나요"
};

const bodyByTone: Record<ImageInvitationTone, Record<ImageInvitationEventType, string>> = {
  emotional: {
    wedding: "서로의 가장 좋은 계절이 되어\n한 걸음씩 함께 걸어가려 합니다.",
    "first-birthday": "처음 맞는 생일의 따뜻한 순간을\n함께 나누고 싶습니다.",
    birthday: "한 해의 소중한 날을\n좋아하는 사람들과 함께 보내고 싶습니다.",
    housewarming: "새로운 공간에 담긴 첫 마음을\n가까운 분들과 나누고 싶습니다.",
    gathering: "좋은 사람들과 오래 기억할 시간을\n함께 만들고 싶습니다.",
    other: "소중한 자리에 귀한 분들을\n정성껏 초대합니다."
  },
  luxury: {
    wedding: "아름다운 약속의 자리에\n귀한 걸음으로 함께해 주세요.",
    "first-birthday": "아이의 첫 번째 기념일을\n품격 있게 함께 기념해 주세요.",
    birthday: "특별한 하루를 위해\n정성껏 자리를 마련했습니다.",
    housewarming: "새로운 공간에서 시작되는 시간을\n품격 있게 나누고자 합니다.",
    gathering: "정성껏 준비한 자리에\n귀한 분들을 모십니다.",
    other: "의미 있는 자리에\n귀한 분들을 초대합니다."
  },
  cute: {
    wedding: "두 사람이 같이 걷는 첫날,\n웃음 가득 축하해 주세요.",
    "first-birthday": "우리 아이의 첫 생일파티에\n놀러 와 주세요.",
    birthday: "케이크보다 더 반가운 얼굴들,\n함께 모여 축하해 주세요.",
    housewarming: "새집 구경 오세요.\n맛있는 것과 웃음을 준비할게요.",
    gathering: "오랜만에 모여서\n즐겁게 이야기 나눠요.",
    other: "즐거운 자리에\n반가운 마음으로 초대해요."
  },
  simple: {
    wedding: "저희의 시작을 함께 축복해 주세요.",
    "first-birthday": "첫 생일을 함께 축하해 주세요.",
    birthday: "생일 자리에 초대합니다.",
    housewarming: "새 집에 초대합니다.",
    gathering: "모임에 초대합니다.",
    other: "초대합니다."
  },
  formal: {
    wedding: "저희 두 사람이 새 출발을 하는 자리에\n정중히 모시고자 합니다.",
    "first-birthday": "아이의 첫 생일을 기념하는 자리에\n정중히 모시고자 합니다.",
    birthday: "기념일을 함께하는 자리에\n정중히 초대합니다.",
    housewarming: "새 보금자리를 마련하여\n귀한 분들을 모시고자 합니다.",
    gathering: "뜻깊은 모임의 자리에\n정중히 초대합니다.",
    other: "정성껏 마련한 자리에\n귀한 분들을 모십니다."
  },
  casual: {
    wedding: "저희 결혼합니다.\n편하게 오셔서 축하해 주세요.",
    "first-birthday": "첫 생일이라 조금 특별하게 모여요.\n편하게 와 주세요.",
    birthday: "맛있는 것 먹고 즐겁게 보내요.\n시간 비워 주세요.",
    housewarming: "집들이합니다.\n가볍게 들러 주세요.",
    gathering: "오랜만에 모입니다.\n편하게 함께해요.",
    other: "함께하면 더 좋은 자리입니다.\n편하게 와 주세요."
  }
};

const placementPriority: ImageInvitationPlacement[] = ["bottom", "top", "center", "left", "right"];

export function buildImageInvitationTitle(
  eventType: ImageInvitationEventType,
  info: ImageInvitationInfo
) {
  if (info.customTitle?.trim()) {
    return info.customTitle.trim();
  }

  if (eventType === "wedding") {
    const names = [info.groomName, info.brideName].map((name) => name?.trim()).filter(Boolean);
    return names.length === 2 ? `${names[0]} 그리고 ${names[1]}` : fallbackTitles[eventType];
  }

  if (eventType === "first-birthday" && info.childName?.trim()) {
    return `${info.childName.trim()}의 첫 번째 생일`;
  }

  if (eventType === "birthday" && info.birthdayName?.trim()) {
    return `${info.birthdayName.trim()}의 생일`;
  }

  if (eventType === "gathering" && info.gatheringName?.trim()) {
    return info.gatheringName.trim();
  }

  if (eventType === "housewarming" && info.gatheringName?.trim()) {
    return `${info.gatheringName.trim()} 집들이`;
  }

  return fallbackTitles[eventType];
}

export function buildDateLine(info: ImageInvitationInfo) {
  const parts = [info.date?.trim(), info.time?.trim()].filter(Boolean);
  return parts.length ? parts.join(" ") : "날짜와 시간을 입력해 주세요";
}

export function generateImageInvitationCopy(
  eventType: ImageInvitationEventType,
  tone: ImageInvitationTone,
  info: ImageInvitationInfo
): GeneratedInvitationCopy {
  const venueLine = info.venue?.trim() || "장소를 입력해 주세요";
  const feeLine =
    eventType === "gathering" && info.feeOrSupplies?.trim()
      ? `\n준비: ${info.feeOrSupplies.trim()}`
      : "";
  const parentLine =
    eventType === "first-birthday" && info.parentNames?.trim()
      ? `\n${info.parentNames.trim()} 드림`
      : "";

  return {
    title: buildImageInvitationTitle(eventType, info),
    subtitle: subtitlesByTone[tone],
    body: `${bodyByTone[tone][eventType]}${feeLine}${parentLine}`,
    dateLine: buildDateLine(info),
    venueLine
  };
}

export function recommendReadableText(
  zone: ImageZoneStats,
  placement: ImageInvitationPlacement
): ReadableTextRecommendation {
  const color = zone.brightness >= 148 ? "#222222" : "#FFFFFF";
  const lowContrastBand = zone.brightness > 104 && zone.brightness < 188;
  const complexBackground = zone.complexity >= 0.18;

  return {
    color,
    shadowEnabled: color === "#FFFFFF" || lowContrastBand || complexBackground,
    gradientEnabled: placement === "top" || placement === "bottom" || complexBackground
  };
}

export function scoreImageZone(zone: ImageZoneStats) {
  const brightnessDistanceFromMiddle = Math.abs(zone.brightness - 148) / 148;
  const calmness = Math.max(0, 1 - zone.complexity);
  return calmness * 70 + brightnessDistanceFromMiddle * 30;
}

export function recommendPlacementFromZones(zones: ImageZoneMap): ImageInvitationPlacement {
  return placementPriority.reduce((bestPlacement, nextPlacement) => {
    const bestScore = scoreImageZone(zones[bestPlacement]);
    const nextScore = scoreImageZone(zones[nextPlacement]);
    return nextScore > bestScore ? nextPlacement : bestPlacement;
  }, placementPriority[0]);
}

export function getPlacementFrame(placement: ImageInvitationPlacement) {
  const frames: Record<
    ImageInvitationPlacement,
    { x: number; y: number; width: number; align: CanvasTextAlign }
  > = {
    top: { x: 0.5, y: 0.17, width: 0.78, align: "center" },
    center: { x: 0.5, y: 0.5, width: 0.78, align: "center" },
    bottom: { x: 0.5, y: 0.78, width: 0.78, align: "center" },
    left: { x: 0.28, y: 0.52, width: 0.46, align: "left" },
    right: { x: 0.72, y: 0.52, width: 0.46, align: "right" }
  };

  return frames[placement];
}
