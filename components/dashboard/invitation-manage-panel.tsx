"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";

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

type RsvpRow = {
  id: string;
  name: string;
  phone: string | null;
  attending: boolean;
  guest_count: number;
  memo: string | null;
  created_at: string;
};

type GuestbookRow = {
  id: string;
  nickname: string;
  message: string;
  is_approved: boolean;
  ip_hash: string | null;
  anonymous_id: string | null;
  created_at: string;
};

type VisitStats = {
  total: number;
  today: number;
};

type BlockedRow = {
  id: string;
  ip_hash: string | null;
  anonymous_id: string | null;
  reason: string | null;
  created_at: string;
};

type Tab = "rsvp" | "guestbook" | "stats" | "blocked";

export function InvitationManagePanel({
  invitation,
  onBack
}: {
  invitation: InvitationRow;
  onBack: () => void;
}) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [tab, setTab] = useState<Tab>("rsvp");
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [guestbook, setGuestbook] = useState<GuestbookRow[]>([]);
  const [gbLoading, setGbLoading] = useState(false);
  const [visitStats, setVisitStats] = useState<VisitStats>({ total: 0, today: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [blocked, setBlocked] = useState<BlockedRow[]>([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadRsvps = useCallback(async () => {
    if (!supabase) return;
    setRsvpLoading(true);
    const { data } = await supabase
      .from("rsvps")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("created_at", { ascending: false });
    setRsvps((data as RsvpRow[]) ?? []);
    setRsvpLoading(false);
  }, [invitation.id, supabase]);

  const loadGuestbook = useCallback(async () => {
    if (!supabase) return;
    setGbLoading(true);
    const { data } = await supabase
      .from("guestbook_entries")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("created_at", { ascending: false });
    setGuestbook((data as GuestbookRow[]) ?? []);
    setGbLoading(false);
  }, [invitation.id, supabase]);

  const loadStats = useCallback(async () => {
    if (!supabase) return;
    setStatsLoading(true);

    const { count: total } = await supabase
      .from("visits")
      .select("*", { count: "exact", head: true })
      .eq("invitation_id", invitation.id);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: today } = await supabase
      .from("visits")
      .select("*", { count: "exact", head: true })
      .eq("invitation_id", invitation.id)
      .gte("created_at", todayStart.toISOString());

    setVisitStats({ total: total ?? 0, today: today ?? 0 });
    setStatsLoading(false);
  }, [invitation.id, supabase]);

  const loadBlocked = useCallback(async () => {
    if (!supabase) return;
    setBlockedLoading(true);
    const { data } = await supabase
      .from("blocked_users")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("created_at", { ascending: false });
    setBlocked((data as BlockedRow[]) ?? []);
    setBlockedLoading(false);
  }, [invitation.id, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (tab === "rsvp") {
        void loadRsvps();
      }
      if (tab === "guestbook") {
        void loadGuestbook();
      }
      if (tab === "stats") {
        void loadStats();
      }
      if (tab === "blocked") {
        void loadBlocked();
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBlocked, loadGuestbook, loadRsvps, loadStats, tab]);

  async function deleteRsvp(id: string) {
    if (!supabase) return;
    if (!confirm("이 RSVP를 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("rsvps").delete().eq("id", id);
    if (!error) {
      setRsvps((prev) => prev.filter((row) => row.id !== id));
      setMessage("RSVP를 삭제했습니다.");
    }
  }

  function downloadRsvpExcel() {
    const bom = "\uFEFF";
    const header = "이름,연락처,참석여부,동행인원,메모,응답일시";
    const rows = rsvps.map((rsvp) =>
      [
        `"${rsvp.name}"`,
        `"${rsvp.phone || ""}"`,
        rsvp.attending ? "참석" : "불참",
        rsvp.guest_count,
        `"${(rsvp.memo || "").replace(/"/g, "\"\"")}"`,
        new Date(rsvp.created_at).toLocaleString("ko-KR")
      ].join(",")
    );

    const csv = bom + header + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rsvp-${invitation.slug || invitation.id}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("CSV 파일을 다운로드했습니다. 엑셀에서 열 수 있습니다.");
  }

  async function approveGuestbook(id: string, approve: boolean) {
    if (!supabase) return;
    const { error } = await supabase
      .from("guestbook_entries")
      .update({ is_approved: approve })
      .eq("id", id);
    if (!error) {
      setGuestbook((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, is_approved: approve } : entry))
      );
      setMessage(approve ? "방명록을 승인했습니다." : "방명록을 비공개로 변경했습니다.");
    }
  }

  async function deleteGuestbook(id: string) {
    if (!supabase) return;
    if (!confirm("이 방명록을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("guestbook_entries").delete().eq("id", id);
    if (!error) {
      setGuestbook((prev) => prev.filter((entry) => entry.id !== id));
      setMessage("방명록을 삭제했습니다.");
    }
  }

  async function blockFromGuestbook(entry: GuestbookRow) {
    if (!supabase) return;
    const reason = prompt("차단 사유를 입력해 주세요 (선택):");

    const { error } = await supabase.from("blocked_users").insert({
      invitation_id: invitation.id,
      ip_hash: entry.ip_hash,
      anonymous_id: entry.anonymous_id,
      reason: reason || `방명록 차단: ${entry.nickname}`
    });

    if (!error) {
      setMessage(`${entry.nickname}님을 차단했습니다. 이후 글이 자동 차단됩니다.`);
      void loadBlocked();
    }
  }

  async function unblock(id: string) {
    if (!supabase) return;
    if (!confirm("차단을 해제하시겠습니까?")) return;
    const { error } = await supabase.from("blocked_users").delete().eq("id", id);
    if (!error) {
      setBlocked((prev) => prev.filter((entry) => entry.id !== id));
      setMessage("차단을 해제했습니다.");
    }
  }

  const rsvpStats = useMemo(() => {
    const attending = rsvps.filter((row) => row.attending);
    const notAttending = rsvps.filter((row) => !row.attending);
    const totalGuests = attending.reduce((sum, row) => sum + row.guest_count, 0);

    return {
      total: rsvps.length,
      attending: attending.length,
      notAttending: notAttending.length,
      totalGuests
    };
  }, [rsvps]);

  return (
    <div className="manage-panel">
      <div className="manage-header">
        <div className="dashboard-card-actions" style={{ marginBottom: 12 }}>
          <button className="btn-outline" onClick={onBack} type="button">
            ← 목록으로
          </button>
        </div>
        <h2>{invitation.title}</h2>
        <p style={{ color: "#888", fontSize: "0.9rem" }}>
          {invitation.status === "published" && invitation.slug
            ? `공개 주소: /i/${invitation.slug}`
            : `상태: ${invitation.status}`}
        </p>
      </div>

      <div className="manage-tabs">
        {([
          { key: "rsvp", label: "RSVP" },
          { key: "guestbook", label: "방명록" },
          { key: "stats", label: "통계" },
          { key: "blocked", label: "차단 관리" }
        ] as { key: Tab; label: string }[]).map((nextTab) => (
          <button
            key={nextTab.key}
            className={`manage-tab ${tab === nextTab.key ? "active" : ""}`}
            onClick={() => {
              setTab(nextTab.key);
              setMessage("");
            }}
            type="button"
          >
            {nextTab.label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="form-message success" style={{ margin: "12px 0" }}>
          {message}
        </p>
      ) : null}

      {tab === "rsvp" ? (
        <div className="manage-content">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">{rsvpStats.total}</div>
              <div className="stat-label">총 응답</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: "#27ae60" }}>{rsvpStats.attending}</div>
              <div className="stat-label">참석</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: "#e74c3c" }}>{rsvpStats.notAttending}</div>
              <div className="stat-label">불참</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: "#3498db" }}>{rsvpStats.totalGuests}</div>
              <div className="stat-label">총 인원</div>
            </div>
          </div>

          <div style={{ margin: "16px 0" }}>
            <button className="btn-outline" disabled={rsvps.length === 0} onClick={downloadRsvpExcel} type="button">
              CSV 다운로드 (엑셀)
            </button>
            <button className="btn-outline" onClick={() => void loadRsvps()} style={{ marginLeft: 8 }} type="button">
              새로고침
            </button>
          </div>

          {rsvpLoading ? (
            <p style={{ color: "#888" }}>불러오는 중...</p>
          ) : rsvps.length === 0 ? (
            <p style={{ color: "#888" }}>아직 RSVP 응답이 없습니다.</p>
          ) : (
            <div className="manage-table-wrap">
              <table className="manage-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>연락처</th>
                    <th>참석</th>
                    <th>인원</th>
                    <th>메모</th>
                    <th>일시</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id}>
                      <td>{rsvp.name}</td>
                      <td>{rsvp.phone || "-"}</td>
                      <td>
                        <span className={rsvp.attending ? "badge-yes" : "badge-no"}>
                          {rsvp.attending ? "참석" : "불참"}
                        </span>
                      </td>
                      <td>{rsvp.guest_count}</td>
                      <td className="memo-cell">{rsvp.memo || "-"}</td>
                      <td className="date-cell">{new Date(rsvp.created_at).toLocaleDateString("ko-KR")}</td>
                      <td>
                        <button className="btn-sm-danger" onClick={() => void deleteRsvp(rsvp.id)} type="button">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {tab === "guestbook" ? (
        <div className="manage-content">
          <div style={{ margin: "0 0 16px" }}>
            <button className="btn-outline" onClick={() => void loadGuestbook()} type="button">
              새로고침
            </button>
          </div>

          {gbLoading ? (
            <p style={{ color: "#888" }}>불러오는 중...</p>
          ) : guestbook.length === 0 ? (
            <p style={{ color: "#888" }}>아직 방명록이 없습니다.</p>
          ) : (
            <div className="guestbook-manage-list">
              {guestbook.map((entry) => (
                <div
                  key={entry.id}
                  className={`guestbook-manage-item ${entry.is_approved ? "" : "pending"}`}
                >
                  <div className="gb-header">
                    <span className="gb-nickname">{entry.nickname}</span>
                    <span className={`gb-status ${entry.is_approved ? "approved" : "waiting"}`}>
                      {entry.is_approved ? "승인됨" : "대기중"}
                    </span>
                    <span className="gb-date">
                      {new Date(entry.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="gb-message">{entry.message}</p>
                  <div className="gb-actions">
                    {!entry.is_approved ? (
                      <button
                        className="btn-sm-primary"
                        onClick={() => void approveGuestbook(entry.id, true)}
                        type="button"
                      >
                        승인
                      </button>
                    ) : (
                      <button
                        className="btn-sm-outline"
                        onClick={() => void approveGuestbook(entry.id, false)}
                        type="button"
                      >
                        비공개
                      </button>
                    )}
                    <button className="btn-sm-outline" onClick={() => void blockFromGuestbook(entry)} type="button">
                      차단
                    </button>
                    <button className="btn-sm-danger" onClick={() => void deleteGuestbook(entry.id)} type="button">
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === "stats" ? (
        <div className="manage-content">
          {statsLoading ? (
            <p style={{ color: "#888" }}>불러오는 중...</p>
          ) : (
            <>
              <div className="stats-row">
                <div className="stat-card stat-card-large">
                  <div className="stat-number">{visitStats.total}</div>
                  <div className="stat-label">총 방문</div>
                </div>
                <div className="stat-card stat-card-large">
                  <div className="stat-number">{visitStats.today}</div>
                  <div className="stat-label">오늘 방문</div>
                </div>
                <div className="stat-card stat-card-large">
                  <div className="stat-number">{rsvpStats.total}</div>
                  <div className="stat-label">RSVP 응답</div>
                </div>
                <div className="stat-card stat-card-large">
                  <div className="stat-number">{rsvpStats.totalGuests}</div>
                  <div className="stat-label">예상 참석 인원</div>
                </div>
              </div>

              <div className="stats-detail" style={{ marginTop: 24 }}>
                <h3>RSVP 상세</h3>
                <div className="stats-bar-wrap">
                  <div className="stats-bar">
                    <div
                      className="stats-bar-fill attending"
                      style={{
                        width: rsvpStats.total > 0
                          ? `${(rsvpStats.attending / rsvpStats.total) * 100}%`
                          : "0%"
                      }}
                    />
                    <div
                      className="stats-bar-fill not-attending"
                      style={{
                        width: rsvpStats.total > 0
                          ? `${(rsvpStats.notAttending / rsvpStats.total) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                  <div className="stats-bar-legend">
                    <span className="legend-attending">참석 {rsvpStats.attending}명</span>
                    <span className="legend-not-attending">불참 {rsvpStats.notAttending}명</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <button className="btn-outline" onClick={() => void loadStats()} type="button">
                  새로고침
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {tab === "blocked" ? (
        <div className="manage-content">
          <p className="builder-help" style={{ marginBottom: 16 }}>
            차단된 사용자의 방명록은 자동으로 거부됩니다. 본인에게는 저장된 것처럼 보이지만 실제로는 저장되지 않습니다.
          </p>

          <button className="btn-outline" onClick={() => void loadBlocked()} style={{ marginBottom: 16 }} type="button">
            새로고침
          </button>

          {blockedLoading ? (
            <p style={{ color: "#888" }}>불러오는 중...</p>
          ) : blocked.length === 0 ? (
            <p style={{ color: "#888" }}>차단된 사용자가 없습니다.</p>
          ) : (
            <div className="manage-table-wrap">
              <table className="manage-table">
                <thead>
                  <tr>
                    <th>IP (해시)</th>
                    <th>익명 ID</th>
                    <th>사유</th>
                    <th>차단일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {blocked.map((entry) => (
                    <tr key={entry.id}>
                      <td className="mono">{entry.ip_hash || "-"}</td>
                      <td className="mono">{entry.anonymous_id?.slice(0, 8) || "-"}</td>
                      <td>{entry.reason || "-"}</td>
                      <td className="date-cell">
                        {new Date(entry.created_at).toLocaleDateString("ko-KR")}
                      </td>
                      <td>
                        <button className="btn-sm-outline" onClick={() => void unblock(entry.id)} type="button">
                          해제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
