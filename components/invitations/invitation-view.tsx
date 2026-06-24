"use client";

/* eslint-disable @next/next/no-img-element */

import { type ReactNode, useState } from "react";
import { TemplateMarkup } from "@/components/landing/template-markup";
import { InvitationMapEmbed } from "@/components/invitations/invitation-map-embed";
import { buildGoogleCalendarUrl } from "@/lib/calendar-invite";
import {
  LOCAL_GUESTBOOK_KEY,
  LOCAL_RSVP_KEY,
  formatEventDateTime,
  formatTimestampLabel,
  formatVenue,
  invitationSectionKeys,
  isInvitationSectionAllowed,
  type GuestbookEntry,
  type InvitationDraftPayload,
  type InvitationSectionKey,
  type RsvpEntry
} from "@/lib/invitation-payload";
import {
  getInvitationAccountEntries,
  getInvitationCategoryMeta,
  getInvitationContactLines,
  getInvitationHeroSubtitle,
  getInvitationHeroTitle,
  getInvitationPersonLines,
  getPublicShareUrl
} from "@/lib/invitation-presentation";
import {
  buildPublicCalendarPath,
  buildPublicQrImagePath,
  buildPublicShareImagePath
} from "@/lib/public-share-assets";
import { createTemplatePresetFromSnapshot, templates } from "@/lib/templates";

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

let kakaoScriptPromise: Promise<KakaoShareApi | null> | null = null;

async function ensureKakaoSdk(jsKey: string) {
  if (!jsKey || typeof window === "undefined") {
    return null;
  }

  if (window.Kakao) {
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
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [accountCopyMessage, setAccountCopyMessage] = useState("");
  const [pending, setPending] = useState(false);
  const baseTemplate = templates.find((template) => template.id === payload.templateId) ?? templates[0];
  const selectedTemplate = payload.templateSnapshot?.backgroundImageUrl
    ? createTemplatePresetFromSnapshot(payload.templateSnapshot, baseTemplate)
    : baseTemplate;
  const categoryMeta = getInvitationCategoryMeta(payload);
  const showPeople = isInvitationSectionAllowed(payload, "people", "view");
  const showContact = isInvitationSectionAllowed(payload, "contact", "view");
  const showAccounts = isInvitationSectionAllowed(payload, "accounts", "view");
  const showVenue = isInvitationSectionAllowed(payload, "venue", "view");
  const showGallery = isInvitationSectionAllowed(payload, "gallery", "view");
  const showVideo = isInvitationSectionAllowed(payload, "video", "view");
  const showMusic = isInvitationSectionAllowed(payload, "music", "view");
  const showCalendar = isInvitationSectionAllowed(payload, "calendar", "view");
  const showRsvp = isInvitationSectionAllowed(payload, "rsvp", "view");
  const showGuestbook = isInvitationSectionAllowed(payload, "guestbook", "view");
  const personLines = getInvitationPersonLines(payload);
  const contactLines = showContact ? getInvitationContactLines(payload) : [];
  const accountEntries = showAccounts ? getInvitationAccountEntries(payload) : [];
  const heroTitle = getInvitationHeroTitle(payload);
  const heroSubtitle = getInvitationHeroSubtitle(payload);
  const { kakaoJsKey } = resolveInvitationPlatformConfig({
    draftKakaoJsKey: payload.kakaoJsKey,
    platformKakaoJsKey
  });
  const resolvedShareUrl = getPublicShareUrl(
    shareUrl,
    typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
  );
  const shareDisabled = mode === "preview";
  const qrImagePath = slug ? buildPublicQrImagePath(slug) : "";
  const calendarPath = slug ? buildPublicCalendarPath(slug) : "";
  const instagramImagePath = slug ? buildPublicShareImagePath(slug, "instagram") : "";
  const a4PosterPath = slug ? buildPublicShareImagePath(slug, "a4") : "";
  const googleCalendarUrl = buildGoogleCalendarUrl({
    payload,
    shareUrl: resolvedShareUrl,
    title: payload.title
  });

  async function copyToClipboard(value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  }

  async function copyAccountEntry(entry: { label: string; copyValue: string }) {
    if (!entry.copyValue) return;
    await copyToClipboard(entry.copyValue);
    setAccountCopyMessage(`${entry.label}를 복사했습니다.`);
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

  async function handleReportSubmit(formData: FormData) {
    setPending(true);
    setReportError("");
    setReportMessage("");

    try {
      if (mode === "public" && slug) {
        await submitPublicForm(`/api/public/${slug}/report`, {
          targetType: String(formData.get("targetType") || "invitation"),
          reason: String(formData.get("reason") || "other"),
          detail: String(formData.get("detail") || ""),
          reporterContact: String(formData.get("reporterContact") || ""),
          website: String(formData.get("website") || "")
        });
      }

      setReportMessage("신고가 접수되었습니다. 운영자가 확인하겠습니다.");
    } catch (submissionError) {
      setReportError(submissionError instanceof Error ? submissionError.message : "신고 접수에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  const kakaoPayLink = showAccounts ? normalizeUrl(payload.kakaoPayLink) : "";
  const videoUrl = showVideo ? normalizeUrl(payload.videoUrl) : "";
  const backgroundMusicUrl = showMusic ? normalizeUrl(payload.backgroundMusicUrl) : "";
  const rawMapQuery = payload.mapAddress || payload.venueAddress || payload.venueName;
  const mapQuery = encodeURIComponent(rawMapQuery);
  const mapLink =
    normalizeUrl(payload.naverMapLink) ||
    `https://map.naver.com/p/search/${mapQuery}`;
  const kakaoMapLink =
    normalizeUrl(payload.kakaoMapLink) ||
    `https://map.kakao.com/link/search/${mapQuery}`;
  const invitationSectionNodes: Partial<Record<InvitationSectionKey, ReactNode>> = {
    people: showPeople ? (
      <article className="invitation-card" key="people">
        <h2>{categoryMeta.personSectionTitle}</h2>
        <p style={{ whiteSpace: "pre-line" }}>
          {personLines.length ? personLines.join("\n") : "행사 정보를 입력해 주세요."}
        </p>
      </article>
    ) : null,
    contact: showContact ? (
      <article className="invitation-card" key="contact">
        <h2>{categoryMeta.contactTitle}</h2>
        <p style={{ whiteSpace: "pre-line" }}>
          {contactLines.length ? contactLines.join("\n") : "연락처를 입력해 주세요."}
        </p>
      </article>
    ) : null,
    accounts: showAccounts ? (
      <article className="invitation-card" key="accounts">
        <h2>{categoryMeta.accountTitle}</h2>
        <p style={{ whiteSpace: "pre-line" }}>
          {accountEntries.length ? accountEntries.map((entry) => entry.value).join("\n") : "계좌 정보를 입력해 주세요."}
        </p>
        {accountEntries.length ? (
          <div className="invitation-inline-actions">
            {accountEntries.map((entry) => (
              <button
                className="btn-outline invitation-small-btn"
                disabled={!entry.copyValue}
                key={entry.copyLabel}
                onClick={() => copyAccountEntry(entry)}
                type="button"
              >
                {entry.copyLabel}
              </button>
            ))}
          </div>
        ) : null}
        {accountCopyMessage ? <p className="form-message success">{accountCopyMessage}</p> : null}
        <a className={`btn-primary invitation-wide-btn ${kakaoPayLink ? "" : "is-disabled"}`} href={kakaoPayLink || "#"} rel="noreferrer noopener" target="_blank">
          카카오페이 송금 링크 열기
        </a>
      </article>
    ) : null,
    venue: showVenue ? (
      <article className="invitation-card" key="venue">
        <h2>위치</h2>
        <p>{payload.mapAddress || payload.venueAddress || "위치 정보를 입력해 주세요."}</p>
        <p className="invitation-transport">{payload.transportNote}</p>
        <InvitationMapEmbed
          kakaoMapLink={kakaoMapLink}
          naverMapLink={mapLink}
          query={rawMapQuery}
        />
      </article>
    ) : null,
    calendar: showCalendar ? (
      <article className="invitation-card" key="calendar">
        <h2>캘린더 추가</h2>
        <p>초대장 일정을 하객의 캘린더에 바로 저장할 수 있습니다.</p>
        {shareDisabled || !calendarPath || !googleCalendarUrl ? (
          <p className="form-message error">캘린더 추가 링크는 초대장을 발행한 뒤 공개 링크에서 사용할 수 있습니다.</p>
        ) : (
          <div className="invitation-inline-actions">
            <a className="btn-primary invitation-small-btn" href={googleCalendarUrl} rel="noreferrer noopener" target="_blank">
              Google Calendar
            </a>
            <a className="btn-outline invitation-small-btn" download={`${slug}.ics`} href={calendarPath}>
              iCal 저장
            </a>
          </div>
        )}
      </article>
    ) : null,
    gallery: showGallery && payload.galleryImages.length ? (
      <article className="invitation-card" key="gallery">
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
    ) : null,
    video: showVideo && videoUrl ? (
      <article className="invitation-card" key="video">
        <h2>식전 영상</h2>
        <p>예식 전 함께 보실 수 있는 영상을 준비했습니다.</p>
        <a className="btn-primary invitation-wide-btn" href={videoUrl} rel="noreferrer noopener" target="_blank">
          영상 보기
        </a>
      </article>
    ) : null,
    music: showMusic && backgroundMusicUrl ? (
      <article className="invitation-card" key="music">
        <h2>배경음악</h2>
        <p>초대장과 함께 준비한 음악을 재생해 보세요.</p>
        <audio controls preload="none" src={backgroundMusicUrl} style={{ width: "100%", marginTop: 12 }} />
      </article>
    ) : null,
    rsvp: showRsvp ? (
      <article className="invitation-card" key="rsvp">
        <h2>RSVP</h2>
        <form
          action={async (formData) => {
            await handleRsvpSubmit(formData);
          }}
          className="invitation-guestbook-form"
        >
          <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
          <label>
            이름
            <input name="guestName" required type="text" />
          </label>
          <label>
            연락처
            <input name="guestPhone" type="text" />
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
            <input defaultValue={1} max={20} min={0} name="guests" type="number" />
          </label>
          <label>
            메모
            <textarea name="memo" rows={3} />
          </label>
          <button className="btn-primary invitation-wide-btn" disabled={pending} type="submit">
            RSVP 보내기
          </button>
        </form>
        {rsvpMessage ? <p className="form-message success">{rsvpMessage}</p> : null}
        {rsvpError ? <p className="form-message error">{rsvpError}</p> : null}
        {rsvpEntries.length ? <p>최근 응답 {rsvpEntries.length}건이 이 세션에 기록되었습니다.</p> : null}
      </article>
    ) : null,
    guestbook: showGuestbook ? (
      <article className="invitation-card" key="guestbook">
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
            <input name="nickname" required type="text" />
          </label>
          <label>
            메시지
            <textarea name="guestbookMessage" required rows={3} />
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
    ) : null
  };
  const orderedInvitationSections = [
    ...payload.sectionOrder.filter((section, index, sections) => (
      section in invitationSectionNodes && sections.indexOf(section) === index
    )),
    ...invitationSectionKeys.filter((section) => (
      section in invitationSectionNodes && !payload.sectionOrder.includes(section)
    ))
  ]
    .map((section) => invitationSectionNodes[section])
    .filter((section): section is ReactNode => Boolean(section));

  return (
    <main className="invitation-main">
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
            <h1 className="invitation-names">{heroTitle}</h1>
            {heroSubtitle ? <p className="invitation-subtitle">{heroSubtitle}</p> : null}
            <p className="invitation-date">{formatEventDateTime(payload.eventDateTime)}</p>
            <p className="invitation-venue">{formatVenue(payload)}</p>
            <p className="invitation-message">{payload.message}</p>
          </div>
        </div>
      </section>

      <section className="invitation-content">
        {orderedInvitationSections}

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
                  await navigator.share({ title: payload.title, text: payload.message, url: resolvedShareUrl });
                  return;
                }

                await copyToClipboard(resolvedShareUrl);
                setShareMessage("공유 링크를 복사했습니다. 카카오톡 대화창에 붙여넣어 보내 주세요.");
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
                  await navigator.share({ title: payload.title, text: payload.message, url: resolvedShareUrl });
                  return;
                }

                await copyToClipboard(resolvedShareUrl);
                setShareMessage("공유 링크를 복사했습니다. 하객에게 바로 붙여넣어 보내 주세요.");
              }}
              type="button"
            >
              기본 공유
            </button>
            <button
              className="btn-outline invitation-small-btn"
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
          {!shareDisabled && qrImagePath ? (
            <div className="invitation-qr-package">
              <img alt="초대장 QR 코드" src={qrImagePath} />
              <div>
                <strong>QR 코드</strong>
                <p>인쇄물, 안내문, 단체 채팅방 공지에 바로 사용할 수 있습니다.</p>
                <a className="btn-outline invitation-small-btn" download={`${slug}-qr.png`} href={qrImagePath}>
                  QR 저장
                </a>
                <a className="btn-outline invitation-small-btn" download={`${slug}-instagram.png`} href={instagramImagePath}>
                  인스타 이미지
                </a>
                <a className="btn-outline invitation-small-btn" download={`${slug}-a4.png`} href={a4PosterPath}>
                  A4 포스터
                </a>
              </div>
            </div>
          ) : null}
          {shareMessage ? <p className="form-message success">{shareMessage}</p> : null}
        </article>

        {payload.thankYouMessage ? (
          <article className="invitation-card">
            <h2>감사 인사</h2>
            <p style={{ whiteSpace: "pre-line" }}>{payload.thankYouMessage}</p>
          </article>
        ) : null}

        {mode === "public" ? (
          <article className="invitation-card invitation-report-card">
            <h2>신고하기</h2>
            <p>부적절한 내용, 개인정보 노출, 저작권 문제가 있으면 운영자에게 알려 주세요.</p>
            <form
              action={async (formData) => {
                await handleReportSubmit(formData);
              }}
              className="invitation-guestbook-form"
            >
              <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
              <input name="targetType" type="hidden" value="invitation" />
              <label>
                신고 사유
                <select className="modal-input" defaultValue="inappropriate" name="reason">
                  <option value="inappropriate">부적절한 내용</option>
                  <option value="privacy">개인정보 노출</option>
                  <option value="spam">광고/스팸</option>
                  <option value="copyright">저작권 문제</option>
                  <option value="other">기타</option>
                </select>
              </label>
              <label>
                상세 내용
                <textarea maxLength={500} name="detail" rows={3} />
              </label>
              <label>
                회신 받을 정보
                <input maxLength={120} name="reporterContact" placeholder="선택 입력" type="text" />
              </label>
              <button className="btn-outline invitation-wide-btn" disabled={pending} type="submit">
                신고 접수
              </button>
            </form>
            {reportMessage ? <p className="form-message success">{reportMessage}</p> : null}
            {reportError ? <p className="form-message error">{reportError}</p> : null}
          </article>
        ) : null}
      </section>
    </main>
  );
}
