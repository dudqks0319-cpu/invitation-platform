"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import { InvitationManagePanel } from "@/components/dashboard/invitation-manage-panel";

type InvitationRow = {
  id: string;
  slug: string | null;
  title: string;
  status: string;
  template_id: string;
  event_type: string;
  revision: number;
  payload: unknown;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: "발행됨", className: "badge-published" },
  draft: { label: "초안", className: "badge-draft" },
  archived: { label: "보관됨", className: "badge-archived" }
};

export function DashboardShell() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [selected, setSelected] = useState<InvitationRow | null>(null);
  const [message, setMessage] = useState("");

  const loadInvitations = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage("초대장 목록을 불러오지 못했습니다.");
    }

    setInvitations((data as InvitationRow[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInvitations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadInvitations]);

  async function handleDelete(id: string) {
    if (!supabase) return;
    if (!confirm("이 초대장을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;

    const { error } = await supabase.from("invitations").delete().eq("id", id);

    if (error) {
      setMessage("삭제에 실패했습니다.");
      return;
    }

    setInvitations((prev) => prev.filter((invitation) => invitation.id !== id));
    setMessage("초대장을 삭제했습니다.");
    if (selected?.id === id) {
      setSelected(null);
    }
  }

  if (selected) {
    return (
      <InvitationManagePanel
        invitation={selected}
        onBack={() => {
          setSelected(null);
          void loadInvitations();
        }}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>내 초대장</h1>
        <button
          className="btn-primary"
          onClick={() => router.push("/builder")}
          type="button"
        >
          새 초대장 만들기
        </button>
      </div>

      {!supabase ? (
        <>
          <p className="builder-help">데모 모드입니다. 로그인하면 실제 데이터를 볼 수 있습니다.</p>
          <p className="builder-help">Supabase 환경변수를 설정하고 로그인하면 초대장을 관리할 수 있습니다.</p>
        </>
      ) : null}

      {message ? (
        <p className="form-message success" style={{ margin: "12px 0" }}>
          {message}
        </p>
      ) : null}

      {loading ? (
        <div className="dashboard-loading">
          <p>불러오는 중...</p>
        </div>
      ) : invitations.length === 0 ? (
        <div className="dashboard-empty">
          <p>아직 만든 초대장이 없습니다.</p>
          <button
            className="btn-primary"
            onClick={() => router.push("/builder")}
            type="button"
          >
            첫 초대장 만들기
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          {invitations.map((invitation) => {
            const statusInfo = STATUS_LABELS[invitation.status] ?? STATUS_LABELS.draft;

            return (
              <div className="dashboard-card" key={invitation.id}>
                <div className="dashboard-card-header">
                  <h3>{invitation.title || "제목 없음"}</h3>
                  <span className={`dashboard-badge ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="dashboard-card-meta">
                  {invitation.event_type === "wedding" ? "결혼식" : invitation.event_type}
                  {invitation.slug ? ` · /i/${invitation.slug}` : ""}
                </p>
                <p className="dashboard-card-date">
                  수정: {new Date(invitation.updated_at).toLocaleDateString("ko-KR")}
                </p>
                <div className="dashboard-card-actions">
                  <button
                    className="btn-outline"
                    onClick={() => setSelected(invitation)}
                    type="button"
                  >
                    관리
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => router.push(`/builder?invitationId=${invitation.id}`)}
                    type="button"
                  >
                    수정
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
                    className="btn-sm-danger"
                    onClick={() => void handleDelete(invitation.id)}
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
