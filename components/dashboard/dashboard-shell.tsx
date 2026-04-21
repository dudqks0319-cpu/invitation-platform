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

type DashboardTab = "all" | "draft" | "published" | "saved";

function getStatusLabel(status: DashboardItem["status"]) {
  switch (status) {
    case "published": return "발행됨";
    case "payment_pending": return "결제 대기";
    case "paid": return "결제 완료";
    case "refund_pending": return "환불 대기";
    case "refunded": return "환불 완료";
    case "payment_failed": return "결제 실패";
    default: return "초안";
  }
}

function getCategoryEmoji(category: string) {
  const map: Record<string, string> = {
    wedding: "💍",
    birthday: "🎂",
    dol: "🍼",
    anniversary: "💕",
    hwangap: "🎊",
    other: "🎉"
  };
  return map[category] ?? "💌";
}

export function DashboardShell() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [message, setMessage] = useState("불러오는 중...");
  const [activeTab, setActiveTab] = useState<DashboardTab>("all");
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>("");
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [rsvpEntries, setRsvpEntries] = useState<RsvpEntry[]>([]);
  const [showModeration, setShowModeration] = useState(false);

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
        setMessage("데모 모드입니다. 로그인 후 실제 초대장을 저장할 수 있습니다.");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

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

      setGuestbookEntries(
        guestbookError ? [] : (guestbookData ?? []).map((entry) => ({
          id: entry.id,
          nickname: entry.nickname,
          message: entry.message,
          approved: entry.approved,
          createdAt: entry.created_at
        }))
      );

      setRsvpEntries(
        rsvpError ? [] : (rsvpData ?? []).map((entry) => ({
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

    void loadGuestbookEntries();
  }, [selectedInvitationId, supabase]);

  async function updateModeration(entryId: string, approved: boolean) {
    if (!supabase) return;
    const { error } = await supabase
      .from("guestbook_entries")
      .update({ approved })
      .eq("id", entryId);
    if (error) {
      setMessage("방명록 상태를 업데이트하지 못했습니다.");
      return;
    }
    setGuestbookEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, approved } : entry))
    );
  }

  async function copyPublicLink(item: DashboardItem) {
    if (typeof window === "undefined") return;
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

    const confirmed = window.confirm(`"${item.title}" 초대장을 삭제할까요?`);
    if (!confirmed) return;

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
      setMessage("초대장을 삭제하지 못했습니다.");
      return;
    }

    setItems((current) => {
      const nextItems = current.filter((entry) => entry.id !== item.id);
      setSelectedInvitationId(nextItems[0]?.id ?? "");
      return nextItems;
    });
    setMessage("초대장을 삭제했습니다.");
  }

  const dashboardSummary = useMemo(() => ({
    totalInvitations: items.length,
    publishedInvitations: items.filter((item) => item.status === "published").length,
    totalViews: items.reduce((sum, item) => sum + (item.viewCount ?? 0), 0),
    totalRsvps: items.reduce((sum, item) => sum + (item.rsvpCount ?? 0), 0)
  }), [items]);

  const rsvpSummary = useMemo(() => {
    const attending = rsvpEntries.filter((entry) => entry.attending);
    return {
      totalResponses: rsvpEntries.length,
      attending: attending.length,
      declined: rsvpEntries.length - attending.length,
      totalGuests: attending.reduce((sum, entry) => sum + entry.guests, 0)
    };
  }, [rsvpEntries]);

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case "draft": return items.filter((item) => item.status === "draft");
      case "published": return items.filter((item) => item.status === "published");
      case "saved": return items.filter((item) => item.status !== "draft" && item.status !== "published");
      default: return items;
    }
  }, [items, activeTab]);

  const selectedInvitation = items.find((item) => item.id === selectedInvitationId);

  return (
    <section style={{ background: "var(--bg-light)", minHeight: "100vh", padding: "32px 0 80px" }}>
      <div className="section-inner">

        {/* Header */}
        <div className="dash-header">
          <h1 className="dash-title">내 초대장</h1>
          <Link className="dash-new-btn" href="/builder">
            + 초대장 만들기
          </Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-value">{dashboardSummary.totalInvitations}</div>
            <div className="dash-stat-label">전체 초대장</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-value">{dashboardSummary.publishedInvitations}</div>
            <div className="dash-stat-label">발행됨</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-value">{dashboardSummary.totalViews}</div>
            <div className="dash-stat-label">누적 조회</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-value">{dashboardSummary.totalRsvps}</div>
            <div className="dash-stat-label">RSVP</div>
          </div>
        </div>

        {/* Status message */}
        {message ? (
          <p style={{ fontSize: "0.82rem", color: "var(--text-mid)", marginBottom: "16px" }}>
            {message}
          </p>
        ) : null}

        {/* Tab nav */}
        <div className="dash-tabs">
          {(["all", "draft", "published", "saved"] as const).map((tab) => {
            const labels: Record<typeof tab, string> = {
              all: "전체",
              draft: "작성중",
              published: "발송완료",
              saved: "임시저장"
            };
            return (
              <button
                className={`dash-tab ${activeTab === tab ? "active" : ""}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Invitation list */}
        {filteredItems.length ? (
          <div className="inv-list">
            {filteredItems.map((item) => {
              const isSelected = item.id === selectedInvitationId;
              const isLocalDraft = item.id === "local-draft";

              return (
                <div
                  className="inv-card"
                  key={item.id}
                  style={{ outline: isSelected ? "2px solid var(--text-dark)" : undefined }}
                >
                  <div className="inv-thumb">
                    <span>{getCategoryEmoji(item.category)}</span>
                  </div>
                  <div className="inv-info">
                    <div className="inv-title">{item.title}</div>
                    <div className="inv-meta">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </div>
                    <div className="inv-meta" style={{ marginTop: "2px" }}>
                      조회 {item.viewCount ?? 0} · RSVP {item.rsvpCount ?? 0}
                    </div>
                    <span
                      className={`inv-dday ${item.status === "published" ? "upcoming" : "past"}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="inv-actions">
                    <Link className="inv-action-btn" href={`/builder?invitationId=${item.id}`}>
                      편집
                    </Link>
                    {item.status === "published" ? (
                      <button
                        className="inv-action-btn"
                        onClick={() => copyPublicLink(item)}
                        type="button"
                      >
                        링크 복사
                      </button>
                    ) : (
                      <Link className="inv-action-btn primary" href={`/checkout?invitationId=${item.id}`}>
                        발행하기
                      </Link>
                    )}
                    <button
                      className="inv-action-btn"
                      onClick={() => {
                        setSelectedInvitationId(item.id);
                        setShowModeration(true);
                      }}
                      type="button"
                    >
                      방명록
                    </button>
                    {(isLocalDraft || canDeleteInvitation(item.status)) && (
                      <button
                        className="inv-action-btn"
                        onClick={() => void deleteInvitation(item)}
                        style={{ color: "var(--rose-dark)" }}
                        type="button"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-mid)"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>💌</div>
            <p style={{ fontSize: "0.95rem", marginBottom: "20px" }}>아직 초대장이 없습니다</p>
            <Link className="dash-new-btn" href="/builder">
              첫 초대장 만들기
            </Link>
          </div>
        )}

        {/* Moderation panel */}
        {showModeration && selectedInvitation && (
          <div
            style={{
              marginTop: "32px",
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              padding: "22px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                방명록 — {selectedInvitation.title}
              </h3>
              <button
                onClick={() => setShowModeration(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mid)", fontSize: "1.2rem" }}
                type="button"
              >
                ×
              </button>
            </div>

            {/* RSVP summary */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { label: "전체 응답", value: rsvpSummary.totalResponses },
                { label: "참석", value: rsvpSummary.attending },
                { label: "불참", value: rsvpSummary.declined },
                { label: "예상 인원", value: rsvpSummary.totalGuests }
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "var(--bg-cream)",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: "80px"
                  }}
                >
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-dark)" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-mid)", marginTop: "2px" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Guestbook entries */}
            <ul className="list-box">
              {guestbookEntries.length ? (
                guestbookEntries.map((entry) => (
                  <li key={entry.id}>
                    <div className="meta">
                      {new Date(entry.createdAt).toLocaleString("ko-KR")} · {entry.nickname}
                    </div>
                    <div className="value">{entry.message}</div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                      <button
                        className="inv-action-btn primary"
                        onClick={() => updateModeration(entry.id, true)}
                        type="button"
                      >
                        승인
                      </button>
                      <button
                        className="inv-action-btn"
                        onClick={() => updateModeration(entry.id, false)}
                        type="button"
                      >
                        숨기기
                      </button>
                      <span className={`auth-status ${entry.approved ? "published" : ""}`}>
                        {entry.approved ? "공개중" : "승인 대기"}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="meta" style={{ padding: "16px 0" }}>대기 중인 방명록이 없습니다.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
