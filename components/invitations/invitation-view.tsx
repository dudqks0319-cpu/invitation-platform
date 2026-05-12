"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { TemplateMarkup } from "@/components/landing/template-markup";
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
  const [shareMessage, setShareMessage] = useState("");
  const [accountCopyMessage, setAccountCopyMessage] = useState("");
  const [rsvpAttending, setRsvpAttending] = useState<"yes" | "no">("yes");
  const [rsvpGuestCount, setRsvpGuestCount] = useState(1);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const selectedTemplate = templates.find((template) => template.id === payload.templateId) ?? templates[0];
  const categoryMeta = getInvitationCategoryMeta(payload);
  const personLines = getInvitationPersonLines(payload);
  const contactLines = getInvitationContactLines(payload);
  const accountEntries = getInvitationAccountEntries(payload);
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

  async function copyToClipboard(value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  }

  async function copyAccount(value: string) {
    try {
      await copyToClipboard(value);
      setAccountCopyMessage("계좌번호를 복사했습니다.");
    } catch {
      setAccountCopyMessage("복사가 제한되었습니다. 계좌번호를 직접 선택해 복사해 주세요.");
    }
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

  async function handleRsvpSubmit(formData: FormData, form?: HTMLFormElement) {
    const attending = rsvpAttending === "yes";
    const parsedGuestCount = Number(formData.get("guests") || rsvpGuestCount || 1);
    const nextEntry: RsvpEntry = {
      id: crypto.randomUUID(),
      guestName: String(formData.get("guestName") || ""),
      guestPhone: String(formData.get("guestPhone") || ""),
      attending,
      guests: attending && Number.isFinite(parsedGuestCount) ? Math.max(1, parsedGuestCount) : 0,
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
      form?.reset();
      setRsvpAttending("yes");
      setRsvpGuestCount(1);
      setRsvpSubmitted(true);
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
  const mapQuery = encodeURIComponent(payload.mapAddress || payload.venueAddress || payload.venueName);
  const mapLink =
    normalizeUrl(payload.naverMapLink) ||
    `https://map.naver.com/p/search/${mapQuery}`;
  const kakaoMapLink =
    normalizeUrl(payload.kakaoMapLink) ||
    `https://map.kakao.com/link/search/${mapQuery}`;

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
                  onClick={() => copyAccount(entry.copyValue)}
                  type="button"
                >
                  {entry.copyLabel}
                </button>
              ))}
            </div>
          ) : null}
          {accountCopyMessage ? <p className="form-message success">{accountCopyMessage}</p> : null}
          {kakaoPayLink ? (
            <a className="btn-primary invitation-wide-btn" href={kakaoPayLink} rel="noreferrer noopener" target="_blank">
              카카오페이 송금 링크 열기
            </a>
          ) : (
            <p className="form-message">카카오페이 송금 링크가 등록되지 않았습니다.</p>
          )}
        </article>

        <article className="invitation-card">
          <h2>위치</h2>
          <p>{payload.mapAddress || payload.venueAddress || "위치 정보를 입력해 주세요."}</p>
          <p className="invitation-transport">{payload.transportNote}</p>
          <div className="invitation-inline-actions">
            <a className="btn-primary invitation-small-btn" href={mapLink} rel="noreferrer noopener" target="_blank">
              네이버 지도 열기
            </a>
            <a className="btn-outline invitation-small-btn" href={kakaoMapLink} rel="noreferrer noopener" target="_blank">
              카카오맵 열기
            </a>
          </div>
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
          <h2>RSVP</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleRsvpSubmit(new FormData(event.currentTarget), event.currentTarget);
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
              <select
                className="modal-input"
                name="attending"
                onChange={(event) => {
                  const nextAttending = event.target.value === "no" ? "no" : "yes";
                  setRsvpAttending(nextAttending);
                  setRsvpGuestCount(nextAttending === "no" ? 0 : Math.max(1, rsvpGuestCount));
                }}
                value={rsvpAttending}
              >
                <option value="yes">참석</option>
                <option value="no">불참</option>
              </select>
            </label>
            <label>
              동행 인원
              <input
                disabled={rsvpAttending === "no"}
                max={20}
                min={rsvpAttending === "no" ? 0 : 1}
                name="guests"
                onChange={(event) => {
                  setRsvpGuestCount(Number(event.target.value || 0));
                }}
                type="number"
                value={rsvpGuestCount}
              />
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
          {rsvpSubmitted ? <p className="form-message">이미 이 세션에서 RSVP를 보냈습니다. 다시 제출하기 전 입력 내용을 확인해 주세요.</p> : null}
          {rsvpEntries.length ? <p>최근 응답 {rsvpEntries.length}건이 이 세션에 기록되었습니다.</p> : null}
        </article>

        <article className="invitation-card">
          <h2>이 초대장 공유하기</h2>
          {shareDisabled ? (
            <p className="form-message error" id="invitationShareHint">
              미리보기 단계에서는 나만 볼 수 있습니다. 하객에게 보낼 링크는 발행 후 공개 링크를 사용해 주세요.
            </p>
          ) : (
            <p id="invitationShareHint">카카오톡 공유 또는 링크 복사로 초대장을 전달할 수 있습니다.</p>
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
                await copyToClipboard(resolvedShareUrl);
                setShareMessage("공유 링크를 복사했습니다. 하객에게 바로 붙여넣어 보내 주세요.");
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

        {payload.thankYouMessage ? (
          <article className="invitation-card">
            <h2>감사 인사</h2>
            <p style={{ whiteSpace: "pre-line" }}>{payload.thankYouMessage}</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
