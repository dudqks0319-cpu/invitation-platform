"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, type CSSProperties } from "react";
import { TemplateMarkup } from "@/components/landing/template-markup";
import { InvitationMapEmbed } from "@/components/invitations/invitation-map-embed";
import {
  LOCAL_GUESTBOOK_KEY,
  LOCAL_RSVP_KEY,
  formatEventDateTime,
  formatTimestampLabel,
  formatVenue,
  type GuestbookEntry,
  type InvitationDraftPayload,
  type RsvpEntry
} from "@/lib/invitation-payload";
import {
  getInvitationTextPlacementFrame,
  getInvitationTextPlacementTransform
} from "@/lib/invitation-text-placement";
import {
  getInvitationAccountEntries,
  getInvitationCategoryMeta,
  getInvitationContactLines,
  getInvitationHeroSubtitle,
  getInvitationHeroTitle,
  getInvitationPersonLines,
  getPublicShareUrl
} from "@/lib/invitation-presentation";
import { templates } from "@/lib/templates";

type KakaoShareApi = {
  isInitialized(): boolean;
  init(key: string): void;
  Share: {
    sendDefault(payload: {
      objectType: "text";
      text: string;
      link: {
        mobileWebUrl: string;
        webUrl: string;
      };
      buttonTitle: string;
    }): void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoShareApi;
  }
}

type InvitationViewProps = {
  slug?: string;
  payload: InvitationDraftPayload;
  shareUrl: string;
  initialGuestbookEntries?: GuestbookEntry[];
  platformKakaoJsKey?: string;
  mode: "preview" | "public";
};

export function resolveInvitationPlatformConfig({
  draftKakaoJsKey,
  platformKakaoJsKey
}: {
  draftKakaoJsKey: string;
  platformKakaoJsKey?: string;
}) {
  return {
    kakaoJsKey:
      (platformKakaoJsKey ?? process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "").trim() || draftKakaoJsKey.trim()
  };
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : "";
}

function getTemplateImageUrl(markup: string) {
  const imageSourceMatch = markup.match(/\bsrc=(["'])(.*?)\1/i);
  return imageSourceMatch?.[2] ?? "";
}

let kakaoScriptPromise: Promise<KakaoShareApi | null> | null = null;

async function ensureKakaoSdk(jsKey: string) {
  if (!jsKey || typeof window === "undefined") {
    return null;
  }

  if (window.Kakao) {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(jsKey);
    }
    return window.Kakao;
  }

  if (!kakaoScriptPromise) {
    kakaoScriptPromise = new Promise<KakaoShareApi | null>((resolve, reject) => {
      const existing = document.getElementById("kakao-js-sdk");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Kakao ?? null), { once: true });
        existing.addEventListener("error", () => reject(new Error("카카오 SDK를 불러오지 못했습니다.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "kakao-js-sdk";
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve(window.Kakao ?? null);
      script.onerror = () => reject(new Error("카카오 SDK를 불러오지 못했습니다."));
      document.head.appendChild(script);
    });
  }

  const kakao = await kakaoScriptPromise;

  if (kakao && !kakao.isInitialized()) {
    kakao.init(jsKey);
  }

  return kakao;
}

export function InvitationView({
  slug,
  payload,
  shareUrl,
  initialGuestbookEntries = [],
  platformKakaoJsKey,
  mode
}: InvitationViewProps) {
  const [rsvpEntries, setRsvpEntries] = useState<RsvpEntry[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(initialGuestbookEntries);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpError, setRsvpError] = useState("");
  const [guestbookMessage, setGuestbookMessage] = useState("");
  const [guestbookError, setGuestbookError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [pending, setPending] = useState(false);
  const selectedTemplate = templates.find((template) => template.id === payload.templateId) ?? templates[0];
  const categoryMeta = getInvitationCategoryMeta(payload);
  const personLines = getInvitationPersonLines(payload);
  const contactLines = getInvitationContactLines(payload);
  const accountEntries = getInvitationAccountEntries(payload);
  const heroTitle = getInvitationHeroTitle(payload);
  const heroSubtitle = getInvitationHeroSubtitle(payload);
  const templateImageUrl = getTemplateImageUrl(selectedTemplate.html);
  const heroImageUrl = payload.mainImageUrl || payload.backgroundImageUrl || templateImageUrl;
  const isStandaloneArtworkTemplate = selectedTemplate.html.includes("tmpl-standalone-art") && Boolean(templateImageUrl);
  const useImageFirstLayout =
    Boolean(heroImageUrl) &&
    (isStandaloneArtworkTemplate || payload.templateId === "image-text-overlay");
  const isImageTextOverlayPublicLayout =
    useImageFirstLayout && payload.templateId === "image-text-overlay";
  const shouldOverlayTemplateCopy = isStandaloneArtworkTemplate && Boolean(heroImageUrl);
  const shouldSplitTemplateCopy = shouldOverlayTemplateCopy && payload.templateTextPlacement === "bottom";
  const textPlacementFrame = getInvitationTextPlacementFrame(payload.templateTextPlacement);
  const templateCopyStyle: CSSProperties = {
    left: `${textPlacementFrame.x}%`,
    textAlign: textPlacementFrame.align,
    top: `${textPlacementFrame.y}%`,
    transform: getInvitationTextPlacementTransform(textPlacementFrame.align),
    width: `${textPlacementFrame.width}%`
  };
  const { kakaoJsKey } = resolveInvitationPlatformConfig({
    draftKakaoJsKey: payload.kakaoJsKey,
    platformKakaoJsKey
  });
  const resolvedShareUrl = getPublicShareUrl(
    shareUrl,
    typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
  );
  const shareDisabled = mode === "preview";

  async function copyToClipboard(value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  }

  async function submitPublicForm(endpoint: string, payloadBody: object) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payloadBody)
    });

    const result = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      throw new Error(result.message || result.error || "요청 처리에 실패했습니다.");
    }

    return result;
  }

  async function handleRsvpSubmit(formData: FormData) {
    const nextEntry: RsvpEntry = {
      id: crypto.randomUUID(),
      guestName: String(formData.get("guestName") || ""),
      guestPhone: String(formData.get("guestPhone") || ""),
      attending: String(formData.get("attending") || "yes") === "yes",
      guests: Number(formData.get("guests") || 1),
      memo: String(formData.get("memo") || ""),
      createdAt: new Date().toISOString()
    };

    if (!nextEntry.guestName) {
      setRsvpError("이름을 입력해 주세요.");
      return;
    }

    setPending(true);
    setRsvpError("");
    setRsvpMessage("");

    try {
      if (mode === "public" && slug) {
        await submitPublicForm(`/api/public/${slug}/rsvp`, {
          guestName: nextEntry.guestName,
          guestPhone: nextEntry.guestPhone,
          attending: nextEntry.attending ? "yes" : "no",
          guests: nextEntry.guests,
          memo: nextEntry.memo,
          website: String(formData.get("website") || "")
        });
        setRsvpMessage("참석 응답이 접수되었습니다. 변경이 필요하면 호스트에게 바로 알려 주세요.");
      } else {
        const current = JSON.parse(window.localStorage.getItem(LOCAL_RSVP_KEY) || "[]") as RsvpEntry[];
        window.localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify([nextEntry, ...current]));
        setRsvpMessage("데모 모드에서 RSVP를 저장했습니다.");
      }

      setRsvpEntries((current) => [nextEntry, ...current]);
    } catch (submissionError) {
      setRsvpError(submissionError instanceof Error ? submissionError.message : "RSVP 저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function handleGuestbookSubmit(formData: FormData) {
    const nextEntry: GuestbookEntry = {
      id: crypto.randomUUID(),
      nickname: String(formData.get("nickname") || ""),
      message: String(formData.get("guestbookMessage") || ""),
      approved: mode !== "public",
      createdAt: new Date().toISOString()
    };

    if (!nextEntry.nickname || !nextEntry.message) {
      setGuestbookError("이름과 메시지를 모두 입력해 주세요.");
      return;
    }

    setPending(true);
    setGuestbookError("");
    setGuestbookMessage("");

    try {
      if (mode === "public" && slug) {
        await submitPublicForm(`/api/public/${slug}/guestbook`, {
          nickname: nextEntry.nickname,
          message: nextEntry.message,
          website: String(formData.get("website") || "")
        });
        setGuestbookMessage("방명록이 접수되었습니다. 호스트 확인 후 공개되며, 승인 전에는 목록에 보이지 않습니다.");
      } else {
        const current = JSON.parse(window.localStorage.getItem(LOCAL_GUESTBOOK_KEY) || "[]") as GuestbookEntry[];
        window.localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify([nextEntry, ...current]));
        setGuestbookMessage("데모 모드에서 방명록을 저장했습니다.");
      }

      if (nextEntry.approved) {
        setGuestbookEntries((current) => [nextEntry, ...current]);
      }
    } catch (submissionError) {
      setGuestbookError(submissionError instanceof Error ? submissionError.message : "방명록 저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  const kakaoPayLink = normalizeUrl(payload.kakaoPayLink);
  const videoUrl = normalizeUrl(payload.videoUrl);
  const backgroundMusicUrl = normalizeUrl(payload.backgroundMusicUrl);
  const rawMapQuery = payload.mapAddress || payload.venueAddress || payload.venueName;
  const primaryLocationLabel = payload.roadAddress || payload.mapAddress || payload.venueAddress || "위치 정보를 입력해 주세요.";
  const secondaryLocationLabel =
    payload.jibunAddress && payload.jibunAddress !== primaryLocationLabel ? payload.jibunAddress : "";
  const postcodeLabel = payload.zonecode ? `우편번호 ${payload.zonecode}` : "";
  const mapQuery = encodeURIComponent(rawMapQuery);
  const mapLink =
    normalizeUrl(payload.naverMapLink) ||
    `https://map.naver.com/p/search/${mapQuery}`;
  const kakaoMapLink =
    normalizeUrl(payload.kakaoMapLink) ||
    `https://map.kakao.com/link/search/${mapQuery}`;

  return (
    <main className={useImageFirstLayout ? "invitation-main invitation-main-image-first" : "invitation-main"}>
      {useImageFirstLayout ? (
        <>
          <section
            className={
              shouldOverlayTemplateCopy
                ? "invitation-public-image-hero has-template-copy"
                : "invitation-public-image-hero"
            }
            aria-label="초대장 이미지"
          >
            <img
              alt={`${payload.title || "오삼오삼"} 초대장 이미지`}
              className="invitation-public-image"
              src={heroImageUrl}
            />
            {shouldSplitTemplateCopy ? (
              <div className="invitation-public-image-split-copy" data-placement={payload.templateTextPlacement}>
                <div className="invitation-public-image-split-top">
                  <p className="invitation-public-image-kicker">{categoryMeta.badgeText}</p>
                  <h1 className="invitation-public-image-names">{heroTitle}</h1>
                </div>
                <div className="invitation-public-image-split-bottom">
                  <p className="invitation-public-image-date">{formatEventDateTime(payload.eventDateTime)}</p>
                  <p className="invitation-public-image-venue">{formatVenue(payload)}</p>
                </div>
              </div>
            ) : shouldOverlayTemplateCopy ? (
              <div
                className="invitation-public-image-copy"
                data-placement={payload.templateTextPlacement}
                style={templateCopyStyle}
              >
                <p className="invitation-public-image-kicker">{categoryMeta.badgeText}</p>
                {payload.title ? <p className="invitation-public-image-title">{payload.title}</p> : null}
                <h1 className="invitation-public-image-names">{heroTitle}</h1>
                <p className="invitation-public-image-date">{formatEventDateTime(payload.eventDateTime)}</p>
                <p className="invitation-public-image-venue">{formatVenue(payload)}</p>
              </div>
            ) : null}
          </section>
          <section className="invitation-public-summary" aria-label="행사 핵심 정보">
            <div className="invitation-public-title-block">
              <p className="invitation-category">{categoryMeta.badgeText}</p>
              {payload.title ? <p className="invitation-title-label">{payload.title}</p> : null}
              <h1 className="invitation-names">{heroTitle}</h1>
              {heroSubtitle ? <p className="invitation-subtitle">{heroSubtitle}</p> : null}
              <p className="invitation-message">{payload.message}</p>
            </div>
            <div className="invitation-public-facts">
              <div>
                <span>날짜</span>
                <strong>{formatEventDateTime(payload.eventDateTime)}</strong>
              </div>
              <div>
                <span>장소</span>
                <strong>{formatVenue(payload)}</strong>
              </div>
            </div>
            <div className="invitation-public-map">
              <div className="invitation-location-addresses invitation-public-map-address">
                <p>{primaryLocationLabel}</p>
                {secondaryLocationLabel ? <p>지번 {secondaryLocationLabel}</p> : null}
                {postcodeLabel ? <p>{postcodeLabel}</p> : null}
              </div>
              <InvitationMapEmbed
                kakaoMapLink={kakaoMapLink}
                naverMapLink={mapLink}
                query={rawMapQuery}
              />
            </div>
            <div className="invitation-inline-actions invitation-summary-actions">
              <button
                className="btn-primary invitation-small-btn"
                disabled={shareDisabled}
                onClick={async () => {
                  await copyToClipboard(resolvedShareUrl);
                  setShareMessage("공유 링크를 복사했습니다. 하객에게 바로 붙여넣어 보내 주세요.");
                }}
                type="button"
              >
                링크 복사
              </button>
            </div>
          </section>
        </>
      ) : (
        <section
          className="invitation-hero"
          style={payload.backgroundImageUrl ? { backgroundImage: `url(${payload.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {!payload.backgroundImageUrl ? (
            <div className="invitation-template-backdrop">
              <TemplateMarkup template={selectedTemplate} />
            </div>
          ) : null}
          <div className="invitation-hero-overlay" />
          <div className="invitation-hero-inner">
            {payload.mainImageUrl ? (
              <div className="invitation-main-image-wrap">
                <img alt="초대장 메인 이미지" src={payload.mainImageUrl} style={{ display: "block" }} />
              </div>
            ) : null}
            <div className="invitation-hero-copy">
              <p className="invitation-category">{categoryMeta.badgeText}</p>
              {payload.title ? <p className="invitation-title-label">{payload.title}</p> : null}
              <h1 className="invitation-names">{heroTitle}</h1>
              {heroSubtitle ? <p className="invitation-subtitle">{heroSubtitle}</p> : null}
              <p className="invitation-date">{formatEventDateTime(payload.eventDateTime)}</p>
              <p className="invitation-venue">{formatVenue(payload)}</p>
              <p className="invitation-message">{payload.message}</p>
            </div>
          </div>
        </section>
      )}

      {isImageTextOverlayPublicLayout ? null : (
      <section className="invitation-content">
        {!useImageFirstLayout ? (
          <article className="invitation-card">
            <h2>위치</h2>
            <div className="invitation-location-addresses">
              <p>{primaryLocationLabel}</p>
              {secondaryLocationLabel ? <p>지번 {secondaryLocationLabel}</p> : null}
              {postcodeLabel ? <p>{postcodeLabel}</p> : null}
            </div>
            <p className="invitation-transport">{payload.transportNote}</p>
            <InvitationMapEmbed
              kakaoMapLink={kakaoMapLink}
              naverMapLink={mapLink}
              query={rawMapQuery}
            />
          </article>
        ) : null}

        <article className="invitation-card">
          <h2>{categoryMeta.personSectionTitle}</h2>
          <p style={{ whiteSpace: "pre-line" }}>
            {personLines.length ? personLines.join("\n") : "행사 정보를 입력해 주세요."}
          </p>
        </article>

        <article className="invitation-card">
          <h2>{categoryMeta.contactTitle}</h2>
          <p style={{ whiteSpace: "pre-line" }}>
            {contactLines.length ? contactLines.join("\n") : "연락처를 입력해 주세요."}
          </p>
        </article>

        <article className="invitation-card">
          <h2>{categoryMeta.accountTitle}</h2>
          <p style={{ whiteSpace: "pre-line" }}>
            {accountEntries.length ? accountEntries.map((entry) => entry.value).join("\n") : "계좌 정보를 입력해 주세요."}
          </p>
          {accountEntries.length ? (
            <div className="invitation-inline-actions">
              {accountEntries.map((entry) => (
                <button
                  className="btn-outline invitation-small-btn"
                  key={entry.copyLabel}
                  onClick={() => copyToClipboard(entry.copyValue)}
                  type="button"
                >
                  {entry.copyLabel}
                </button>
              ))}
            </div>
          ) : null}
          {kakaoPayLink ? (
            <a className="btn-primary invitation-wide-btn" href={kakaoPayLink} rel="noreferrer noopener" target="_blank">
              카카오페이 송금 링크 열기
            </a>
          ) : null}
        </article>

        {payload.galleryImages.length ? (
          <article className="invitation-card">
            <h2>갤러리</h2>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
              }}
            >
              {payload.galleryImages.map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    minHeight: 140,
                    background: "#f5efe8"
                  }}
                >
                  <img
                    alt={`초대장 갤러리 이미지 ${index + 1}`}
                    src={imageUrl}
                    style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {videoUrl ? (
          <article className="invitation-card">
            <h2>식전 영상</h2>
            <p>예식 전 함께 보실 수 있는 영상을 준비했습니다.</p>
            <a className="btn-primary invitation-wide-btn" href={videoUrl} rel="noreferrer noopener" target="_blank">
              영상 보기
            </a>
          </article>
        ) : null}

        {backgroundMusicUrl ? (
          <article className="invitation-card">
            <h2>배경음악</h2>
            <p>초대장과 함께 준비한 음악을 재생해 보세요.</p>
            <audio controls preload="none" src={backgroundMusicUrl} style={{ width: "100%", marginTop: 12 }} />
          </article>
        ) : null}

        <article className="invitation-card">
          <h2>참석 여부 알려주세요</h2>
          <form
            action={async (formData) => {
              await handleRsvpSubmit(formData);
            }}
            className="invitation-guestbook-form"
          >
            <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
            <label>
              이름
              <input maxLength={40} name="guestName" required type="text" />
            </label>
            <label>
              연락처
              <input inputMode="tel" maxLength={30} name="guestPhone" type="text" />
            </label>
            <label>
              참석 여부
              <select className="modal-input" defaultValue="yes" name="attending">
                <option value="yes">참석</option>
                <option value="no">불참</option>
              </select>
            </label>
            <label>
              동행 인원
              <input defaultValue={1} inputMode="numeric" max={20} min={0} name="guests" type="number" />
            </label>
            <label>
              메모
              <textarea maxLength={300} name="memo" rows={3} />
            </label>
            <button className="btn-primary invitation-wide-btn" disabled={pending} type="submit">
              참석 응답 보내기
            </button>
          </form>
          {rsvpMessage ? <p className="form-message success">{rsvpMessage}</p> : null}
          {rsvpError ? <p className="form-message error">{rsvpError}</p> : null}
          {rsvpEntries.length ? <p>최근 응답 {rsvpEntries.length}건이 이 세션에 기록되었습니다.</p> : null}
        </article>

        <article className="invitation-card">
          <h2>카카오톡으로 보내기</h2>
          {shareDisabled ? (
            <p className="form-message error" id="invitationShareHint">
              미리보기 단계에서는 나만 볼 수 있습니다. 하객에게 보낼 링크는 발행 후 공개 링크를 사용해 주세요.
            </p>
          ) : (
            <p id="invitationShareHint">카카오톡 공유창으로 공개 초대장 링크를 바로 보낼 수 있습니다.</p>
          )}
          <div className="invitation-inline-actions">
            <button
              className="btn-primary invitation-small-btn"
              disabled={shareDisabled}
              onClick={async () => {
                try {
                  const kakao = await ensureKakaoSdk(kakaoJsKey);

                  if (kakao) {
                    kakao.Share.sendDefault({
                      objectType: "text",
                      text: `${payload.title}\n${payload.message}`,
                      link: {
                        mobileWebUrl: resolvedShareUrl,
                        webUrl: resolvedShareUrl
                      },
                      buttonTitle: "초대장 보기"
                    });
                    setShareMessage("카카오톡 공유창을 열었습니다.");
                    return;
                  }
                } catch {
                  // fallback below
                }

                if (navigator.share) {
                  try {
                    await navigator.share({ title: payload.title, text: payload.message, url: resolvedShareUrl });
                    setShareMessage("공유창을 열었습니다.");
                    return;
                  } catch {
                  }
                }

                try {
                  await copyToClipboard(resolvedShareUrl);
                  setShareMessage("공유 링크를 복사했습니다. 카카오톡 대화창에 붙여넣어 보내 주세요.");
                } catch {
                  setShareMessage("공유를 완료하지 못했습니다. 브라우저 주소창의 링크를 직접 복사해 주세요.");
                }
              }}
              type="button"
            >
              카카오톡 공유
            </button>
            <button
              className="btn-outline invitation-small-btn"
              disabled={shareDisabled}
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({ title: payload.title, text: payload.message, url: resolvedShareUrl });
                    setShareMessage("공유창을 열었습니다.");
                    return;
                  } catch {
                  }
                }

                try {
                  await copyToClipboard(resolvedShareUrl);
                  setShareMessage("공유 링크를 복사했습니다. 하객에게 바로 붙여넣어 보내 주세요.");
                } catch {
                  setShareMessage("공유를 완료하지 못했습니다. 브라우저 주소창의 링크를 직접 복사해 주세요.");
                }
              }}
              type="button"
            >
              기본 공유
            </button>
            <button
              className="btn-outline invitation-small-btn"
              disabled={shareDisabled}
              onClick={async () => {
                try {
                  await copyToClipboard(resolvedShareUrl);
                  setShareMessage("공유 링크를 복사했습니다. 하객에게 바로 붙여넣어 보내 주세요.");
                } catch {
                  setShareMessage("공유를 완료하지 못했습니다. 브라우저 주소창의 링크를 직접 복사해 주세요.");
                }
              }}
              type="button"
            >
              링크 복사
            </button>
          </div>
          {shareMessage ? <p className="form-message success">{shareMessage}</p> : null}
        </article>

        <article className="invitation-card">
          <h2>방명록</h2>
          <form
            action={async (formData) => {
              await handleGuestbookSubmit(formData);
            }}
            className="invitation-guestbook-form"
          >
            <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
            <label>
              이름
              <input maxLength={30} name="nickname" required type="text" />
            </label>
            <label>
              메시지
              <textarea maxLength={300} name="guestbookMessage" required rows={3} />
            </label>
            <button className="btn-primary invitation-wide-btn" disabled={pending} type="submit">
              방명록 남기기
            </button>
          </form>
          {mode === "public" ? (
            <p className="form-message">방명록은 관리자 승인 후 공개됩니다. 작성 직후 목록에 보이지 않아도 정상입니다.</p>
          ) : null}
          {guestbookMessage ? <p className="form-message success">{guestbookMessage}</p> : null}
          {guestbookError ? <p className="form-message error">{guestbookError}</p> : null}
          <ul className="list-box invitation-guestbook-list">
            {guestbookEntries.length ? (
              guestbookEntries.map((entry) => (
                <li key={entry.id}>
                  <div className="meta">
                    {formatTimestampLabel(entry.createdAt)} · {entry.nickname}
                  </div>
                  <div className="value">{entry.message}</div>
                </li>
              ))
            ) : (
              <li className="meta">첫 번째 축하 메시지를 남겨 주세요.</li>
            )}
          </ul>
        </article>

        {payload.thankYouMessage ? (
          <article className="invitation-card">
            <h2>감사 인사</h2>
            <p style={{ whiteSpace: "pre-line" }}>{payload.thankYouMessage}</p>
          </article>
        ) : null}
      </section>
      )}
    </main>
  );
}
