"use client";

import { useState } from "react";
import { TemplateMarkup } from "@/components/landing/template-markup";
import {
  LOCAL_GUESTBOOK_KEY,
  LOCAL_RSVP_KEY,
  formatAccounts,
  formatEventDateTime,
  formatParents,
  formatVenue,
  type GuestbookEntry,
  type InvitationDraftPayload,
  type RsvpEntry
} from "@/lib/invitation-payload";
import { templates } from "@/lib/templates";

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
  const selectedTemplate = templates.find((t) => t.id === payload.templateId) ?? templates[0];

  async function copyToClipboard(value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setMessage("복사했습니다!");
    } catch {
      setError("복사에 실패했습니다.");
    }
  }

  async function submitPublicForm(endpoint: string, payloadBody: object) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "RSVP 저장에 실패했습니다.");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "방명록 저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  const kakaoPayLink = normalizeUrl(payload.kakaoPayLink);
  const mapLink =
    normalizeUrl(payload.naverMapLink) ||
    `https://map.naver.com/p/search/${encodeURIComponent(payload.venueAddress || payload.venueName)}`;

  return (
    <main className="invitation-main">
      <section
        className="invitation-hero"
        style={
          payload.backgroundImageUrl
            ? { backgroundImage: `url(${payload.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {!payload.backgroundImageUrl && (
          <div className="invitation-template-backdrop">
            <TemplateMarkup template={selectedTemplate} />
          </div>
        )}
        <div className="invitation-hero-overlay" />
        <div className="invitation-hero-inner">
          {!payload.backgroundImageUrl && (
            <div className="invitation-template-showcase">
              <TemplateMarkup template={selectedTemplate} />
            </div>
          )}
          {payload.mainImageUrl && (
            <div className="invitation-main-image-wrap">
              <img alt="초대장 메인 이미지" src={payload.mainImageUrl} style={{ display: "block" }} />
            </div>
          )}
          <p className="invitation-category">{payload.category.toUpperCase()} INVITATION</p>
          <h1 className="invitation-names">
            {payload.groomName || "신랑"} ♡ {payload.brideName || "신부"}
          </h1>
          <p className="invitation-date">{formatEventDateTime(payload.eventDateTime)}</p>
          <p className="invitation-venue">{formatVenue(payload)}</p>
          <p className="invitation-message">{payload.message}</p>
        </div>
      </section>

      <section className="invitation-content">
        <article className="invitation-card">
          <h2>혼주 정보</h2>
          <p>{formatParents(payload)}</p>
        </article>

        <article className="invitation-card">
          <h2>연락처</h2>
          <p>
            {[
              payload.groomPhone ? `신랑 ${payload.groomPhone}` : "",
              payload.bridePhone ? `신부 ${payload.bridePhone}` : ""
            ]
              .filter(Boolean)
              .join(" · ") || "연락처를 입력해 주세요."}
          </p>
        </article>

        <article className="invitation-card">
          <h2>마음 전하실 곳</h2>
          <p>{formatAccounts(payload)}</p>
          <div className="invitation-inline-actions">
            <button
              className="btn-outline invitation-small-btn"
              type="button"
              onClick={() => copyToClipboard(payload.groomBankAccount)}
            >
              신랑측 계좌 복사
            </button>
            <button
              className="btn-outline invitation-small-btn"
              type="button"
              onClick={() => copyToClipboard(payload.brideBankAccount)}
            >
              신부측 계좌 복사
            </button>
          </div>
          <a
            className={`btn-primary invitation-wide-btn ${kakaoPayLink ? "" : "is-disabled"}`}
            href={kakaoPayLink || "#"}
            rel="noreferrer noopener"
            target="_blank"
          >
            카카오페이 송금 링크 열기
          </a>
        </article>

        <article className="invitation-card">
          <h2>위치</h2>
          <p>{payload.venueAddress || "위치 정보를 입력해 주세요."}</p>
          <p className="invitation-transport">{payload.transportNote}</p>
          <a className="btn-primary invitation-wide-btn" href={mapLink} rel="noreferrer noopener" target="_blank">
            네이버 지도 열기
          </a>
        </article>

        <article className="invitation-card">
          <h2>RSVP</h2>
          <form
            action={async (fd) => {
              await handleRsvpSubmit(fd);
            }}
            className="invitation-guestbook-form"
          >
            <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
            <label>이름 <input name="guestName" required type="text" /></label>
            <label>연락처 <input name="guestPhone" type="text" /></label>
            <label>
              참석 여부
              <select className="modal-input" defaultValue="yes" name="attending">
                <option value="yes">참석</option>
                <option value="no">불참</option>
              </select>
            </label>
            <label>동행 인원 <input defaultValue={1} max={50} min={0} name="guests" type="number" /></label>
            <label>메모 <textarea name="memo" rows={3} /></label>
            <button className="btn-primary invitation-wide-btn" disabled={pending} type="submit">
              RSVP 보내기
            </button>
          </form>
          {rsvpEntries.length > 0 && (
            <p>최근 응답 {rsvpEntries.length}건이 이 세션에 기록되었습니다.</p>
          )}
        </article>

        <article className="invitation-card">
          <h2>공유하기</h2>
          <div className="invitation-inline-actions">
            <button
              className="btn-primary invitation-small-btn"
              type="button"
              onClick={async () => {
                const fullUrl = typeof window !== "undefined"
                  ? window.location.origin + shareUrl
                  : shareUrl;
                if (navigator.share) {
                  await navigator.share({ title: payload.title, text: payload.message, url: fullUrl });
                  return;
                }
                await copyToClipboard(fullUrl);
              }}
            >
              공유하기
            </button>
            <button
              className="btn-outline invitation-small-btn"
              type="button"
              onClick={() => {
                const fullUrl = typeof window !== "undefined"
                  ? window.location.origin + shareUrl
                  : shareUrl;
                void copyToClipboard(fullUrl);
              }}
            >
              링크 복사
            </button>
          </div>
        </article>

        <article className="invitation-card">
          <h2>방명록</h2>
          <form
            action={async (fd) => {
              await handleGuestbookSubmit(fd);
            }}
            className="invitation-guestbook-form"
          >
            <input autoComplete="off" name="website" style={{ display: "none" }} tabIndex={-1} type="text" />
            <label>이름 <input name="nickname" required type="text" /></label>
            <label>메시지 <textarea name="guestbookMessage" required rows={3} /></label>
            <button className="btn-primary invitation-wide-btn" disabled={pending} type="submit">
              방명록 남기기
            </button>
          </form>
          {mode === "public" && <p className="form-message">방명록은 관리자 승인 후 공개됩니다.</p>}
          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}
          <ul className="list-box invitation-guestbook-list">
            {guestbookEntries.length > 0 ? (
              guestbookEntries.map((entry) => (
                <li key={entry.id}>
                  <div className="meta">
                    {new Date(entry.createdAt).toLocaleString("ko-KR")} · {entry.nickname}
                  </div>
                  <div className="value">{entry.message}</div>
                </li>
              ))
            ) : (
              <li className="meta">첫 번째 축하 메시지를 남겨 주세요.</li>
            )}
          </ul>
        </article>
      </section>
    </main>
  );
}
