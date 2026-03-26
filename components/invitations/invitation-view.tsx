"use client";

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
  mode: "preview" | "public";
};

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
  mode
}: InvitationViewProps) {
  const [rsvpEntries, setRsvpEntries] = useState<RsvpEntry[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(initialGuestbookEntries);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const selectedTemplate = templates.find((template) => template.id === payload.templateId) ?? templates[0];
  const categoryMeta = getInvitationCategoryMeta(payload);
  const personLines = getInvitationPersonLines(payload);
  const contactLines = getInvitationContactLines(payload);
  const accountEntries = getInvitationAccountEntries(payload);
  const heroTitle = getInvitationHeroTitle(payload);
  const heroSubtitle = getInvitationHeroSubtitle(payload);
  const kakaoJsKey = payload.kakaoJsKey.trim();
  const resolvedShareUrl = getPublicShareUrl(
    shareUrl,
    typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin
  );

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
      throw new Error(result.error || "요청 처리에 실패했습니다.");
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
      setError("이름을 입력해 주세요.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    try {
      if (mode === "public" && slug) {
        const result = await submitPublicForm(`/api/public/${slug}/rsvp`, {
          guestName: nextEntry.guestName,
          guestPhone: nextEntry.guestPhone,
          attending: nextEntry.attending ? "yes" : "no",
          guests: nextEntry.guests,
          memo: nextEntry.memo,
          website: String(formData.get("website") || "")
        });
        setMessage(result.message || "RSVP가 저장되었습니다.");
      } else {
        const current = JSON.parse(window.localStorage.getItem(LOCAL_RSVP_KEY) || "[]") as RsvpEntry[];
        window.localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify([nextEntry, ...current]));
        setMessage("데모 모드에서 RSVP를 저장했습니다.");
      }

      setRsvpEntries((current) => [nextEntry, ...current]);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "RSVP 저장에 실패했습니다.");
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
      setError("이름과 메시지를 모두 입력해 주세요.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    try {
      if (mode === "public" && slug) {
        const result = await submitPublicForm(`/api/public/${slug}/guestbook`, {
          nickname: nextEntry.nickname,
          message: nextEntry.message,
          website: String(formData.get("website") || "")
        });
        setMessage(result.message || "방명록을 남겼습니다.");
      } else {
        const current = JSON.parse(window.localStorage.getItem(LOCAL_GUESTBOOK_KEY) || "[]") as GuestbookEntry[];
        window.localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify([nextEntry, ...current]));
        setMessage("데모 모드에서 방명록을 저장했습니다.");
      }

      if (nextEntry.approved) {
        setGuestbookEntries((current) => [nextEntry, ...current]);
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "방명록 저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  const kakaoPayLink = normalizeUrl(payload.kakaoPayLink);
  const videoUrl = normalizeUrl(payload.videoUrl);
  const backgroundMusicUrl = normalizeUrl(payload.backgroundMusicUrl);
  const mapLink =
    normalizeUrl(payload.naverMapLink) ||
    `https://map.naver.com/p/search/${encodeURIComponent(payload.mapAddress || payload.venueAddress || payload.venueName)}`;

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
                  onClick={() => copyToClipboard(entry.copyValue)}
                  type="button"
                >
                  {entry.copyLabel}
                </button>
              ))}
            </div>
          ) : null}
          <a className={`btn-primary invitation-wide-btn ${kakaoPayLink ? "" : "is-disabled"}`} href={kakaoPayLink || "#"} rel="noreferrer noopener" target="_blank">
            카카오페이 송금 링크 열기
          </a>
        </article>

        <article className="invitation-card">
          <h2>위치</h2>
          <p>{payload.mapAddress || payload.venueAddress || "위치 정보를 입력해 주세요."}</p>
          <p className="invitation-transport">{payload.transportNote}</p>
          <a className="btn-primary invitation-wide-btn" href={mapLink} rel="noreferrer noopener" target="_blank">
            네이버 지도 열기
          </a>
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
          {rsvpEntries.length ? <p>최근 응답 {rsvpEntries.length}건이 이 세션에 기록되었습니다.</p> : null}
        </article>

        <article className="invitation-card">
          <h2>카카오톡으로 보내기</h2>
          <p id="invitationShareHint">카카오 JavaScript 키를 입력하면 카카오톡 공유창으로 바로 보낼 수 있습니다.</p>
          <div className="invitation-inline-actions">
            <button
              className="btn-primary invitation-small-btn"
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
                    setMessage("카카오톡 공유창을 열었습니다.");
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
                setMessage("카카오 공유 설정이 없어 링크를 복사했습니다.");
              }}
              type="button"
            >
              카카오톡 공유
            </button>
            <button
              className="btn-outline invitation-small-btn"
              onClick={async () => {
                if (navigator.share) {
                  await navigator.share({ title: payload.title, text: payload.message, url: resolvedShareUrl });
                  return;
                }

                await copyToClipboard(resolvedShareUrl);
                setMessage("링크를 복사했습니다.");
              }}
              type="button"
            >
              기본 공유
            </button>
            <button className="btn-outline invitation-small-btn" onClick={() => copyToClipboard(resolvedShareUrl)} type="button">
              링크 복사
            </button>
          </div>
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
            <p className="form-message">방명록은 관리자 승인 후 공개됩니다.</p>
          ) : null}
          {message ? <p className="form-message success">{message}</p> : null}
          {error ? <p className="form-message error">{error}</p> : null}
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
