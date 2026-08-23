"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Download,
  ExternalLink,
  ImageIcon,
  Link2,
  Loader2,
  MousePointer2,
  RefreshCcw,
  Shuffle,
  Upload,
  WandSparkles
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import {
  buildDateLine,
  generateImageInvitationCopy,
  getPlacementFrame,
  imageInvitationEventTypes,
  imageInvitationTones,
  recommendPlacementFromZones,
  recommendReadableText,
  type GeneratedInvitationCopy,
  type ImageInvitationEventType,
  type ImageInvitationInfo,
  type ImageInvitationPlacement,
  type ImageInvitationTone,
  type ImageZoneMap
} from "@/lib/image-invitation";

type FitMode = "cover" | "contain";
type InvitationFont = "serif" | "sans" | "round";
type InvitationFontWeight = "thin" | "regular" | "bold" | "black";
type TextFrame = {
  x: number;
  y: number;
  width: number;
  align: CanvasTextAlign;
};
type TextDragState = {
  startX: number;
  startY: number;
  rect: DOMRect;
  frame: TextFrame;
};
type GuestPublishResponse = {
  success?: boolean;
  invitationId?: string;
  slug?: string;
  message?: string;
  error?: string;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SAMPLE_IMAGE_URL = "/images/custom/wedding/wedding-05.jpeg";
const initialCalendarDate = "2026-06-27";
const initialCalendarTime = "13:00";

function createGuestPublishIdempotencyKey() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi) {
    throw new Error("브라우저 요청 보호 기능을 사용할 수 없습니다.");
  }
  if (cryptoApi.randomUUID) {
    return `guest-publish-${cryptoApi.randomUUID()}`;
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  return `guest-publish-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

const initialInfo: ImageInvitationInfo = {
  groomName: "강우",
  brideName: "빛나",
  date: "2026년 6월 27일 토요일",
  time: "오후 1:00",
  venue: "전주 엔타워컨벤션웨딩 1층 베일리"
};

const fontOptions: Record<InvitationFont, { label: string; css: string; canvas: string }> = {
  serif: {
    label: "고운 명조",
    css: "var(--font-serif), 'Noto Serif KR', 'Nanum Myeongjo', serif",
    canvas: "'Noto Serif KR', 'Nanum Myeongjo', serif"
  },
  sans: {
    label: "단정 고딕",
    css: "var(--font-body), 'Noto Sans KR', 'Nanum Gothic', sans-serif",
    canvas: "'Noto Sans KR', 'Nanum Gothic', sans-serif"
  },
  round: {
    label: "부드러운 라운드",
    css: "Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    canvas: "Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
  }
};

const fontWeightOptions: Record<
  InvitationFontWeight,
  { label: string; body: number; meta: number; title: number }
> = {
  thin: { label: "얇게", body: 300, meta: 400, title: 500 },
  regular: { label: "보통", body: 400, meta: 500, title: 600 },
  bold: { label: "굵게", body: 600, meta: 700, title: 800 },
  black: { label: "아주 굵게", body: 700, meta: 800, title: 900 }
};

const textColorOptions = [
  { label: "흰색", value: "#FFFFFF" },
  { label: "검정", value: "#222222" },
  { label: "크림", value: "#FFF4DC" },
  { label: "브라운", value: "#4F2E1B" },
  { label: "골드", value: "#F5C96D" }
];

const placementOptions: Array<{ value: ImageInvitationPlacement; label: string }> = [
  { value: "top", label: "상단 중앙" },
  { value: "center", label: "중앙" },
  { value: "bottom", label: "하단 중앙" },
  { value: "left", label: "좌측 중앙" },
  { value: "right", label: "우측 중앙" }
];

function createInitialCopy() {
  return generateImageInvitationCopy("wedding", "emotional", initialInfo);
}

function formatCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return "";
  }

  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(date);
}

function formatCalendarTime(value: string) {
  const [hourValue, minuteValue] = value.split(":").map(Number);

  if (!Number.isFinite(hourValue) || !Number.isFinite(minuteValue)) {
    return "";
  }

  const period = hourValue < 12 ? "오전" : "오후";
  const hour = hourValue % 12 || 12;
  return `${period} ${hour}:${String(minuteValue).padStart(2, "0")}`;
}

function getPublishCategory(eventType: ImageInvitationEventType) {
  if (eventType === "first-birthday") {
    return "dol";
  }

  if (eventType === "other" || eventType === "gathering") {
    return "business";
  }

  return eventType;
}

function getPublishNames(
  eventType: ImageInvitationEventType,
  info: ImageInvitationInfo,
  copy: GeneratedInvitationCopy
) {
  const title = copy.title.trim() || "이미지 초대장";

  if (eventType === "wedding") {
    return {
      primaryName: info.groomName?.trim() || title,
      secondaryName: info.brideName?.trim() || "함께하는 분"
    };
  }

  if (eventType === "first-birthday") {
    return {
      primaryName: info.childName?.trim() || title,
      secondaryName: info.parentNames?.trim() || "가족"
    };
  }

  if (eventType === "birthday") {
    return {
      primaryName: info.birthdayName?.trim() || title,
      secondaryName: "함께 축하하는 분"
    };
  }

  if (eventType === "housewarming" || eventType === "gathering") {
    return {
      primaryName: info.gatheringName?.trim() || title,
      secondaryName: "함께하는 분"
    };
  }

  return {
    primaryName: info.customTitle?.trim() || title,
    secondaryName: "초대받는 분"
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTextFrameForPlacement(placement: ImageInvitationPlacement): TextFrame {
  const frame = getPlacementFrame(placement);
  return {
    x: Math.round(frame.x * 100),
    y: Math.round(frame.y * 100),
    width: Math.round(frame.width * 100),
    align: frame.align
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = src;
  });
}

function readImageZones(image: HTMLImageElement): ImageZoneMap {
  const width = 180;
  const height = 320;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("이미지 분석을 위한 캔버스를 사용할 수 없습니다.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const rects: Record<ImageInvitationPlacement, [number, number, number, number]> = {
    top: [0, 0, width, Math.round(height * 0.34)],
    center: [0, Math.round(height * 0.33), width, Math.round(height * 0.34)],
    bottom: [0, Math.round(height * 0.66), width, Math.round(height * 0.34)],
    left: [0, Math.round(height * 0.22), Math.round(width * 0.52), Math.round(height * 0.56)],
    right: [Math.round(width * 0.48), Math.round(height * 0.22), Math.round(width * 0.52), Math.round(height * 0.56)]
  };

  return Object.fromEntries(
    Object.entries(rects).map(([placement, [x, y, zoneWidth, zoneHeight]]) => {
      const imageData = context.getImageData(x, y, zoneWidth, zoneHeight).data;
      let brightnessTotal = 0;
      let deltaTotal = 0;
      let sampleCount = 0;
      let previousBrightness = 0;

      for (let index = 0; index < imageData.length; index += 16) {
        const red = imageData[index] ?? 0;
        const green = imageData[index + 1] ?? 0;
        const blue = imageData[index + 2] ?? 0;
        const brightness = red * 0.299 + green * 0.587 + blue * 0.114;

        brightnessTotal += brightness;
        if (sampleCount > 0) {
          deltaTotal += Math.abs(brightness - previousBrightness);
        }
        previousBrightness = brightness;
        sampleCount += 1;
      }

      return [
        placement,
        {
          brightness: sampleCount ? brightnessTotal / sampleCount : 148,
          complexity: sampleCount > 1 ? Math.min(1, deltaTotal / (sampleCount - 1) / 96) : 0.2
        }
      ];
    })
  ) as ImageZoneMap;
}

function getObjectPosition(focusX: number, focusY: number) {
  return `${focusX}% ${focusY}%`;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawFittedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  fitMode: FitMode,
  focusX: number,
  focusY: number,
  width: number,
  height: number
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = width / height;

  if (fitMode === "contain") {
    const drawWidth = imageRatio > canvasRatio ? width : height * imageRatio;
    const drawHeight = imageRatio > canvasRatio ? width / imageRatio : height;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    context.fillStyle = "#f7f2ec";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, x, y, drawWidth, drawHeight);
    return;
  }

  const sourceWidth = imageRatio > canvasRatio ? image.naturalHeight * canvasRatio : image.naturalWidth;
  const sourceHeight = imageRatio > canvasRatio ? image.naturalHeight : image.naturalWidth / canvasRatio;
  const maxSourceX = image.naturalWidth - sourceWidth;
  const maxSourceY = image.naturalHeight - sourceHeight;
  const sourceX = maxSourceX * (focusX / 100);
  const sourceY = maxSourceY * (focusY / 100);

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

function splitLongToken(token: string, context: CanvasRenderingContext2D, maxWidth: number) {
  const parts: string[] = [];
  let buffer = "";

  for (const character of token) {
    const next = `${buffer}${character}`;
    if (context.measureText(next).width > maxWidth && buffer) {
      parts.push(buffer);
      buffer = character;
    } else {
      buffer = next;
    }
  }

  if (buffer) {
    parts.push(buffer);
  }

  return parts;
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 4) {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    const tokens = paragraph.trim().split(/\s+/).filter(Boolean);
    let currentLine = "";

    for (const token of tokens.length ? tokens : [""]) {
      const fittingTokens =
        context.measureText(token).width > maxWidth
          ? splitLongToken(token, context, maxWidth)
          : [token];

      for (const fittingToken of fittingTokens) {
        const nextLine = currentLine ? `${currentLine} ${fittingToken}` : fittingToken;
        if (context.measureText(nextLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = fittingToken;
        } else {
          currentLine = nextLine;
        }

        if (lines.length >= maxLines) {
          return lines;
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length >= maxLines) {
      return lines;
    }
  }

  return lines;
}

function drawGeneratedText(
  context: CanvasRenderingContext2D,
  copy: GeneratedInvitationCopy,
  placement: ImageInvitationPlacement,
  frame: TextFrame,
  font: InvitationFont,
  fontWeight: InvitationFontWeight,
  fontScale: number,
  color: string,
  shadowEnabled: boolean,
  gradientEnabled: boolean
) {
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;
  const x = canvasWidth * (frame.x / 100);
  const y = canvasHeight * (frame.y / 100);
  const maxWidth = canvasWidth * (frame.width / 100);
  const titleSize = 72 * fontScale;
  const subtitleSize = 32 * fontScale;
  const bodySize = 31 * fontScale;
  const metaSize = 30 * fontScale;
  const weights = fontWeightOptions[fontWeight];
  const titleLineHeight = titleSize * 1.18;
  const bodyLineHeight = bodySize * 1.55;
  const metaLineHeight = metaSize * 1.42;

  context.textAlign = frame.align;
  context.textBaseline = "middle";

  context.font = `${weights.body} ${bodySize}px ${fontOptions[font].canvas}`;
  const bodyLines = wrapText(context, copy.body, maxWidth, 4);
  context.font = `${weights.meta} ${metaSize}px ${fontOptions[font].canvas}`;
  const venueLines = wrapText(context, copy.venueLine, maxWidth, 2);
  const totalHeight =
    titleLineHeight +
    subtitleSize * 1.55 +
    bodyLines.length * bodyLineHeight +
    metaLineHeight +
    venueLines.length * metaLineHeight +
    84;
  const startY = y - totalHeight / 2;

  if (gradientEnabled && (placement === "top" || placement === "bottom")) {
    const gradient =
      placement === "top"
        ? context.createLinearGradient(0, 0, 0, canvasHeight * 0.42)
        : context.createLinearGradient(0, canvasHeight * 0.58, 0, canvasHeight);

    gradient.addColorStop(0, placement === "top" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)");
    gradient.addColorStop(1, placement === "top" ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.58)");
    context.fillStyle = gradient;
    context.fillRect(0, placement === "top" ? 0 : canvasHeight * 0.58, canvasWidth, canvasHeight * 0.42);
  } else if (gradientEnabled) {
    context.fillStyle = color === "#FFFFFF" ? "rgba(0,0,0,0.34)" : "rgba(255,255,255,0.54)";
    roundRect(context, x - maxWidth / 2 - 34, startY - 34, maxWidth + 68, totalHeight + 68, 34);
    context.fill();
  }

  context.fillStyle = color;
  context.shadowColor = shadowEnabled ? "rgba(0,0,0,0.52)" : "transparent";
  context.shadowBlur = shadowEnabled ? 18 : 0;
  context.shadowOffsetY = shadowEnabled ? 5 : 0;

  let cursorY = startY + titleLineHeight / 2;
  context.font = `${weights.title} ${titleSize}px ${fontOptions[font].canvas}`;
  context.fillText(copy.title, x, cursorY, maxWidth);

  cursorY += titleLineHeight * 0.95;
  context.font = `${weights.meta} ${subtitleSize}px ${fontOptions[font].canvas}`;
  context.fillText(copy.subtitle, x, cursorY, maxWidth);

  cursorY += subtitleSize * 1.75;
  context.font = `${weights.body} ${bodySize}px ${fontOptions[font].canvas}`;
  for (const line of bodyLines) {
    context.fillText(line, x, cursorY, maxWidth);
    cursorY += bodyLineHeight;
  }

  cursorY += metaLineHeight * 0.42;
  context.font = `${weights.meta} ${metaSize}px ${fontOptions[font].canvas}`;
  context.fillText(copy.dateLine, x, cursorY, maxWidth);

  cursorY += metaLineHeight;
  context.font = `${weights.body} ${metaSize * 0.92}px ${fontOptions[font].canvas}`;
  for (const line of venueLines) {
    context.fillText(line, x, cursorY, maxWidth);
    cursorY += metaLineHeight;
  }

  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;
}

export function ImageInvitationStudio() {
  const [eventType, setEventType] = useState<ImageInvitationEventType>("wedding");
  const [tone, setTone] = useState<ImageInvitationTone>("emotional");
  const [info, setInfo] = useState<ImageInvitationInfo>(initialInfo);
  const [copy, setCopy] = useState<GeneratedInvitationCopy>(createInitialCopy);
  const [calendarDate, setCalendarDate] = useState(initialCalendarDate);
  const [calendarTime, setCalendarTime] = useState(initialCalendarTime);
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [fitMode, setFitMode] = useState<FitMode>("cover");
  const [focusX, setFocusX] = useState(50);
  const [focusY, setFocusY] = useState(50);
  const [placement, setPlacement] = useState<ImageInvitationPlacement>("bottom");
  const [textFrame, setTextFrame] = useState<TextFrame>(() => getTextFrameForPlacement("bottom"));
  const [isCustomFrame, setIsCustomFrame] = useState(false);
  const [font, setFont] = useState<InvitationFont>("serif");
  const [fontWeight, setFontWeight] = useState<InvitationFontWeight>("bold");
  const [fontScale, setFontScale] = useState(1);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [gradientEnabled, setGradientEnabled] = useState(true);
  const [zones, setZones] = useState<ImageZoneMap | null>(null);
  const [status, setStatus] = useState("이미지를 올리면 문구와 배치가 자동으로 준비됩니다.");
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef("");
  const textDragRef = useRef<TextDragState | null>(null);
  const publishIdempotencyKeyRef = useRef("");
  const [isDraggingText, setIsDraggingText] = useState(false);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    []
  );

  const previewTextStyle = {
    "--invite-text-x": `${textFrame.x}%`,
    "--invite-text-y": `${textFrame.y}%`,
    "--invite-text-width": `${textFrame.width}%`,
    "--invite-text-align": textFrame.align,
    "--invite-text-color": textColor,
    "--invite-text-shadow": shadowEnabled ? "0 2px 16px rgba(0,0,0,0.58)" : "none",
    "--invite-font-scale": fontScale,
    "--invite-font-family": fontOptions[font].css,
    "--invite-font-weight-body": fontWeightOptions[fontWeight].body,
    "--invite-font-weight-meta": fontWeightOptions[fontWeight].meta,
    "--invite-font-weight-title": fontWeightOptions[fontWeight].title
  } as CSSProperties;

  const selectedPlacementLabel = useMemo(
    () => (isCustomFrame ? "직접 조정" : placementOptions.find((option) => option.value === placement)?.label ?? "하단 중앙"),
    [isCustomFrame, placement]
  );

  function setPlacementPreset(nextPlacement: ImageInvitationPlacement) {
    setPlacement(nextPlacement);
    setTextFrame(getTextFrameForPlacement(nextPlacement));
    setIsCustomFrame(false);
  }

  function updateTextFrame(framePatch: Partial<TextFrame>) {
    setTextFrame((current) => ({ ...current, ...framePatch }));
    setIsCustomFrame(true);
  }

  function updateInfo(key: keyof ImageInvitationInfo, value: string) {
    setInfo((current) => ({ ...current, [key]: value }));
  }

  function applySchedule(infoPatch: Partial<ImageInvitationInfo>, statusMessage: string) {
    setInfo((currentInfo) => {
      const nextInfo = { ...currentInfo, ...infoPatch };
      setCopy((currentCopy) => ({ ...currentCopy, dateLine: buildDateLine(nextInfo) }));
      return nextInfo;
    });
    setStatus(statusMessage);
  }

  function updateDateText(value: string) {
    applySchedule({ date: value }, "날짜 문구를 수정했습니다.");
  }

  function updateTimeText(value: string) {
    applySchedule({ time: value }, "시간 문구를 수정했습니다.");
  }

  function selectCalendarDate(value: string) {
    setCalendarDate(value);
    const formattedDate = formatCalendarDate(value);

    if (!formattedDate) {
      applySchedule({ date: "" }, "달력 날짜를 비웠습니다.");
      return;
    }

    applySchedule({ date: formattedDate }, "달력에서 선택한 날짜를 초대장에 반영했습니다.");
  }

  function selectCalendarTime(value: string) {
    setCalendarTime(value);
    const formattedTime = formatCalendarTime(value);

    if (!formattedTime) {
      applySchedule({ time: "" }, "시간 선택을 비웠습니다.");
      return;
    }

    applySchedule({ time: formattedTime }, "선택한 시간을 초대장에 반영했습니다.");
  }

  function regenerateCopy() {
    setCopy(generateImageInvitationCopy(eventType, tone, info));
    setStatus("입력 정보와 톤에 맞춰 문구를 다시 생성했습니다.");
  }

  function applyRecommendation(nextZones: ImageZoneMap) {
    const nextPlacement = recommendPlacementFromZones(nextZones);
    const style = recommendReadableText(nextZones[nextPlacement], nextPlacement);
    const placementLabel = placementOptions.find((option) => option.value === nextPlacement)?.label;

    setPlacementPreset(nextPlacement);
    setTextColor(style.color);
    setShadowEnabled(style.shadowEnabled);
    setGradientEnabled(style.gradientEnabled);
    setStatus(`자동 배치 완료: ${placementLabel}입니다. 글자를 끌어서 위치를 바꿀 수 있어요.`);
  }

  async function analyzeImageSource(nextUrl: string, nextName: string, statusMessage: string) {
    setImageUrl(nextUrl);
    setImageName(nextName);
    setResultDataUrl("");
    setPublicUrl("");
    setStatus(statusMessage);

    try {
      const image = await loadImage(nextUrl);
      const nextZones = readImageZones(image);
      setZones(nextZones);
      applyRecommendation(nextZones);
    } catch (error) {
      setZones(null);
      setStatus(error instanceof Error ? error.message : "이미지를 분석하지 못했습니다.");
    }
  }

  async function handleImageFile(file: File | null) {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatus("JPG, PNG, WebP 이미지만 사용할 수 있습니다.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setStatus("이미지는 10MB 이하 파일만 사용할 수 있습니다.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    await analyzeImageSource(nextUrl, file.name, "이미지를 분석하고 있습니다.");
  }

  async function loadSampleImage() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }

    await analyzeImageSource(SAMPLE_IMAGE_URL, "샘플 웨딩 이미지", "샘플 이미지를 분석하고 있습니다.");
  }

  function rerollPlacement() {
    const currentIndex = placementOptions.findIndex((option) => option.value === placement);
    const nextPlacement = placementOptions[(currentIndex + 1) % placementOptions.length]?.value ?? "bottom";
    const style = recommendReadableText(zones?.[nextPlacement] ?? { brightness: 120, complexity: 0.22 }, nextPlacement);

    setPlacementPreset(nextPlacement);
    setTextColor(style.color);
    setShadowEnabled(style.shadowEnabled);
    setGradientEnabled(style.gradientEnabled);
    setStatus(`${placementOptions.find((option) => option.value === nextPlacement)?.label} 배치로 바꿨습니다. 글자를 끌어서 위치를 바꿀 수 있어요.`);
  }

  async function exportPng() {
    if (!imageUrl) {
      setStatus("먼저 이미지를 업로드해 주세요.");
      return;
    }

    try {
      const dataUrl = await renderInvitationDataUrl({ height: 1920, mimeType: "image/png", width: 1080 });
      setResultDataUrl(dataUrl);

      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = "osam-image-invitation.png";
      anchor.click();
      setStatus("PNG 이미지를 저장했습니다. 아래 저장용 미리보기도 길게 눌러 저장할 수 있습니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "이미지 저장에 실패했습니다.");
    }
  }

  async function renderInvitationDataUrl({
    height,
    mimeType,
    quality,
    width
  }: {
    height: number;
    mimeType: "image/jpeg" | "image/png";
    quality?: number;
    width: number;
  }) {
    await document.fonts?.ready;
    const image = await loadImage(imageUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("이미지를 저장할 캔버스를 만들지 못했습니다.");
    }

    canvas.width = width;
    canvas.height = height;
    drawFittedImage(context, image, fitMode, focusX, focusY, canvas.width, canvas.height);
    drawGeneratedText(
      context,
      copy,
      placement,
      textFrame,
      font,
      fontWeight,
      fontScale,
      textColor,
      shadowEnabled,
      gradientEnabled
    );

    return canvas.toDataURL(mimeType, quality);
  }

  function createPublishPayload(publishImageUrl: string) {
    const title = copy.title.trim() || "이미지 초대장";
    const venueText = copy.venueLine.trim() || info.venue?.trim() || "장소 미정";
    const { primaryName, secondaryName } = getPublishNames(eventType, info, copy);

    return {
      templateId: "image-text-overlay",
      category: getPublishCategory(eventType),
      title,
      eventDateTime: `${calendarDate || initialCalendarDate}T${calendarTime || initialCalendarTime}`,
      venueName: venueText,
      venueAddress: venueText,
      mapAddress: venueText,
      message: copy.body.trim() || "초대합니다.",
      groomName: primaryName,
      brideName: secondaryName,
      mainImageUrl: publishImageUrl,
      shareUrl: "",
      thankYouMessage: "",
      transportNote: ""
    };
  }

  async function publishInvitation() {
    if (!imageUrl) {
      setStatus("먼저 이미지를 업로드해 주세요.");
      return;
    }

    setIsPublishing(true);
    setPublicUrl("");
    setStatus("공개 초대장 링크를 만들고 있습니다.");

    try {
      const publishImageUrl = await renderInvitationDataUrl({
        height: 1280,
        mimeType: "image/jpeg",
        quality: 0.86,
        width: 720
      });
      if (!publishIdempotencyKeyRef.current) {
        publishIdempotencyKeyRef.current = createGuestPublishIdempotencyKey();
      }
      const response = await fetch("/api/public/guest-publish", {
        body: JSON.stringify({
          payload: createPublishPayload(publishImageUrl),
          website: ""
        }),
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": publishIdempotencyKeyRef.current
        },
        method: "POST"
      });
      const payload = (await response.json()) as GuestPublishResponse;

      if (!response.ok || !payload.success || !payload.slug) {
        throw new Error(payload.message || payload.error || "공개 링크 발행에 실패했습니다.");
      }

      const nextPublicUrl = `${window.location.origin}/i/${payload.slug}`;
      publishIdempotencyKeyRef.current = "";
      setPublicUrl(nextPublicUrl);
      setStatus("공개 초대장 링크를 만들었습니다. 아래 버튼으로 바로 확인할 수 있어요.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "공개 링크 발행에 실패했습니다.");
    } finally {
      setIsPublishing(false);
    }
  }

  function startTextDrag(event: PointerEvent<HTMLDivElement>) {
    const rect = previewRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    textDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      rect,
      frame: textFrame
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingText(true);
    setStatus("글자 박스를 끌어 위치를 조정하고 있습니다.");
  }

  function moveTextDrag(event: PointerEvent<HTMLDivElement>) {
    const dragState = textDragRef.current;

    if (!dragState) {
      return;
    }

    event.preventDefault();
    setTextFrame((current) => ({
      ...current,
      x: clamp(dragState.frame.x + ((event.clientX - dragState.startX) / dragState.rect.width) * 100, 8, 92),
      y: clamp(dragState.frame.y + ((event.clientY - dragState.startY) / dragState.rect.height) * 100, 8, 92)
    }));
    setIsCustomFrame(true);
  }

  function endTextDrag(event: PointerEvent<HTMLDivElement>) {
    if (textDragRef.current) {
      setStatus("직접 조정한 글자 위치를 적용했습니다.");
    }
    textDragRef.current = null;
    setIsDraggingText(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="image-invite-studio">
      <section className="image-invite-panel image-invite-workflow" aria-label="이미지 초대장 제작">
        <div className="image-invite-panel-head">
          <p className="image-invite-kicker">무료 이미지 초대장</p>
          <h2>업로드한 이미지에 글자만 빠르게 얹습니다</h2>
          <p>사진, 일러스트, Canva 이미지에 행사 정보를 채우고 9:16 PNG로 저장합니다.</p>
        </div>

        <div className="image-invite-section">
          <h3>1. 이미지 업로드</h3>
          <label className="image-invite-upload">
            <input
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void handleImageFile(event.target.files?.[0] ?? null)}
              ref={fileInputRef}
              type="file"
            />
            <span className="image-invite-upload-icon" aria-hidden="true">
              <Upload size={20} />
            </span>
            <span>
              <strong>{imageName || "JPG, PNG, WebP 이미지를 선택하세요"}</strong>
              <small>기본 비율은 모바일 공유용 9:16입니다. 최대 10MB까지 지원합니다.</small>
            </span>
          </label>
          <div className="image-invite-upload-actions">
            <button className="image-invite-action" onClick={() => fileInputRef.current?.click()} type="button">
              <Upload size={18} />
              내 이미지로 시작하기
            </button>
            <button className="image-invite-action is-secondary" onClick={() => void loadSampleImage()} type="button">
              <ImageIcon size={18} />
              샘플 이미지로 체험
            </button>
          </div>
          <div className="image-invite-fit-row">
            <button
              className={fitMode === "cover" ? "image-invite-chip is-active" : "image-invite-chip"}
              onClick={() => setFitMode("cover")}
              type="button"
            >
              채우기
            </button>
            <button
              className={fitMode === "contain" ? "image-invite-chip is-active" : "image-invite-chip"}
              onClick={() => setFitMode("contain")}
              type="button"
            >
              맞추기
            </button>
          </div>
          <div className="image-invite-range-grid">
            <label>
              가로 초점
              <input
                max="100"
                min="0"
                onChange={(event) => setFocusX(Number(event.target.value))}
                onInput={(event) => setFocusX(Number(event.currentTarget.value))}
                type="range"
                value={focusX}
              />
            </label>
            <label>
              세로 초점
              <input
                max="100"
                min="0"
                onChange={(event) => setFocusY(Number(event.target.value))}
                onInput={(event) => setFocusY(Number(event.currentTarget.value))}
                type="range"
                value={focusY}
              />
            </label>
          </div>
        </div>

        <div className="image-invite-section">
          <h3>2. 행사 정보</h3>
          <div className="image-invite-form-grid">
            <label>
              행사 종류
              <select
                className="image-invite-input"
                onChange={(event) => setEventType(event.target.value as ImageInvitationEventType)}
                value={eventType}
              >
                {imageInvitationEventTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              문구 톤
              <select
                className="image-invite-input"
                onChange={(event) => setTone(event.target.value as ImageInvitationTone)}
                value={tone}
              >
                {imageInvitationTones.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {eventType === "wedding" ? (
              <>
                <label>
                  신랑 이름
                  <input
                    className="image-invite-input"
                    onChange={(event) => updateInfo("groomName", event.target.value)}
                    value={info.groomName ?? ""}
                  />
                </label>
                <label>
                  신부 이름
                  <input
                    className="image-invite-input"
                    onChange={(event) => updateInfo("brideName", event.target.value)}
                    value={info.brideName ?? ""}
                  />
                </label>
              </>
            ) : null}

            {eventType === "first-birthday" ? (
              <>
                <label>
                  아이 이름
                  <input
                    className="image-invite-input"
                    onChange={(event) => updateInfo("childName", event.target.value)}
                    value={info.childName ?? ""}
                  />
                </label>
                <label>
                  부모 이름
                  <input
                    className="image-invite-input"
                    onChange={(event) => updateInfo("parentNames", event.target.value)}
                    value={info.parentNames ?? ""}
                  />
                </label>
              </>
            ) : null}

            {eventType === "birthday" ? (
              <label>
                주인공 이름
                <input
                  className="image-invite-input"
                  onChange={(event) => updateInfo("birthdayName", event.target.value)}
                  value={info.birthdayName ?? ""}
                />
              </label>
            ) : null}

            {eventType === "gathering" || eventType === "housewarming" ? (
              <label>
                {eventType === "housewarming" ? "초대 이름" : "모임명"}
                <input
                  className="image-invite-input"
                  onChange={(event) => updateInfo("gatheringName", event.target.value)}
                  value={info.gatheringName ?? ""}
                />
              </label>
            ) : null}

            {eventType === "other" ? (
              <label>
                제목
                <input
                  className="image-invite-input"
                  onChange={(event) => updateInfo("customTitle", event.target.value)}
                  value={info.customTitle ?? ""}
                />
              </label>
            ) : null}

            <label>
              날짜 달력
              <input
                className="image-invite-input"
                onChange={(event) => selectCalendarDate(event.target.value)}
                onInput={(event) => selectCalendarDate(event.currentTarget.value)}
                type="date"
                value={calendarDate}
              />
            </label>
            <label>
              시간 선택
              <input
                className="image-invite-input"
                onChange={(event) => selectCalendarTime(event.target.value)}
                onInput={(event) => selectCalendarTime(event.currentTarget.value)}
                type="time"
                value={calendarTime}
              />
            </label>
            <label>
              날짜 문구
              <input
                className="image-invite-input"
                onChange={(event) => updateDateText(event.target.value)}
                onInput={(event) => updateDateText(event.currentTarget.value)}
                value={info.date ?? ""}
              />
            </label>
            <label>
              시간 문구
              <input
                className="image-invite-input"
                onChange={(event) => updateTimeText(event.target.value)}
                onInput={(event) => updateTimeText(event.currentTarget.value)}
                value={info.time ?? ""}
              />
            </label>
            <label className="image-invite-full">
              장소
              <input
                className="image-invite-input"
                onChange={(event) => updateInfo("venue", event.target.value)}
                value={info.venue ?? ""}
              />
            </label>
            {eventType === "gathering" ? (
              <label className="image-invite-full">
                회비 또는 준비물
                <input
                  className="image-invite-input"
                  onChange={(event) => updateInfo("feeOrSupplies", event.target.value)}
                  value={info.feeOrSupplies ?? ""}
                />
              </label>
            ) : null}
          </div>
          <button className="image-invite-action" onClick={regenerateCopy} type="button">
            <WandSparkles size={18} />
            문구 자동완성
          </button>
        </div>

        <div className="image-invite-section">
          <h3>3. 문구와 배치 미세 편집</h3>
          <div className="image-invite-form-grid">
            <label>
              제목
              <input
                className="image-invite-input"
                onChange={(event) => setCopy((current) => ({ ...current, title: event.target.value }))}
                value={copy.title}
              />
            </label>
            <label>
              부제목
              <input
                className="image-invite-input"
                onChange={(event) => setCopy((current) => ({ ...current, subtitle: event.target.value }))}
                value={copy.subtitle}
              />
            </label>
            <label className="image-invite-full">
              본문
              <textarea
                className="image-invite-input"
                onChange={(event) => setCopy((current) => ({ ...current, body: event.target.value }))}
                rows={4}
                value={copy.body}
              />
            </label>
            <label>
              날짜 문구
              <input
                className="image-invite-input"
                onChange={(event) => setCopy((current) => ({ ...current, dateLine: event.target.value }))}
                value={copy.dateLine}
              />
            </label>
            <label>
              장소 문구
              <input
                className="image-invite-input"
                onChange={(event) => setCopy((current) => ({ ...current, venueLine: event.target.value }))}
                value={copy.venueLine}
              />
            </label>
            <label>
              배치
              <select
                className="image-invite-input"
                onChange={(event) => setPlacementPreset(event.target.value as ImageInvitationPlacement)}
                value={placement}
              >
                {placementOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              폰트
              <select
                className="image-invite-input"
                onChange={(event) => setFont(event.target.value as InvitationFont)}
                value={font}
              >
                {Object.entries(fontOptions).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              정렬
              <select
                className="image-invite-input"
                onChange={(event) => updateTextFrame({ align: event.target.value as CanvasTextAlign })}
                value={textFrame.align}
              >
                <option value="left">왼쪽</option>
                <option value="center">가운데</option>
                <option value="right">오른쪽</option>
              </select>
            </label>
            <label>
              글자 굵기
              <select
                className="image-invite-input"
                onChange={(event) => setFontWeight(event.target.value as InvitationFontWeight)}
                value={fontWeight}
              >
                {Object.entries(fontWeightOptions).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              글자 크기
              <input
                max="1.35"
                min="0.72"
                onChange={(event) => setFontScale(Number(event.target.value))}
                onInput={(event) => setFontScale(Number(event.currentTarget.value))}
                step="0.01"
                type="range"
                value={fontScale}
              />
            </label>
            <label>
              글자 색상
              <input
                className="image-invite-color"
                onChange={(event) => setTextColor(event.target.value)}
                onInput={(event) => setTextColor(event.currentTarget.value)}
                type="color"
                value={textColor}
              />
            </label>
            <div className="image-invite-full image-invite-color-swatches" aria-label="글자 색상 빠른 선택">
              {textColorOptions.map((option) => (
                <button
                  aria-pressed={textColor.toLowerCase() === option.value.toLowerCase()}
                  className={
                    textColor.toLowerCase() === option.value.toLowerCase()
                      ? "image-invite-swatch is-active"
                      : "image-invite-swatch"
                  }
                  key={option.value}
                  onClick={() => setTextColor(option.value)}
                  style={{ "--invite-swatch-color": option.value } as CSSProperties}
                  type="button"
                >
                  <span aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="image-invite-range-grid">
            <label>
              좌우 위치 {Math.round(textFrame.x)}%
              <input
                max="92"
                min="8"
                onChange={(event) => updateTextFrame({ x: Number(event.target.value) })}
                onInput={(event) => updateTextFrame({ x: Number(event.currentTarget.value) })}
                type="range"
                value={textFrame.x}
              />
            </label>
            <label>
              상하 위치 {Math.round(textFrame.y)}%
              <input
                max="92"
                min="8"
                onChange={(event) => updateTextFrame({ y: Number(event.target.value) })}
                onInput={(event) => updateTextFrame({ y: Number(event.currentTarget.value) })}
                type="range"
                value={textFrame.y}
              />
            </label>
            <label>
              글자 영역 {Math.round(textFrame.width)}%
              <input
                max="90"
                min="34"
                onChange={(event) => updateTextFrame({ width: Number(event.target.value) })}
                onInput={(event) => updateTextFrame({ width: Number(event.currentTarget.value) })}
                type="range"
                value={textFrame.width}
              />
            </label>
          </div>

          <div className="image-invite-toggle-row">
            <label>
              <input
                checked={shadowEnabled}
                onChange={(event) => setShadowEnabled(event.target.checked)}
                type="checkbox"
              />
              그림자
            </label>
            <label>
              <input
                checked={gradientEnabled}
                onChange={(event) => setGradientEnabled(event.target.checked)}
                type="checkbox"
              />
              보정 레이어
            </label>
          </div>

          <div className="image-invite-button-row">
            <button className="image-invite-action is-secondary" onClick={() => zones && applyRecommendation(zones)} type="button">
              <RefreshCcw size={18} />
              자동 추천
            </button>
            <button className="image-invite-action is-secondary" onClick={rerollPlacement} type="button">
              <Shuffle size={18} />
              다른 배치
            </button>
          </div>
        </div>
      </section>

      <aside className="image-invite-preview-panel" aria-label="모바일 초대장 미리보기">
        {imageUrl ? (
          <div className="image-invite-primary-actions">
            <button className="image-invite-download" onClick={() => void exportPng()} type="button">
              <Download size={18} />
              PNG 저장
            </button>
            <button
              className="image-invite-download image-invite-publish"
              disabled={isPublishing}
              onClick={() => void publishInvitation()}
              type="button"
            >
              {isPublishing ? <Loader2 className="image-invite-spin" size={18} /> : <Link2 size={18} />}
              {isPublishing ? "링크 만드는 중" : "공개 링크 만들기"}
            </button>
          </div>
        ) : null}

        <div className="image-invite-phone">
          <div className="image-invite-screen" ref={previewRef}>
            {imageUrl ? (
              <img
                alt="업로드한 초대장 배경"
                className="image-invite-bg"
                src={imageUrl}
                style={{
                  objectFit: fitMode,
                  objectPosition: getObjectPosition(focusX, focusY)
                }}
              />
            ) : (
              <div className="image-invite-empty">
                <ImageIcon size={34} />
                <strong>이미지를 올리면 초대장 글자가 바로 얹어집니다</strong>
                <span>
                  1. 이미지 선택  2. 문구 자동완성  3. 글자 위치 조정  4. PNG 저장
                </span>
                <div className="image-invite-empty-actions">
                  <button className="image-invite-action" onClick={() => fileInputRef.current?.click()} type="button">
                    내 이미지로 시작하기
                  </button>
                  <button className="image-invite-action is-secondary" onClick={() => void loadSampleImage()} type="button">
                    샘플 이미지로 체험
                  </button>
                </div>
              </div>
            )}
            {imageUrl && gradientEnabled ? (
              <div className={`image-invite-gradient image-invite-gradient-${placement}`} />
            ) : null}
            {imageUrl ? (
              <div
                aria-label="초대장 글자 위치 조정"
                className={isDraggingText ? "image-invite-text is-dragging" : "image-invite-text"}
                onPointerCancel={endTextDrag}
                onPointerDown={startTextDrag}
                onPointerMove={moveTextDrag}
                onPointerUp={endTextDrag}
                role="button"
                style={previewTextStyle}
                tabIndex={0}
              >
                <p className="image-invite-preview-subtitle">{copy.subtitle}</p>
                <h3>{copy.title}</h3>
                <p className="image-invite-preview-body">{copy.body}</p>
                <p className="image-invite-preview-date">{copy.dateLine}</p>
                <p className="image-invite-preview-venue">{copy.venueLine}</p>
              </div>
            ) : null}
          </div>
        </div>

        {imageUrl ? (
          <div className="image-invite-drag-hint">
            <MousePointer2 size={16} />
            글자를 끌어서 위치를 바꿀 수 있어요. 아래 슬라이더로도 세밀하게 맞출 수 있습니다.
          </div>
        ) : null}

        <div className="image-invite-preview-meta">
          <strong>{selectedPlacementLabel}</strong>
          <span>{status}</span>
        </div>

        {publicUrl ? (
          <div className="image-invite-public-link">
            <span>공개 초대장 링크</span>
            <a href={publicUrl} rel="noreferrer" target="_blank">
              <ExternalLink size={16} />
              발행한 초대장 보기
            </a>
            <code>{publicUrl}</code>
          </div>
        ) : null}

        {resultDataUrl ? (
          <div className="image-invite-result">
            <p>모바일 저장용 이미지</p>
            <img alt="저장된 초대장 결과물" src={resultDataUrl} />
          </div>
        ) : null}
      </aside>
    </div>
  );
}
