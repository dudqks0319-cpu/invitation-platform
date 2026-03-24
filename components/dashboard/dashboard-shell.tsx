"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import { normalizeDraft, type InvitationStatus } from "@/lib/invitation-payload";
import { InvitationManagePanel } from "@/components/dashboard/invitation-manage-panel";

type InvitationRow = {
  id: string;
  slug: string | null;
  title: string;
  template_id: string;
  status: InvitationStatus;
  event_type: string;
  revision: number;
  payload: unknown;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function DashboardShell() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setInvitations(data as InvitationRow[]);
      }

      setLoading(false);
    })();
  }, [supabase]);

  async function handleDelete(id: string) {
    if (!supabase) return;
    if (!confirm("정말 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;

    const { error } = await supabase.from("invitations").delete().eq("id", id);

    if (!error) {
      setInvitations((prev) => prev.filter((invitation) => invitation.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  }

  if (!supabase) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>내 초대장</h1>
          <p className="builder-help">데모 모드입니다. 로그인하면 실제 데이터를 볼 수 있습니다.</p>
        </div>
        <div className="dashboard-empty">
          <p>Supabase 환경변수를 설정하고 로그인하면 초대장을 관리할 수 있습니다.</p>
          <button className="btn-primary" onClick={() => router.push("/builder")} type="button">
            초대장 만들기
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>내 초대장</h1>
        </div>
        <p style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>불러오는 중...</p>
      </div>
    );
  }

  const selected = selectedId
    ? invitations.find((invitation) => invitation.id === selectedId) ?? null
    : null;

  if (selectedId && selected) {
    return (
      <div className="dashboard-container">
        <button
          className="btn-outline"
          onClick={() => setSelectedId(null)}
          style={{ marginBottom: 16 }}
          type="button"
        >
          ← 목록으로 돌아가기
        </button>
        <InvitationManagePanel invitation={selected} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>내 초대장</h1>
        <button className="btn-primary" onClick={() => router.push("/builder")} type="button">
          새 초대장 만들기
        </button>
      </div>

      {invitations.length === 0 ? (
        <div className="dashboard-empty">
          <p>아직 만든 초대장이 없습니다.</p>
          <button className="btn-primary" onClick={() => router.push("/builder")} type="button">
            첫 초대장 만들기
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          {invitations.map((invitation) => {
            const payload = normalizeDraft(invitation.payload);
            const statusLabel = invitation.status === "published"
              ? "발행됨"
              : invitation.status === "archived"
                ? "보관됨"
                : "초안";
            const statusClass = invitation.status === "published"
              ? "status-published"
              : invitation.status === "archived"
                ? "status-archived"
                : "status-draft";

            return (
              <article className="dashboard-card" key={invitation.id}>
                <div className="dashboard-card-header">
                  <h3>{invitation.title}</h3>
                  <span className={`dashboard-status ${statusClass}`}>{statusLabel}</span>
                </div>
                <div className="dashboard-card-body">
                  <p>
                    {payload.groomName || "신랑"} ♡ {payload.brideName || "신부"}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#888" }}>
                    {invitation.updated_at
                      ? `마지막 수정: ${new Date(invitation.updated_at).toLocaleDateString("ko-KR")}`
                      : ""}
                  </p>
                  {invitation.status === "published" && invitation.slug ? (
                    <p style={{ fontSize: "0.85rem", color: "#4A90D9" }}>/i/{invitation.slug}</p>
                  ) : null}
                </div>
                <div className="dashboard-card-actions">
                  <button className="btn-outline" onClick={() => setSelectedId(invitation.id)} type="button">
                    관리
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => router.push(`/builder?invitationId=${invitation.id}`)}
                    type="button"
                  >
                    편집
                  </button>
                  {invitation.status === "published" && invitation.slug ? (
                    <button
                      className="btn-outline"
                      onClick={() => window.open(`/i/${invitation.slug}`, "_blank")}
                      type="button"
                    >
                      보기
                    </button>
                  ) : null}
                  <button
                    className="btn-outline"
                    onClick={() => handleDelete(invitation.id)}
                    style={{ color: "#e74c3c" }}
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
