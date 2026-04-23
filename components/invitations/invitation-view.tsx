"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { NaverMapEmbed } from "@/components/invitations/naver-map-embed";
import {
  buildKakaoMapSearchUrl,
  buildKakaoSharePayload,
  getNaverMapLink,
  resolveKakaoJavaScriptKey,
  type KakaoDefaultSharePayload
} from "@/lib/korean-invitation-features";
import {
  LOCAL_GUESTBOOK_KEY,
  LOCAL_RSVP_KEY,
  formatEventDateTime,
  formatTimestampLabel,
  formatVenue,
  type GuestbookEntry,
  type InvitationDraftPayload,
  type MemoryPhotoEntry,
  type RsvpEntry
} from "@/lib/invitation-payload";
import {
  getInvitationAccountEntries,
  getInvitationCategoryMeta,
  getInvitationHeroSubtitle,
  getInvitationHeroTitle,
  getInvitationPersonLines,
  getPublicShareUrl
} from "@/lib/invitation-presentation";

type KakaoShareApi = {
  isInitialized(): boolean;
  init(key: string): void;
  Share: {
    sendDefault(payload: KakaoDefaultSharePayload): void;
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
  initialMemoryPhotoEntries?: MemoryPhotoEntry[];
  platformKakaoJsKey?: string;
  platformNaverMapClientId?: string;
  mode: "preview" | "public";
};

export function resolveInvitationPlatformConfig({
  draftKakaoJsKey,
  platformKakaoJsKey,
  platformNaverMapClientId
}: {
  draftKakaoJsKey: string;
  platformKakaoJsKey?: string;
  platformNaverMapClientId?: string;
}) {
  return {
    kakaoJsKey: resolveKakaoJavaScriptKey(
      draftKakaoJsKey,
      platformKakaoJsKey ?? process.env.NEXT_PUBLIC_KAKAO_JS_KEY
    ),
    naverMapClientId: platformNaverMapClientId ?? process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? ""
  };
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : "";
}

const fallbackGalleryByCategory: Record<string, string[]> = {
  wedding: [
    "/images/generated/wedding/wedding-peony-arch.png",
    "/images/generated/wedding/wedding-white-botanical.png",
    "/images/generated/wedding/wedding-green-wreath.png",
    "/images/generated/wedding/wedding-gold-formal.png",
    "/images/generated/wedding/wedding-premium-romantic-arch.png",
    "/images/generated/wedding/wedding-chapel-sketch.png"
  ],
  dol: [
    "/images/generated/dol/dol-teddy-balloon.png",
    "/images/generated/dol/dol-baby-crown-character.png",
    "/images/generated/dol/dol-pastel-cake-balloons.png",
    "/images/generated/dol/dol-blue-ribbon-check.png"
  ],
  bridal: [
    "/images/generated/bridal/bridal-pink-ribbon.png",
    "/images/generated/bridal/bridal-boho-dried-flower.png",
    "/images/generated/bridal/bridal-mint-fresh.png",
    "/images/generated/bridal/bridal-vanity-floral.png"
  ],
  housewarming: [
    "/images/generated/housewarming/housewarming-green-home.png",
    "/images/genspark/6XcxVcVH.jpg"
  ],
  hwangap: [
    "/images/generated/hwangap/hwangap-floral-classic.png",
    "/images/generated/hwangap/hwangap-green-traditional.png",
    "/images/generated/hwangap/hwangap-navy-gold.png",
    "/images/generated/hwangap/hwangap-crane-pine.png"
  ]
};

function InvitationSectionTitle({ en, ko }: { en: string; ko: string }) {
  return (
    <div className="scroll-invite-section-title">
      <span>{en}</span>
      <h2>{ko}</h2>
      <i />
    </div>
  );
}

function getEventDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCalendarCells(eventDate: Date | null) {
  const fallback = new Date("2026-10-24T13:00:00");
  const date = eventDate ?? fallback;
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return {
    monthLabel: `${year}. ${String(month + 1).padStart(2, "0")}`,
    selectedDay: date.getDate(),
    cells: [
      ...Array.from({ length: firstDay }, (_, index) => ({ key: `empty-${index}`, day: 0 })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({ key: `day-${index + 1}`, day: index + 1 }))
    ]
  };
}

function getDDayLabel(eventDate: Date | null) {
  if (!eventDate) {
    return "날짜를 입력해 주세요.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(eventDate);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff > 0) {
    return `${diff}일 남았습니다.`;
  }

  if (diff === 0) {
    return "오늘입니다.";
  }

  return "소중한 날을 함께해 주셔서 감사합니다.";
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
  initialMemoryPhotoEntries = [],
  platformKakaoJsKey,
  platformNaverMapClientId,
  mode
}: InvitationViewProps) {
  const [rsvpEntries, setRsvpEntries] = useState<RsvpEntry[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(initialGuestbookEntries);
  const [memoryPhotoEntries, setMemoryPhotoEntries] = useState<MemoryPhotoEntry[]>(initialMemoryPhotoEntries);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpError, setRsvpError] = useState("");
  const [guestbookMessage, setGuestbookMessage] = useState("");
  const [guestbookError, setGuestbookError] = useState("");
  const [memoryMessage, setMemoryMessage] = useState("");
  const [memoryError, setMemoryError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [pending, setPending] = useState(false);
  const categoryMeta = getInvitationCategoryMeta(payload);
  const personLines = getInvitationPersonLines(payload);
  const accountEntries = getInvitationAccountEntries(payload);
  const heroTitle = getInvitationHeroTitle(payload);
  const heroSubtitle = getInvitationHeroSubtitle(payload);
  const { kakaoJsKey, naverMapClientId } = resolveInvitationPlatformConfig({
    draftKakaoJsKey: payload.kakaoJsKey,
    platformKakaoJsKey,
    platformNaverMapClientId
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
      side: String(formData.get("side") || "shared") as RsvpEntry["side"],
      mealPreference: String(formData.get("mealPreference") || "undecided") as RsvpEntry["mealPreference"],
      shuttleNeeded: String(formData.get("shuttleNeeded") || "no") === "yes",
      companionNames: String(formData.get("companionNames") || ""),
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
          side: nextEntry.side,
          mealPreference: nextEntry.mealPreference,
          shuttleNeeded: nextEntry.shuttleNeeded ? "yes" : "no",
          companionNames: nextEntry.companionNames,
          memo: nextEntry.memo,
          website: String(formData.get("website") || "")
        });
        setRsvpMessage("참석 응답이 접수되었습니다. 변경이 필요하면 호스트에게 바로 알려 주세요.");
      } else {
        const current = JSON.parse(window.localStorage.getItem(LOCAL_RSVP_KEY) || "[]") as RsvpEntry[];
        window.localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify([nextEntry, ...current]));
        setRsvpMessage("데모 모드에서 참석 응답을 저장했습니다.");
      }

      setRsvpEntries((current) => [nextEntry, ...current]);
    } catch (submissionError) {
      setRsvpError(submissionError instanceof Error ? submissionError.message : "참석 응답 저장에 실패했습니다.");
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

  async function handleMemoryPhotoSubmit(formData: FormData) {
    const file = formData.get("file");
    const nickname = String(formData.get("nickname") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!nickname) {
      setMemoryError("사진을 남긴 분의 이름을 입력해 주세요.");
      return;
    }

    if (!(file instanceof File) || file.size === 0) {
      setMemoryError("업로드할 사진을 선택해 주세요.");
      return;
    }

    setPending(true);
    setMemoryError("");
    setMemoryMessage("");

    try {
      if (mode === "public" && slug) {
        await fetch(`/api/public/${slug}/memory`, {
          method: "POST",
          body: formData
        }).then(async (response) => {
          const result = (await response.json().catch(() => ({}))) as { message?: string };
          if (!response.ok) {
            throw new Error(result.message || "사진 업로드에 실패했습니다.");
          }
          return result;
        });
        setMemoryMessage("사진이 접수되었습니다. 호스트 확인 후 공개됩니다.");
      } else {
        const imageUrl = URL.createObjectURL(file);
        setMemoryPhotoEntries((current) => [
          {
            id: crypto.randomUUID(),
            nickname,
            message,
            imageUrl,
            approved: true,
            createdAt: new Date().toISOString()
          },
          ...current
        ]);
        setMemoryMessage("미리보기에서 사진을 추가했습니다.");
      }
    } catch (submissionError) {
      setMemoryError(submissionError instanceof Error ? submissionError.message : "사진 업로드에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  const kakaoPayLink = normalizeUrl(payload.kakaoPayLink);
  const videoUrl = normalizeUrl(payload.videoUrl);
  const backgroundMusicUrl = normalizeUrl(payload.backgroundMusicUrl);
  const mapLink = getNaverMapLink(payload);
  const kakaoMapLink = buildKakaoMapSearchUrl(payload);
  const addressForCopy = payload.mapAddress || payload.venueAddress || payload.venueName;

  const eventDate = getEventDate(payload.eventDateTime);
  const calendar = getCalendarCells(eventDate);
  const galleryImages = payload.galleryImages.length
    ? payload.galleryImages
    : fallbackGalleryByCategory[payload.category] ?? fallbackGalleryByCategory.wedding;
  const coverImage = payload.mainImageUrl || payload.backgroundImageUrl || galleryImages[0] || "/images/generated/wedding/wedding-white-botanical.png";
  const groomParentLine = [payload.groomFatherName, payload.groomMotherName].filter(Boolean).join(" · ");
  const brideParentLine = [payload.brideFatherName, payload.brideMotherName].filter(Boolean).join(" · ");

  return (
    <main className="scroll-invite-main">
      <section className="scroll-invite-cover">
        <img alt="초대장 커버 이미지" src={coverImage} />
        <div className="scroll-invite-cover-copy">
          <p>{categoryMeta.badgeText}</p>
          <h1>{heroTitle}</h1>
          {heroSubtitle ? <span>{heroSubtitle}</span> : null}
          <small>
            {formatEventDateTime(payload.eventDateTime)}
            <br />
            {formatVenue(payload)}
          </small>
        </div>
      </section>

      <section className="scroll-invite-letter">
        <InvitationSectionTitle en="INVITATION" ko="모시는 글" />
        <p>{payload.message}</p>
        <div className="scroll-invite-parents">
          {groomParentLine ? (
            <p><b>{groomParentLine}</b><span>의 아들</span><strong>{payload.groomName}</strong></p>
          ) : null}
          {brideParentLine ? (
            <p><b>{brideParentLine}</b><span>의 딸</span><strong>{payload.brideName}</strong></p>
          ) : null}
          {!groomParentLine && !brideParentLine && personLines.length ? (
            <p className="scroll-invite-plain-line">{personLines.join("\n")}</p>
          ) : null}
        </div>
        <div className="scroll-invite-contact-row">
          <a href={payload.groomPhone ? `tel:${payload.groomPhone}` : "#"}>신랑측 전화</a>
          <a href={payload.bridePhone ? `sms:${payload.bridePhone}` : "#"}>신부측 문자</a>
        </div>
      </section>

      <section className="scroll-invite-gallery">
        <InvitationSectionTitle en="GALLERY" ko="우리의 순간" />
        <div>
          {galleryImages.slice(0, 6).map((imageUrl, index) => (
            <img alt={`초대장 갤러리 이미지 ${index + 1}`} key={`${imageUrl}-${index}`} src={imageUrl} />
          ))}
        </div>
      </section>

      <section className="scroll-invite-calendar">
        <InvitationSectionTitle en="CALENDAR" ko="예식일" />
        <h3>{calendar.monthLabel}</h3>
        <div className="scroll-invite-calendar-grid">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
            <b className={index === 0 ? "is-sunday" : ""} key={day}>{day}</b>
          ))}
          {calendar.cells.map((cell) => (
            <span className={cell.day === calendar.selectedDay ? "is-event-day" : ""} key={cell.key}>
              {cell.day || ""}
            </span>
          ))}
        </div>
        <p>
          {heroTitle}의 날이
          <br />
          <strong>{getDDayLabel(eventDate)}</strong>
        </p>
      </section>

      <section className="scroll-invite-location">
        <InvitationSectionTitle en="LOCATION" ko="오시는 길" />
        <h3>{payload.venueName || "행사장 이름을 입력해 주세요."}</h3>
        <p>{payload.mapAddress || payload.venueAddress || "주소를 입력해 주세요."}</p>
        <div className="scroll-invite-map">
          <NaverMapEmbed clientId={naverMapClientId} payload={payload} />
          <span>네이버/카카오 지도 연동</span>
        </div>
        <div className="scroll-invite-action-row">
          <button
            onClick={async () => {
              await copyToClipboard(addressForCopy);
            }}
            type="button"
          >
            주소 복사
          </button>
          <a href={kakaoMapLink} rel="noreferrer noopener" target="_blank">카카오맵 열기</a>
        </div>
        <dl>
          <dt>위치 안내</dt>
          <dd>{payload.transportNote || "대중교통과 주차 안내를 입력해 주세요."}</dd>
          <dt>네이버 지도</dt>
          <dd><a href={mapLink} rel="noreferrer noopener" target="_blank">네이버 지도 열기</a></dd>
        </dl>
      </section>

      <section className="scroll-invite-gift">
        <InvitationSectionTitle en="GIFT" ko="마음 전하실 곳" />
        <p>
          참석이 어려우신 분들을 위해
          <br />
          계좌번호를 기재하였습니다.
        </p>
        {accountEntries.length ? (
          accountEntries.map((entry) => (
            <details key={entry.label}>
              <summary>{entry.label}</summary>
              <div>
                <span>{entry.value}</span>
                <button
                  onClick={async () => {
                    await copyToClipboard(entry.copyValue);
                  }}
                  type="button"
                >
                  복사
                </button>
              </div>
            </details>
          ))
        ) : (
          <p>계좌 정보를 입력해 주세요.</p>
        )}
        <a className={kakaoPayLink ? "" : "is-disabled"} href={kakaoPayLink || "#"} rel="noreferrer noopener" target="_blank">
          카카오페이 송금 링크 열기
        </a>
      </section>

      {videoUrl ? (
        <section className="scroll-invite-card-section">
          <InvitationSectionTitle en="VIDEO" ko="식전 영상" />
          <p>예식 전 함께 보실 수 있는 영상을 준비했습니다.</p>
          <a href={videoUrl} rel="noreferrer noopener" target="_blank">영상 보기</a>
        </section>
      ) : null}

      {backgroundMusicUrl ? (
        <section className="scroll-invite-card-section">
          <InvitationSectionTitle en="MUSIC" ko="배경음악" />
          <audio controls preload="none" src={backgroundMusicUrl} />
        </section>
      ) : null}

      <section className="scroll-invite-card-section">
        <InvitationSectionTitle en="REPLY" ko="참석 응답" />
        <form
          action={async (formData) => {
            await handleRsvpSubmit(formData);
          }}
          className="scroll-invite-form"
        >
          <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
          <label>이름<input name="guestName" required type="text" /></label>
          <label>연락처<input name="guestPhone" type="text" /></label>
          <label>
            참석 여부
            <select defaultValue="yes" name="attending">
              <option value="yes">참석</option>
              <option value="no">불참</option>
            </select>
          </label>
          <label>동행 인원<input defaultValue={1} max={20} min={0} name="guests" type="number" /></label>
          <label>
            하객 구분
            <select defaultValue="shared" name="side">
              <option value="shared">함께 아는 하객</option>
              <option value="groom">신랑측 하객</option>
              <option value="bride">신부측 하객</option>
            </select>
          </label>
          <label>
            식사 예정
            <select defaultValue="undecided" name="mealPreference">
              <option value="undecided">아직 미정</option>
              <option value="yes">식사 예정</option>
              <option value="no">식사 안 함</option>
            </select>
          </label>
          <label>메모<textarea name="memo" rows={3} /></label>
          <button disabled={pending} type="submit">참석 응답 보내기</button>
        </form>
        {rsvpMessage ? <p className="form-message success">{rsvpMessage}</p> : null}
        {rsvpError ? <p className="form-message error">{rsvpError}</p> : null}
        {rsvpEntries.length ? <p>최근 응답 {rsvpEntries.length}건이 이 세션에 기록되었습니다.</p> : null}
      </section>

      <section className="scroll-invite-card-section">
        <InvitationSectionTitle en="PHOTO" ko="하객 사진 남기기" />
        <p>예식 당일의 순간을 사진으로 남겨 주세요. 접수된 사진은 호스트 확인 후 추억 앨범에 공개됩니다.</p>
        <form
          action={async (formData) => {
            await handleMemoryPhotoSubmit(formData);
          }}
          className="scroll-invite-form"
        >
          <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
          <label>이름<input name="nickname" required type="text" /></label>
          <label>사진 설명<input maxLength={200} name="message" placeholder="예: 신부대기실에서 남긴 사진" type="text" /></label>
          <label>사진<input accept="image/jpeg,image/png,image/webp" name="file" required type="file" /></label>
          <button disabled={pending} type="submit">사진 남기기</button>
        </form>
        {memoryMessage ? <p className="form-message success">{memoryMessage}</p> : null}
        {memoryError ? <p className="form-message error">{memoryError}</p> : null}
        {memoryPhotoEntries.length ? (
          <div className="scroll-invite-memory-grid">
            {memoryPhotoEntries.map((entry) => (
              <figure key={entry.id}>
                <img alt={`${entry.nickname}님이 남긴 사진`} src={entry.imageUrl} />
                <figcaption>
                  <strong>{entry.nickname}</strong>
                  {entry.message ? <p>{entry.message}</p> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </section>

      <section className="scroll-invite-card-section">
        <InvitationSectionTitle en="MESSAGE" ko="방명록" />
        <form
          action={async (formData) => {
            await handleGuestbookSubmit(formData);
          }}
          className="scroll-invite-form"
        >
          <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
          <label>이름<input name="nickname" required type="text" /></label>
          <label>메시지<textarea name="guestbookMessage" required rows={3} /></label>
          <button disabled={pending} type="submit">방명록 남기기</button>
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
                <div className="meta">{formatTimestampLabel(entry.createdAt)} · {entry.nickname}</div>
                <div className="value">{entry.message}</div>
              </li>
            ))
          ) : (
            <li className="meta">첫 번째 축하 메시지를 남겨 주세요.</li>
          )}
        </ul>
      </section>

      <footer className="scroll-invite-footer">
        <p>{heroTitle}</p>
        <div>
          <button
            disabled={shareDisabled}
            onClick={async () => {
              try {
                const kakao = await ensureKakaoSdk(kakaoJsKey);

                if (kakao) {
                  kakao.Share.sendDefault(buildKakaoSharePayload(payload, resolvedShareUrl));
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
        {shareDisabled ? (
          <small>미리보기 단계에서는 나만 볼 수 있습니다. 하객에게 보낼 링크는 발행 후 공개 링크를 사용해 주세요.</small>
        ) : (
          <small>공유 링크 · {resolvedShareUrl}</small>
        )}
        {shareMessage ? <p className="form-message success">{shareMessage}</p> : null}
      </footer>

      {payload.thankYouMessage ? (
        <section className="scroll-invite-card-section">
          <InvitationSectionTitle en="THANKS" ko="감사 인사" />
          <p style={{ whiteSpace: "pre-line" }}>{payload.thankYouMessage}</p>
        </section>
      ) : null}
    </main>
  );
}
