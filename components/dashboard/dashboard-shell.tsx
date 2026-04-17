"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { demoDashboardInvitations, demoRsvps } from "@/lib/demo-data";
import { canDeleteInvitation, getDeletePolicyNote } from "@/components/dashboard/dashboard-delete-policy";
import {
  LOCAL_DRAFT_KEY,
  normalizeDraft,
  type GuestbookEntry,
  type InvitationRecord,
  type RsvpEntry
} from "@/lib/invitation-payload";

type DashboardItem = InvitationRecord & {
  viewCount?: number;
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
        setMessage("대시보드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
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

      if (!rows.length) {
        setItems([]);
        setSelectedInvitationId("");
        setMessage("아직 저장된 초대장이 없습니다.");
        return;
      }

      const invitationIds = rows.map((row) => row.id);
      const [{ data: rsvpCountRows }, { data: guestbookCountRows }, { data: viewCountRows }] = await Promise.all([
        supabase.from("rsvps").select("invitation_id").in("invitation_id", invitationIds),
        supabase.from("guestbook_entries").select("invitation_id").in("invitation_id", invitationIds),
        supabase.from("view_logs").select("invitation_id").in("invitation_id", invitationIds)
      ]);

      const countByInvitation = (entries: Array<{ invitation_id: string }> | null | undefined) =>
        (entries ?? []).reduce<Record<string, number>>((acc, entry) => {
          acc[entry.invitation_id] = (acc[entry.invitation_id] ?? 0) + 1;
          return acc;
        }, {});

      const rsvpCountMap = countByInvitation(rsvpCountRows);
      const guestbookCountMap = countByInvitation(guestbookCountRows);
      const viewCountMap = countByInvitation(viewCountRows);

      const enrichedRows = rows.map((row) => ({
        ...row,
        viewCount: viewCountMap[row.id] ?? 0,
        rsvpCount: rsvpCountMap[row.id] ?? 0,
        guestbookCount: guestbookCountMap[row.id] ?? 0
      }));

      setItems(enrichedRows);
      setSelectedInvitationId((current) => current || enrichedRows[0]?.id || "");
      setMessage("저장된 초대장을 불러왔습니다.");
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
      setMessage("방명록 상태를 업데이트하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setGuestbookEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, approved } : entry))
    );
    setMessage(approved ? "방명록을 승인했습니다." : "방명록을 비공개 상태로 변경했습니다.");
  }

  async function copyPublicLink(item: DashboardItem) {
    if (typeof window === "undefined") {
      return;
    }

    const publicUrl = `${window.location.origin}/invitations/${item.slug}`;
    await navigator.clipboard.writeText(publicUrl);
    setMessage("공개 링크를 복사했습니다.");
  }

  async function deleteInvitation(item: DashboardItem) {
    const isLocalDraft = item.id === "local-draft";
    const isDeletable = isLocalDraft || canDeleteInvitation(item.status);

    if (!isDeletable) {
      setMessage(getDeletePolicyNote(item.status));
      return;
    }

    const confirmed = window.confirm(`"${item.title}" 초대장을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`);
    if (!confirmed) {
      return;
    }

    if (!supabase || isLocalDraft) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(LOCAL_DRAFT_KEY);
      }

      setItems((current) => {
        const nextItems = current.filter((entry) => entry.id !== item.id);
        setSelectedInvitationId(nextItems[0]?.id ?? "");
        return nextItems;
      });
      setMessage("로컬 초안을 삭제했습니다.");
      return;
    }

    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", item.id);

    if (error) {
      setMessage("초대장을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setItems((current) => {
      const nextItems = current.filter((entry) => entry.id !== item.id);
      setSelectedInvitationId(nextItems[0]?.id ?? "");
      return nextItems;
    });
    setMessage("초대장을 삭제했습니다.");
  }

  const selectedInvitation = items.find((item) => item.id === selectedInvitationId);
  const dashboardSummary = useMemo(
    () => ({
      totalInvitations: items.length,
      publishedInvitations: items.filter((item) => item.status === "published").length,
      totalViews: items.reduce((sum, item) => sum + (item.viewCount ?? 0), 0),
      totalRsvps: items.reduce((sum, item) => sum + (item.rsvpCount ?? 0), 0),
      totalGuestbook: items.reduce((sum, item) => sum + (item.guestbookCount ?? 0), 0)
    }),
    [items]
  );
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
          <article className="ops-card">
            <h3>전체 초대장</h3>
            <p className="ops-value">{dashboardSummary.totalInvitations}</p>
            <p className="ops-note">발행 {dashboardSummary.publishedInvitations}건</p>
          </article>
          <article className="ops-card">
            <h3>누적 조회수</h3>
            <p className="ops-value">{dashboardSummary.totalViews}</p>
            <p className="ops-note">공개 초대장 기준 집계</p>
          </article>
          <article className="ops-card">
            <h3>누적 RSVP</h3>
            <p className="ops-value">{dashboardSummary.totalRsvps}</p>
            <p className="ops-note">전체 응답 기준</p>
          </article>
          <article className="ops-card">
            <h3>누적 방명록</h3>
            <p className="ops-value">{dashboardSummary.totalGuestbook}</p>
            <p className="ops-note">승인 전 항목 포함</p>
          </article>
        </div>
        <div className="ops-grid">
          {items.map((item) => (
            <article className="ops-card" key={item.id}>
              {(() => {
                const isLocalDraft = item.id === "local-draft";
                const deleteNote = isLocalDraft ? "" : getDeletePolicyNote(item.status);
                return deleteNote ? <p className="ops-note">{deleteNote}</p> : null;
              })()}
              <h3>{item.title}</h3>
              <p className="ops-value">{getStatusLabel(item.status)}</p>
              <p className="ops-line">카테고리 <strong>{item.category}</strong></p>
              <p className="ops-line">템플릿 <strong>{item.templateId}</strong></p>
              <p className="ops-line">조회 <strong>{item.viewCount ?? 0}</strong> · RSVP <strong>{item.rsvpCount ?? 0}</strong> · 방명록 <strong>{item.guestbookCount ?? 0}</strong></p>
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
                    발행하기
                  </Link>
                )}
                <button className="btn-outline" onClick={() => setSelectedInvitationId(item.id)} type="button">
                  모더레이션
                </button>
                {(item.id === "local-draft" || canDeleteInvitation(item.status)) ? (
                  <button className="btn-outline" onClick={() => void deleteInvitation(item)} type="button">
                    삭제
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
