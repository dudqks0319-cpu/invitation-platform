"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { authDestination } from "@/lib/auth";
import { LOCAL_DRAFT_KEY, createInvitationSlug, normalizeDraft, type InvitationDraftPayload } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";

type DraftMeta = {
  id?: string;
  slug?: string;
  status?: string;
};

type StoredDraft = {
  payload: InvitationDraftPayload;
  meta?: DraftMeta;
};

export function CheckoutFlow({
  initialInvitationId,
  initialPaymentState
}: {
  initialInvitationId?: string;
  initialPaymentState?: string;
}) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [invitationId, setInvitationId] = useState(initialInvitationId ?? "");
  const [invitationTitle, setInvitationTitle] = useState("초대장 결제");
  const [publicSlug, setPublicSlug] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [pricing, setPricing] = useState(() => getInvitationPricing(normalizeDraft({})));

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        setBuyerEmail((current) => current || user.email || "");
      }
    })();
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void (async () => {
      if (initialPaymentState === "cancelled") {
        setError("결제가 취소되었습니다. 다시 시도해 주세요.");
      }

      if (initialPaymentState === "failed") {
        setError("결제 승인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }

      if (initialPaymentState === "success" && initialInvitationId) {
        const { data } = await supabase
          .from("invitations")
          .select("slug, title")
          .eq("id", initialInvitationId)
          .maybeSingle();

        if (data) {
          setInvitationTitle(data.title);
          setPublicSlug(data.slug);
          setMessage("결제가 완료되어 초대장이 발행되었습니다.");
        }
        return;
      }

      if (initialInvitationId) {
        const { data } = await supabase
          .from("invitations")
          .select("*")
          .eq("id", initialInvitationId)
          .maybeSingle();

        if (data) {
          const payload = normalizeDraft(data.payload);
          setInvitationTitle(data.title);
          setPublicSlug(data.slug);
          setInvitationId(data.id);
          setPricing(getInvitationPricing(payload));
          return;
        }
      }

      const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as StoredDraft;
      const payload = normalizeDraft(parsed.payload ?? {});
      const nextSlug = parsed.meta?.slug || createInvitationSlug(payload);
      setInvitationTitle(payload.title);
      setPublicSlug(nextSlug);
      setPricing(getInvitationPricing(payload));

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const invitationInput = {
        user_id: user.id,
        slug: nextSlug,
        title: payload.title,
        category: payload.category,
        template_id: payload.templateId,
        status: "draft",
        payload,
        repurchase_required: false,
        paid_payload_snapshot: null,
        published_at: null
      };

      const existingDraftId = parsed.meta?.status === "draft" ? parsed.meta.id : undefined;
      const query = existingDraftId
        ? supabase.from("invitations").update(invitationInput).eq("id", existingDraftId).select().single()
        : supabase.from("invitations").insert(invitationInput).select().single();

      const { data, error } = await query;

      if (error || !data) {
        setError("초대장 초안을 결제 대상으로 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      window.localStorage.setItem(
        LOCAL_DRAFT_KEY,
        JSON.stringify({
          payload,
          meta: {
            id: data.id,
            slug: data.slug,
            status: data.status
          }
        })
      );

      setInvitationId(data.id);
      setPublicSlug(data.slug);
      setInvitationTitle(data.title);
    })();
  }, [initialInvitationId, initialPaymentState, supabase]);

  async function handleCheckout() {
    if (!termsChecked) {
      setError("약관에 동의해 주세요.");
      return;
    }

    if (!buyerName || !buyerPhone || !buyerEmail) {
      setError("이름, 연락처, 이메일을 모두 입력해 주세요.");
      return;
    }

    if (!invitationId) {
      setError("결제할 초대장을 찾지 못했습니다.");
      return;
    }

    if (!pricing.isFree) {
      setError("유료 옵션이 포함된 초대장은 웹이 아니라 모바일 앱에서 스토어 결제로 발행해 주세요.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/payments/free-publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ invitationId })
      });

      const result = (await response.json()) as { success?: boolean; message?: string; slug?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "무료 발행에 실패했습니다.");
      }

      setPublicSlug(result.slug ?? "");
      setMessage("무료 발행이 완료되었습니다.");
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "무료 발행에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ops-card">
      <h1 className="section-title" style={{ textAlign: "left" }}>
        {initialPaymentState === "success" ? "발행이 완료되었습니다" : "무료 발행"}
      </h1>
      {initialPaymentState === "success" ? (
        <>
          <p className="ops-note" style={{ marginTop: "8px" }}>
            초대장이 정상적으로 공개 링크로 발행되었습니다.
          </p>
          <div className="header-actions" style={{ marginTop: "20px" }}>
            <Link className="btn-primary" href={publicSlug ? `/invitations/${publicSlug}` : authDestination.dashboard}>
              공개 링크 확인
            </Link>
            <Link className="btn-outline" href={authDestination.dashboard}>
              대시보드로 이동
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="ops-note" style={{ marginTop: "8px" }}>
            무료 구성은 웹에서 바로 발행할 수 있고, 유료 옵션이 포함된 초대장은 모바일 앱에서 스토어 결제로 발행합니다.
          </p>
          <div className="form-grid" style={{ marginTop: "24px" }}>
            <div className="data-form">
              <label>
                발행 전 이름
                <input className="modal-input" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="예: 홍길동" />
              </label>
              <label>
                연락처
                <input className="modal-input" value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} placeholder="010-0000-0000" />
              </label>
              <label>
                이메일
                <input className="modal-input" value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} placeholder="name@example.com" />
              </label>
              <label style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "12px" }}>
                <input checked={termsChecked} onChange={(event) => setTermsChecked(event.target.checked)} type="checkbox" />
                발행 정책에 동의합니다.
              </label>
              <button
                className="btn-primary form-submit"
                disabled={pending || !invitationId || !pricing.isFree}
                onClick={handleCheckout}
                type="button"
              >
                {pending ? "발행 중..." : pricing.isFree ? "무료로 발행하기" : "앱에서 스토어 결제 필요"}
              </button>
              {!pricing.isFree ? (
                <p className="ops-note" style={{ marginTop: "12px" }}>
                  사진이 포함된 초대장은 웹 결제가 아니라 iOS Apple IAP / Android Play Billing으로 발행합니다.
                </p>
              ) : null}
            </div>
            <div className="ops-card">
              <h3>주문 요약</h3>
              <p className="ops-line">상품 <strong>{invitationTitle}</strong></p>
              <p className="ops-line">가격 <strong>₩{pricing.amount.toLocaleString("ko-KR")}</strong></p>
              <p className="ops-line">선택 수단 <strong>{pricing.isFree ? "무료 발행" : "앱 스토어 결제"}</strong></p>
              <p className="ops-line">처리 방식 <strong>{pricing.isFree ? "즉시 발행" : "모바일 앱에서 결제 후 발행"}</strong></p>
              <div style={{ marginTop: "12px", display: "grid", gap: "6px" }}>
                {pricing.breakdown.map((item) => (
                  <p className="ops-line" key={item.label}>
                    {item.label} <strong>₩{item.amount.toLocaleString("ko-KR")}</strong>
                  </p>
                ))}
              </div>
              <p className="ops-note">
                {pricing.isFree
                  ? "사진을 추가하지 않은 무료 구성입니다. 텍스트, 일정, 장소, 교통 안내를 무료로 발행할 수 있습니다."
                  : "유료 옵션이 포함된 초대장은 웹이 아니라 모바일 앱에서 스토어 결제로 발행합니다."}
              </p>
              {publicSlug ? (
                <p className="ops-note" style={{ marginTop: "16px" }}>
                  예정 공개 링크: `/invitations/{publicSlug}`
                </p>
              ) : null}
            </div>
          </div>
          {message ? <p className="form-message success">{message}</p> : null}
          {error ? <p className="form-message error">{error}</p> : null}
        </>
      )}
    </div>
  );
}
