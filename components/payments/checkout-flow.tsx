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
  const [invitationTitle, setInvitationTitle] = useState("초대장 발행");
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
        setError("발행이 취소되었습니다. 다시 시도해 주세요.");
      }

      if (initialPaymentState === "failed") {
        setError("발행 승인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
          setMessage("초대장이 발행되었습니다.");
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

      const query = parsed.meta?.id
        ? supabase.from("invitations").update(invitationInput).eq("id", parsed.meta.id).select().single()
        : supabase.from("invitations").insert(invitationInput).select().single();

      const { data, error } = await query;

      if (error || !data) {
        setError("초대장 초안을 발행 대상으로 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
      setError("발행할 초대장을 찾지 못했습니다.");
      return;
    }

    if (!pricing.isFree) {
      setError("현재 무료 발행 대상이 아닌 항목이 포함되어 있습니다.");
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
            현재 제공되는 템플릿, 사진 업로드, RSVP, 방명록은 무료로 발행할 수 있습니다.
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
                {pending ? "발행 중..." : pricing.isFree ? "무료로 발행하기" : "무료 발행 대상 아님"}
              </button>
              {!pricing.isFree ? (
                <p className="ops-note" style={{ marginTop: "12px" }}>
                  현재 무료 발행 범위에 포함되지 않은 항목을 제거한 뒤 다시 시도해 주세요.
                </p>
              ) : null}
            </div>
            <div className="ops-card">
              <h3>주문 요약</h3>
              <p className="ops-line">초대장 <strong>{invitationTitle}</strong></p>
              <p className="ops-line">이용 금액 <strong>₩{pricing.amount.toLocaleString("ko-KR")}</strong></p>
              <p className="ops-line">선택 수단 <strong>{pricing.isFree ? "무료 발행" : "무료 발행 대상 아님"}</strong></p>
              <p className="ops-line">처리 방식 <strong>{pricing.isFree ? "즉시 발행" : "구성 확인 필요"}</strong></p>
              <div style={{ marginTop: "12px", display: "grid", gap: "6px" }}>
                {pricing.breakdown.map((item) => (
                  <p className="ops-line" key={item.label}>
                    {item.label} <strong>₩{item.amount.toLocaleString("ko-KR")}</strong>
                  </p>
                ))}
              </div>
              <p className="ops-note">
                {pricing.isFree
                  ? "텍스트, 일정, 장소, 이미지, 교통 안내까지 무료로 반영됩니다."
                  : "현재 무료 발행 범위에 포함되지 않은 항목이 있습니다."}
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
