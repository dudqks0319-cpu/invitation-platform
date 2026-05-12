"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type PublishRecoveryPanelProps = {
  invitationId: string;
  missingFields: string[];
  slug: string;
  status: string;
  title: string;
};

export function PublishRecoveryPanel({
  invitationId,
  missingFields,
  slug,
  status,
  title
}: PublishRecoveryPanelProps) {
  const [pending, setPending] = useState(false);
  const [publicSlug, setPublicSlug] = useState(status === "published" ? slug : "");
  const [message, setMessage] = useState(status === "published" ? "이미 공개 링크가 준비되어 있습니다." : "");
  const [error, setError] = useState("");

  async function recoverPublish() {
    trackEvent("publish_recovery_attempt", {
      invitation_id: invitationId
    });
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/payments/publish-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ invitationId })
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        slug?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "발행 복구에 실패했습니다.");
      }

      setPublicSlug(result.slug ?? slug);
      trackEvent("publish_recovery_success", {
        invitation_id: invitationId,
        slug: result.slug ?? slug
      });
      setMessage("공개 링크가 준비됐습니다. 이제 하객에게 초대장을 보낼 수 있어요.");
    } catch (recoveryError) {
      setError(recoveryError instanceof Error ? recoveryError.message : "발행 복구에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function copyRecoveredLink() {
    if (!publicSlug || typeof window === "undefined") {
      return;
    }

    const publicUrl = `${window.location.origin}/invitations/${publicSlug}`;
    await navigator.clipboard.writeText(publicUrl);
    trackEvent("share_click", {
      method: "copy_link",
      surface: "publish_recovery"
    });
    setMessage("공개 링크를 복사했습니다. 하객에게 바로 붙여넣어 보내 주세요.");
  }

  async function shareRecoveredLink() {
    if (!publicSlug || typeof window === "undefined") {
      return;
    }

    const publicUrl = `${window.location.origin}/invitations/${publicSlug}`;

    if (navigator.share) {
      await navigator.share({
        title,
        text: "초대장을 확인해 주세요.",
        url: publicUrl
      });
      trackEvent("share_click", {
        method: "native_share",
        surface: "publish_recovery"
      });
      setMessage("공유창을 열었습니다.");
      return;
    }

    await navigator.clipboard.writeText(publicUrl);
    trackEvent("share_click", {
      method: "copy_link",
      surface: "publish_recovery"
    });
    setMessage("공유 링크를 복사했습니다. 카카오톡 대화창에 붙여넣어 보내 주세요.");
  }

  return (
    <section className="builder-section builder-section-page">
      <div className="section-inner">
        <article className="ops-card publish-recovery-card">
          <p className="section-kicker">결제 완료 · 발행 복구</p>
          <h1 className="section-title" style={{ textAlign: "left" }}>
            {publicSlug ? "공개 링크가 준비됐습니다" : "발행 전 확인이 필요합니다"}
          </h1>
          <p className="ops-note">
            {title} 초대장은 결제가 확인된 상태입니다. 다시 결제하지 않고 필요한 정보만 확인해 공개 링크를 완성할 수 있습니다.
          </p>

          {missingFields.length ? (
            <div className="builder-readiness-card" style={{ marginTop: 18 }}>
              <strong>공개 전 아직 {missingFields.length}개가 남았어요</strong>
              <p className="builder-help">아래 항목을 빌더에서 채운 뒤 이 화면으로 돌아와 발행을 완료해 주세요.</p>
              <div className="builder-readiness-list">
                {missingFields.map((field) => (
                  <span className="readiness-item missing" key={field}>
                    <span>필요</span>
                    {field}
                  </span>
                ))}
              </div>
              <Link className="btn-outline" href={`/builder?invitationId=${invitationId}`}>
                부족한 항목 수정하기
              </Link>
            </div>
          ) : (
            <button className="btn-primary form-submit" disabled={pending || Boolean(publicSlug)} onClick={recoverPublish} type="button">
              {pending ? "발행 복구 중..." : publicSlug ? "발행 완료" : "발행 복구 완료하기"}
            </button>
          )}

          {publicSlug ? (
            <div className="header-actions" style={{ marginTop: 20 }}>
              <button className="btn-primary" onClick={() => void shareRecoveredLink()} type="button">
                공유하기
              </button>
              <button className="btn-outline" onClick={() => void copyRecoveredLink()} type="button">
                링크 복사
              </button>
              <Link className="btn-outline" href={`/invitations/${publicSlug}`}>
                실제 화면 보기
              </Link>
              <Link className="btn-outline" href="/dashboard">
                RSVP 운영
              </Link>
            </div>
          ) : null}
          {message ? <p className="form-message success">{message}</p> : null}
          {error ? <p className="form-message error">{error}</p> : null}
        </article>
      </div>
    </section>
  );
}
