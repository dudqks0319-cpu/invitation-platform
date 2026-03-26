"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { demoDashboardInvitations, demoRsvps } from "@/lib/demo-data";
import {
  LOCAL_DRAFT_KEY,
  normalizeDraft,
  type GuestbookEntry,
  type InvitationRecord,
  type RsvpEntry
} from "@/lib/invitation-payload";

type DashboardItem = InvitationRecord & {
  rsvpCount?: number;
  guestbookCount?: number;
  repurchaseRequired?: boolean;
};

function getStatusLabel(status: DashboardItem["status"]) {
  switch (status) {
    case "published":
      return "발행됨";
    case "payment_pending":
      return "결제 대기";
    case "paid":
      return "결제 완료";
    case "refund_pending":
      return "환불 대기";
    case "refunded":
      return "환불 완료";
    case "payment_failed":
      return "결제 실패";
    default:
      return "초안";
  }
}

export function DashboardShell() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [message, setMessage] = useState("불러오는 중...");
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>("");
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [rsvpEntries, setRsvpEntries] = useState<RsvpEntry[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      if (!supabase) {
        const localDraft = typeof window !== "undefined" ? window.localStorage.getItem(LOCAL_DRAFT_KEY) : null;
        const parsedDraft = localDraft ? JSON.parse(localDraft) : null;

        const localItems =
          parsedDraft?.payload
            ? [
                {
                  id: parsedDraft.meta?.id ?? "local-draft",
                  slug: parsedDraft.meta?.slug ?? "preview",
                  title: parsedDraft.payload.title,
                  category: parsedDraft.payload.category,
                  templateId: parsedDraft.payload.templateId,
                  status: parsedDraft.meta?.status ?? "draft",
                  repurchaseRequired: false,
                  payload: normalizeDraft(parsedDraft.payload),
                  createdAt: new Date().toISOString(),
                  publishedAt: null
                },
                ...demoDashboardInvitations
              ]
            : demoDashboardInvitations;

        setItems(localItems);
        setSelectedInvitationId(localItems[0]?.id ?? "");
        setMessage("현재는 데모 모드입니다. 로그인 후 실제 초대장을 저장할 수 있습니다.");
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setItems([]);
        setSelectedInvitationId("");
        setMessage("로그인이 필요합니다.");
        return;
      }

      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      const rows = (data ?? []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        templateId: row.template_id,
        status: row.status,
        repurchaseRequired: row.repurchase_required,
        payload: normalizeDraft(row.payload),
        createdAt: row.created_at,
        publishedAt: row.published_at
      }));

      setItems(rows);
      setSelectedInvitationId((current) => current || rows[0]?.id || "");
      setMessage(rows.length ? "저장된 초대장을 불러왔습니다." : "아직 저장된 초대장이 없습니다.");
    }

    void loadDashboard();
  }, [supabase]);

  useEffect(() => {
    async function loadGuestbookEntries() {
      if (!selectedInvitationId) {
        setGuestbookEntries([]);
        setRsvpEntries([]);
        return;
      }

      if (!supabase) {
        setGuestbookEntries([]);
        setRsvpEntries(selectedInvitationId === "demo-invitation" ? demoRsvps : []);
        return;
      }

      const [{ data: guestbookData, error: guestbookError }, { data: rsvpData, error: rsvpError }] = await Promise.all([
        supabase
          .from("guestbook_entries")
          .select("*")
          .eq("invitation_id", selectedInvitationId)
          .order("created_at", { ascending: false }),
        supabase
          .from("rsvps")
          .select("*")
          .eq("invitation_id", selectedInvitationId)
          .order("created_at", { ascending: false })
      ]);

      if (guestbookError) {
        setGuestbookEntries([]);
      } else {
        setGuestbookEntries(
          (guestbookData ?? []).map((entry) => ({
            id: entry.id,
            nickname: entry.nickname,
            message: entry.message,
            approved: entry.approved,
            createdAt: entry.created_at
          }))
        );
      }

      if (rsvpError) {
        setRsvpEntries([]);
      } else {
        setRsvpEntries(
          (rsvpData ?? []).map((entry) => ({
            id: entry.id,
            guestName: entry.guest_name,
            guestPhone: entry.guest_phone ?? "",
            attending: entry.attending,
            guests: entry.guests,
            memo: entry.memo ?? "",
            createdAt: entry.created_at
          }))
        );
      }
    }

    void loadGuestbookEntries();
  }, [selectedInvitationId, supabase]);

  async function updateModeration(entryId: string, approved: boolean) {
    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from("guestbook_entries")
      .update({ approved })
      .eq("id", entryId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setGuestbookEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, approved } : entry))
    );
    setMessage(approved ? "방명록을 승인했습니다." : "방명록을 비공개 상태로 변경했습니다.");
  }

  async function requestRefund(item: DashboardItem) {
    if (!supabase) {
      return;
    }

    const reason = window.prompt("환불 사유를 입력해 주세요.", "고객 요청");
    if (!reason) {
      return;
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("id")
      .eq("invitation_id", item.id)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError || !payment) {
      setMessage(paymentError?.message || "환불 가능한 결제를 찾지 못했습니다.");
      return;
    }

    const response = await fetch("/api/payments/kakaopay/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paymentId: payment.id,
        reason
      })
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(result.message || "환불 처리에 실패했습니다.");
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              status: "refunded",
              publishedAt: null
            }
          : entry
      )
    );
    setMessage("환불이 처리되었습니다.");
  }

  async function copyPublicLink(item: DashboardItem) {
    if (typeof window === "undefined") {
      return;
    }

    const publicUrl = `${window.location.origin}/invitations/${item.slug}`;
    await navigator.clipboard.writeText(publicUrl);
    setMessage("공개 링크를 복사했습니다.");
  }

  const selectedInvitation = items.find((item) => item.id === selectedInvitationId);
  const rsvpSummary = useMemo(() => {
    const attending = rsvpEntries.filter((entry) => entry.attending);
    const declined = rsvpEntries.length - attending.length;

    return {
      totalResponses: rsvpEntries.length,
      attending: attending.length,
      declined,
      totalGuests: attending.reduce((sum, entry) => sum + entry.guests, 0)
    };
  }, [rsvpEntries]);

  return (
    <section className="builder-section builder-section-page">
      <div className="section-inner">
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h1 className="section-title">초대장 대시보드</h1>
          <p className="section-sub">{message}</p>
        </div>
        <div className="ops-grid" style={{ marginBottom: "24px" }}>
          <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
            <h3>보관 및 운영 안내</h3>
            <p className="ops-note">발행한 초대장은 대시보드에서 계속 수정할 수 있고, 영상·배경음악·감사 메시지도 이후에 추가할 수 있습니다.</p>
            <p className="ops-note">환불이 완료되면 공개 링크는 비활성화되므로, 다시 공개하려면 재발행이 필요합니다.</p>
          </article>
        </div>
        <div className="ops-grid">
          {items.map((item) => (
            <article className="ops-card" key={item.id}>
              <h3>{item.title}</h3>
              <p className="ops-value">{getStatusLabel(item.status)}</p>
              <p className="ops-line">카테고리 <strong>{item.category}</strong></p>
              <p className="ops-line">템플릿 <strong>{item.templateId}</strong></p>
              {item.repurchaseRequired ? (
                <p className="ops-note">이미지 또는 템플릿 변경으로 재결제가 필요합니다.</p>
              ) : null}
              <p className="ops-note">
                생성일 {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                <br />
                공개 링크 {item.slug}
                <br />
                {item.publishedAt ? `발행일 ${new Date(item.publishedAt).toLocaleDateString("ko-KR")}` : "아직 발행 전입니다."}
              </p>
              <div className="header-actions" style={{ marginTop: "16px" }}>
                <Link className="btn-outline" href={`/builder?invitationId=${item.id}`}>
                  편집하기
                </Link>
                {item.status === "published" ? (
                  <>
                    <Link className="btn-primary" href={`/invitations/${item.slug}`}>
                      보기
                    </Link>
                    <button className="btn-outline" onClick={() => copyPublicLink(item)} type="button">
                      링크 복사
                    </button>
                  </>
                ) : (
                  <Link className="btn-primary" href={`/checkout?invitationId=${item.id}`}>
                    결제/발행
                  </Link>
                )}
                <button className="btn-outline" onClick={() => setSelectedInvitationId(item.id)} type="button">
                  모더레이션
                </button>
                {item.status === "published" || item.status === "paid" ? (
                  <button className="btn-outline" onClick={() => requestRefund(item)} type="button">
                    전액 환불
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div className="ops-grid" style={{ marginTop: "24px" }}>
          <article className="ops-card">
            <h3>RSVP 운영</h3>
            <p className="ops-note">
              {selectedInvitation
                ? `${selectedInvitation.title}의 RSVP 현황입니다.`
                : "확인할 초대장을 선택해 주세요."}
            </p>
            <p className="ops-line">전체 응답 <strong>{rsvpSummary.totalResponses}</strong></p>
            <p className="ops-line">참석 <strong>{rsvpSummary.attending}</strong></p>
            <p className="ops-line">불참 <strong>{rsvpSummary.declined}</strong></p>
            <p className="ops-line">예상 총 인원 <strong>{rsvpSummary.totalGuests}</strong></p>
            <ul className="list-box">
              {rsvpEntries.length ? (
                rsvpEntries.slice(0, 10).map((entry) => (
                  <li key={entry.id}>
                    <div className="meta">
                      {new Date(entry.createdAt).toLocaleString("ko-KR")} · {entry.guestName}
                      {entry.guestPhone ? ` · ${entry.guestPhone}` : ""}
                    </div>
                    <div className="value">
                      {entry.attending ? "참석" : "불참"} / 동행 {entry.guests}명
                    </div>
                    {entry.memo ? <div className="value">메모: {entry.memo}</div> : null}
                  </li>
                ))
              ) : (
                <li className="meta">아직 RSVP 응답이 없습니다.</li>
              )}
            </ul>
          </article>
          <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
            <h3>방명록 모더레이션</h3>
            <p className="ops-note">
              {selectedInvitation
                ? `${selectedInvitation.title}의 방명록을 검토 중입니다.`
                : "모더레이션할 초대장을 선택해 주세요."}
            </p>
            <ul className="list-box">
              {guestbookEntries.length ? (
                guestbookEntries.map((entry) => (
                  <li key={entry.id}>
                    <div className="meta">
                      {new Date(entry.createdAt).toLocaleString("ko-KR")} · {entry.nickname}
                    </div>
                    <div className="value">{entry.message}</div>
                    <div className="header-actions" style={{ marginTop: "12px" }}>
                      <button className="btn-primary" onClick={() => updateModeration(entry.id, true)} type="button">
                        승인
                      </button>
                      <button className="btn-outline" onClick={() => updateModeration(entry.id, false)} type="button">
                        숨기기
                      </button>
                      <span className="auth-status">{entry.approved ? "공개중" : "승인 대기"}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="meta">대기 중인 방명록이 없습니다.</li>
              )}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
