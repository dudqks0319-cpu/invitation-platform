"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";

type Align = "left" | "center" | "right";
type Gradient = "none" | "top" | "bottom" | "full";

type Overlay = {
  x: number;
  y: number;
  width: number;
  size: number;
  color: string;
  align: Align;
  shadow: boolean;
  gradient: Gradient;
  preset: string;
};

const DEFAULT_OVERLAY: Overlay = {
  x: 50,
  y: 74,
  width: 78,
  size: 18,
  color: "#fffaf0",
  align: "center",
  shadow: true,
  gradient: "bottom",
  preset: "bottom"
};

const PRESETS = [
  { id: "bottom", label: "하단", x: 50, y: 74, width: 78, gradient: "bottom" as Gradient },
  { id: "top", label: "상단", x: 50, y: 24, width: 78, gradient: "top" as Gradient },
  { id: "middle", label: "중앙", x: 50, y: 50, width: 76, gradient: "full" as Gradient },
  { id: "left", label: "왼쪽", x: 34, y: 50, width: 54, gradient: "full" as Gradient },
  { id: "right", label: "오른쪽", x: 66, y: 50, width: 54, gradient: "full" as Gradient }
];

const COPY = {
  wedding: {
    label: "결혼식",
    title: "우리 결혼합니다",
    names: "신랑 ♡ 신부",
    message: "소중한 분들을 모시고 기쁨의 순간을 함께 나누고 싶습니다."
  },
  baby: {
    label: "돌잔치",
    title: "첫 번째 생일에 초대합니다",
    names: "우리 아이의 돌잔치",
    message: "아이의 첫 생일을 축복해 주신 분들과 감사한 마음을 나누고 싶습니다."
  },
  birthday: {
    label: "생일",
    title: "생일 파티에 초대합니다",
    names: "Happy Birthday",
    message: "소중한 하루를 함께 웃고 즐기며 보내고 싶어요."
  },
  meeting: {
    label: "모임",
    title: "모임에 초대합니다",
    names: "함께하는 시간",
    message: "오랜만에 모여 편하게 이야기 나누는 시간을 준비했습니다."
  }
};

type CopyKey = keyof typeof COPY;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul"
  }).format(date);
}

function getReadableColor(imageUrl: string) {
  return new Promise<Pick<Overlay, "color" | "shadow">>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ color: "#fffaf0", shadow: true });
        return;
      }
      ctx.drawImage(image, 0, 0, 40, 40);
      const data = ctx.getImageData(0, 0, 40, 40).data;
      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      }
      const average = total / (data.length / 4);
      resolve({ color: average < 140 ? "#fffaf0" : "#2f231a", shadow: average > 90 && average < 190 });
    };
    image.onerror = () => resolve({ color: "#fffaf0", shadow: true });
    image.src = imageUrl;
  });
}

export function ImageTextStudio() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; rect: DOMRect; overlay: Overlay } | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [copyKey, setCopyKey] = useState<CopyKey>("wedding");
  const [title, setTitle] = useState(COPY.wedding.title);
  const [names, setNames] = useState(COPY.wedding.names);
  const [dateValue, setDateValue] = useState("");
  const [place, setPlace] = useState("");
  const [message, setMessage] = useState(COPY.wedding.message);
  const [overlay, setOverlay] = useState<Overlay>(DEFAULT_OVERLAY);
  const [notice, setNotice] = useState("이미지를 올리면 글자 위치를 자동으로 잡습니다.");

  const dateLabel = useMemo(() => formatDate(dateValue), [dateValue]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function applyCopy(key: CopyKey) {
    const next = COPY[key];
    setCopyKey(key);
    setTitle(next.title);
    setNames(next.names);
    setMessage(next.message);
  }

  async function autoPlace(url = imageUrl) {
    if (!url) {
      setNotice("먼저 이미지를 업로드해 주세요.");
      return;
    }
    const readable = await getReadableColor(url);
    setOverlay((current) => ({ ...current, ...DEFAULT_OVERLAY, ...readable }));
    setNotice("글자를 하단 중심으로 자동 배치했습니다. 글자를 끌어서 위치를 바꿀 수 있습니다.");
  }

  function selectImage(file: File | null) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setNotice("이미지는 10MB 이하만 사용할 수 있습니다.");
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setImageUrl(nextUrl);
    setImageName(file.name);
    void autoPlace(nextUrl);
  }

  function usePreset(preset: (typeof PRESETS)[number]) {
    setOverlay((current) => ({
      ...current,
      x: preset.x,
      y: preset.y,
      width: preset.width,
      gradient: preset.gradient,
      preset: preset.id
    }));
  }

  function moveStart(event: PointerEvent<HTMLDivElement>) {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { startX: event.clientX, startY: event.clientY, rect, overlay };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = ((event.clientX - drag.startX) / drag.rect.width) * 100;
    const dy = ((event.clientY - drag.startY) / drag.rect.height) * 100;
    setOverlay((current) => ({
      ...current,
      x: clamp(drag.overlay.x + dx, 10, 90),
      y: clamp(drag.overlay.y + dy, 10, 90),
      preset: "custom"
    }));
  }

  function moveEnd() {
    dragRef.current = null;
  }

  const overlayStyle = {
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    width: `${overlay.width}%`,
    color: overlay.color,
    fontSize: `${overlay.size}px`,
    textAlign: overlay.align,
    textShadow: overlay.shadow ? "0 2px 12px rgba(0,0,0,.55)" : "none"
  } satisfies CSSProperties;

  return (
    <div className="image-text-studio">
      <section className="image-text-panel">
        <p className="image-text-kicker">무료 제작</p>
        <h2>이미지 위에 글자만 얹기</h2>
        <p className="image-text-desc">이미지는 사용자가 준비하고, 앱은 문구와 글자 위치만 빠르게 잡아줍니다.</p>

        <label className="image-text-upload-card">
          <strong>이미지 업로드</strong>
          <span>{imageName || "JPG, PNG, WEBP / 권장 비율 9:16"}</span>
          <input accept="image/*" onChange={(event) => selectImage(event.target.files?.[0] ?? null)} type="file" />
        </label>

        <div className="image-text-form-grid">
          <label>
            행사 종류
            <select value={copyKey} onChange={(event) => applyCopy(event.target.value as CopyKey)}>
              {Object.entries(COPY).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            제목
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            이름/주인공
            <input value={names} onChange={(event) => setNames(event.target.value)} />
          </label>
          <label>
            날짜와 시간
            <input type="datetime-local" value={dateValue} onChange={(event) => setDateValue(event.target.value)} />
          </label>
          <label className="image-text-full-field">
            장소
            <input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="장소를 입력하세요" />
          </label>
          <label className="image-text-full-field">
            초대 문구
            <textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
          </label>
        </div>

        <div className="image-text-action-row">
          <button className="btn-outline" onClick={() => applyCopy(copyKey)} type="button">문구 자동완성</button>
          <button className="btn-primary" onClick={() => void autoPlace()} type="button">글자 자동 배치</button>
        </div>
      </section>

      <section className="image-text-panel image-text-preview-panel">
        <div className="image-text-preview-shell">
          <div className="image-text-preview-canvas" ref={previewRef}>
            {imageUrl ? <img alt="업로드 이미지" className="image-text-preview-image" src={imageUrl} /> : null}
            {imageUrl ? <div className={`image-text-gradient image-text-gradient-${overlay.gradient}`} /> : null}
            {imageUrl ? (
              <div
                className="image-text-overlay-box"
                onPointerCancel={moveEnd}
                onPointerDown={moveStart}
                onPointerMove={move}
                onPointerUp={moveEnd}
                role="button"
                style={overlayStyle}
                tabIndex={0}
              >
                {title ? <strong>{title}</strong> : null}
                {names ? <h3>{names}</h3> : null}
                {dateLabel ? <span>{dateLabel}</span> : null}
                {place ? <span>{place}</span> : null}
                {message ? <p>{message}</p> : null}
              </div>
            ) : (
              <div className="image-text-empty-state">이미지를 올리면 미리보기가 표시됩니다.</div>
            )}
          </div>
        </div>

        <div className="image-text-preset-row">
          {PRESETS.map((preset) => (
            <button className={overlay.preset === preset.id ? "is-active" : ""} key={preset.id} onClick={() => usePreset(preset)} type="button">
              {preset.label}
            </button>
          ))}
        </div>

        <div className="image-text-slider-grid">
          <label>좌우 {Math.round(overlay.x)}%<input max="90" min="10" onChange={(e) => setOverlay((v) => ({ ...v, x: Number(e.target.value), preset: "custom" }))} type="range" value={overlay.x} /></label>
          <label>상하 {Math.round(overlay.y)}%<input max="90" min="10" onChange={(e) => setOverlay((v) => ({ ...v, y: Number(e.target.value), preset: "custom" }))} type="range" value={overlay.y} /></label>
          <label>크기 {overlay.size}px<input max="30" min="12" onChange={(e) => setOverlay((v) => ({ ...v, size: Number(e.target.value) }))} type="range" value={overlay.size} /></label>
          <label>영역 {overlay.width}%<input max="90" min="38" onChange={(e) => setOverlay((v) => ({ ...v, width: Number(e.target.value) }))} type="range" value={overlay.width} /></label>
        </div>

        <div className="image-text-option-grid">
          <label>글자색<input onChange={(e) => setOverlay((v) => ({ ...v, color: e.target.value }))} type="color" value={overlay.color} /></label>
          <label>정렬<select onChange={(e) => setOverlay((v) => ({ ...v, align: e.target.value as Align }))} value={overlay.align}><option value="center">가운데</option><option value="left">왼쪽</option><option value="right">오른쪽</option></select></label>
          <label>보정<select onChange={(e) => setOverlay((v) => ({ ...v, gradient: e.target.value as Gradient }))} value={overlay.gradient}><option value="none">없음</option><option value="bottom">하단</option><option value="top">상단</option><option value="full">전체</option></select></label>
          <label className="image-text-check-field"><input checked={overlay.shadow} onChange={(e) => setOverlay((v) => ({ ...v, shadow: e.target.checked }))} type="checkbox" />그림자</label>
        </div>
        <p className="image-text-notice">{notice}</p>
      </section>
    </div>
  );
}
