"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { demoDashboardInvitations, demoRsvps } from "@/lib/demo-data";
import { canDeleteInvitation, getDeletePolicyNote } from "@/components/dashboard/dashboard-delete-policy";
import {
  createInvitationSlug,
  LOCAL_DRAFT_KEY,
  normalizeDraft,
  toInvitationInsert,
  type GuestbookEntry,
  type InvitationRecord,
  type RsvpEntry
} from "@/lib/invitation-payload";
import {
  buildInvitationVariantInsertPayload,
  buildInvitationVariantSlug,
  invitationVariantPresets,
  type InvitationVariantPreset
} from "@/lib/invitation-variant-management";
import {
  buildPublicCalendarPath,
  buildPublicQrImagePath,
  buildPublicShareImagePath
} from "@/lib/public-share-assets";

type DashboardItem = InvitationRecord & {
  viewCount?: number;
  rsvpCount?: number;
  guestbookCount?: number;
  reportCount?: number;
  repurchaseRequired?: boolean;
};

type DashboardVariant = {
  id: string;
  invitationId: string;
  audienceKey: string;
  audienceLabel: string;
  slug: string;
  status: "active" | "hidden" | "archived";
  viewCount: number;
  rsvpCount: number;
  guestbookCount: number;
  createdAt: string;
};

type ReportStatus = "pending" | "reviewing" | "resolved" | "rejected";

type DashboardContentReport = {
  id: string;
  invitationId: string | null;
  targetType: "invitation" | "guestbook" | "image";
  targetId: string;
  reason: "inappropriate" | "privacy" | "spam" | "copyright" | "other";
  detail: string;
  reporterContact: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
};

const demoDashboardVariants: DashboardVariant[] = [
  {
    id: "demo-variant-friends",
    invitationId: "demo-invitation",
    audienceKey: "friends",
    audienceLabel: "친구용",
    slug: buildInvitationVariantSlug("kim-lee-demo", "friends"),
    status: "active",
    viewCount: 8,
    rsvpCount: 2,
    guestbookCount: 1,
    createdAt: new Date("2026-03-03T09:00:00.000Z").toISOString()
  },
  {
    id: "demo-variant-coworkers",
    invitationId: "demo-invitation",
    audienceKey: "coworkers",
    audienceLabel: "직장용",
    slug: buildInvitationVariantSlug("kim-lee-demo", "coworkers"),
    status: "active",
    viewCount: 5,
    rsvpCount: 1,
    guestbookCount: 0,
    createdAt: new Date("2026-03-03T10:00:00.000Z").toISOString()
  }
];
const demoContentReports: DashboardContentReport[] = [
  {
    id: "demo-report-privacy",
    invitationId: "demo-invitation",
    targetType: "invitation",
    targetId: "demo-invitation",
    reason: "privacy",
    detail: "공개 초대장에 개인 연락처가 노출되어 있습니다.",
    reporterContact: "guest@example.com",
    status: "pending",
    createdAt: new Date("2026-03-04T11:00:00.000Z").toISOString(),
    resolvedAt: null
  }
];
const DASHBOARD_REQUEST_TIMEOUT_MS = 3000;

async function withDashboardTimeout<T>(promise: Promise<T>, timeoutMs = DASHBOARD_REQUEST_TIMEOUT_MS): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("dashboard_request_timeout")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getStatusLabel(status: DashboardItem["status"]) {
  switch (status) {
    case "published":
      return "발행됨";
    case "payment_pending":
      return "발행 대기";
    case "paid":
      return "발행 준비됨";
    case "refund_pending":
      return "공개 중지 대기";
    case "refunded":
      return "공개 중지 완료";
    case "payment_failed":
      return "발행 실패";
    default:
      return "초안";
  }
}

function getReportReasonLabel(reason: DashboardContentReport["reason"]) {
  switch (reason) {
    case "privacy":
      return "개인정보 노출";
    case "spam":
      return "광고/스팸";
    case "copyright":
      return "저작권 문제";
    case "other":
      return "기타";
    default:
      return "부적절한 내용";
  }
}

function getReportTargetLabel(targetType: DashboardContentReport["targetType"]) {
  switch (targetType) {
    case "guestbook":
      return "방명록";
    case "image":
      return "이미지";
    default:
      return "초대장";
  }
}

function getReportStatusLabel(status: ReportStatus) {
  switch (status) {
    case "reviewing":
      return "검토 중";
    case "resolved":
      return "처리 완료";
    case "rejected":
      return "기각";
    default:
      return "검토 대기";
  }
}

export function DashboardShell() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [message, setMessage] = useState("불러오는 중...");
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>("");
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [rsvpEntries, setRsvpEntries] = useState<RsvpEntry[]>([]);
  const [contentReports, setContentReports] = useState<DashboardContentReport[]>([]);
  const [variants, setVariants] = useState<DashboardVariant[]>([]);
  const [creatingVariantKey, setCreatingVariantKey] = useState("");
  const [updatingReportId, setUpdatingReportId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

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
        const localItemsWithReports = localItems.map((item) => ({
          ...item,
          reportCount: demoContentReports.filter((report) => report.invitationId === item.id).length
        }));

        setItems(localItemsWithReports);
        setVariants(demoDashboardVariants);
        setCurrentUserId("");
        setSelectedInvitationId(localItemsWithReports[0]?.id ?? "");
        setMessage("현재는 데모 모드입니다. 로그인 후 실제 초대장을 저장할 수 있습니다.");
        return;
      }

      let userId = "";

      try {
        const {
          data: { user }
        } = await withDashboardTimeout(supabase.auth.getUser());
        userId = user?.id ?? "";
      } catch {
        setItems([]);
        setVariants([]);
        setCurrentUserId("");
        setSelectedInvitationId("");
        setMessage("로그인 상태를 확인하지 못했습니다. 로그인 후 다시 시도해 주세요.");
        return;
      }

      if (!userId) {
        setItems([]);
        setVariants([]);
        setContentReports([]);
        setCurrentUserId("");
        setSelectedInvitationId("");
        setMessage("로그인이 필요합니다.");
        return;
      }

      setCurrentUserId(userId);

      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("user_id", userId)
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
        setVariants([]);
        setContentReports([]);
        setCurrentUserId(userId);
        setSelectedInvitationId("");
        setMessage("아직 저장된 초대장이 없습니다.");
        return;
      }

      const invitationIds = rows.map((row) => row.id);
      const [
        { data: rsvpCountRows },
        { data: guestbookCountRows },
        { data: viewCountRows },
        { data: reportCountRows },
        { data: variantRows }
      ] = await Promise.all([
        supabase.from("rsvps").select("invitation_id, variant_id").in("invitation_id", invitationIds),
        supabase.from("guestbook_entries").select("invitation_id, variant_id").in("invitation_id", invitationIds),
        supabase.from("view_logs").select("invitation_id, variant_id").in("invitation_id", invitationIds),
        supabase.from("content_reports").select("invitation_id").in("invitation_id", invitationIds),
        supabase.from("invitation_variants").select("*").in("invitation_id", invitationIds).order("created_at", { ascending: true })
      ]);

      const countByInvitation = (entries: Array<{ invitation_id: string }> | null | undefined) =>
        (entries ?? []).reduce<Record<string, number>>((acc, entry) => {
          acc[entry.invitation_id] = (acc[entry.invitation_id] ?? 0) + 1;
          return acc;
        }, {});
      const countByVariant = (entries: Array<{ variant_id: string | null }> | null | undefined) =>
        (entries ?? []).reduce<Record<string, number>>((acc, entry) => {
          if (entry.variant_id) {
            acc[entry.variant_id] = (acc[entry.variant_id] ?? 0) + 1;
          }
          return acc;
        }, {});

      const rsvpCountMap = countByInvitation(rsvpCountRows);
      const guestbookCountMap = countByInvitation(guestbookCountRows);
      const viewCountMap = countByInvitation(viewCountRows);
      const reportCountMap = countByInvitation(reportCountRows);
      const rsvpVariantCountMap = countByVariant(rsvpCountRows);
      const guestbookVariantCountMap = countByVariant(guestbookCountRows);
      const viewVariantCountMap = countByVariant(viewCountRows);

      const enrichedRows = rows.map((row) => ({
        ...row,
        viewCount: viewCountMap[row.id] ?? 0,
        rsvpCount: rsvpCountMap[row.id] ?? 0,
        guestbookCount: guestbookCountMap[row.id] ?? 0,
        reportCount: reportCountMap[row.id] ?? 0
      }));

      setItems(enrichedRows);
      setVariants(
        (variantRows ?? []).map((variant) => ({
          id: variant.id,
          invitationId: variant.invitation_id,
          audienceKey: variant.audience_key,
          audienceLabel: variant.audience_label,
          slug: variant.slug,
          status: variant.status,
          viewCount: viewVariantCountMap[variant.id] ?? 0,
          rsvpCount: rsvpVariantCountMap[variant.id] ?? 0,
          guestbookCount: guestbookVariantCountMap[variant.id] ?? 0,
          createdAt: variant.created_at
        }))
      );
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
        setContentReports([]);
        return;
      }

      if (!supabase) {
        setGuestbookEntries([]);
        setRsvpEntries(selectedInvitationId === "demo-invitation" ? demoRsvps : []);
        setContentReports(
          selectedInvitationId === "demo-invitation"
            ? demoContentReports
            : []
        );
        return;
      }

      const [
        { data: guestbookData, error: guestbookError },
        { data: rsvpData, error: rsvpError },
        { data: reportData, error: reportError }
      ] = await Promise.all([
        supabase
          .from("guestbook_entries")
          .select("*")
          .eq("invitation_id", selectedInvitationId)
          .order("created_at", { ascending: false }),
        supabase
          .from("rsvps")
          .select("*")
          .eq("invitation_id", selectedInvitationId)
          .order("created_at", { ascending: false }),
        supabase
          .from("content_reports")
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

      if (reportError) {
        setContentReports([]);
      } else {
        setContentReports(
          (reportData ?? []).map((report) => ({
            id: report.id,
            invitationId: report.invitation_id,
            targetType: report.target_type,
            targetId: report.target_id,
            reason: report.reason,
            detail: report.detail ?? "",
            reporterContact: report.reporter_contact ?? "",
            status: report.status,
            createdAt: report.created_at,
            resolvedAt: report.resolved_at
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

  async function updateReportStatus(report: DashboardContentReport, status: Extract<ReportStatus, "resolved" | "rejected">) {
    if (!supabase) {
      setMessage("데모 모드에서는 신고 처리 화면만 확인할 수 있습니다. 로그인 후 실제 신고를 처리할 수 있습니다.");
      return;
    }

    setUpdatingReportId(report.id);

    try {
      const response = await fetch(`/api/dashboard/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json().catch(() => ({
        success: false,
        message: "신고 처리 응답을 읽지 못했습니다."
      })) as { success?: boolean; message?: string; report?: { status: ReportStatus; resolvedAt: string | null } };

      if (!response.ok || !result.success || !result.report) {
        setMessage(result.message || "신고 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      setContentReports((current) =>
        current.map((entry) =>
          entry.id === report.id
            ? {
                ...entry,
                status: result.report?.status ?? status,
                resolvedAt: result.report?.resolvedAt ?? null
              }
            : entry
        )
      );
      setMessage(status === "resolved" ? "신고를 처리 완료로 변경했습니다." : "신고를 기각했습니다.");
    } finally {
      setUpdatingReportId("");
    }
  }

  function downloadDashboardExport(exportType: "rsvps" | "guestbook") {
    if (!selectedInvitation) {
      setMessage("내보낼 초대장을 먼저 선택해 주세요.");
      return;
    }

    if (!supabase || selectedInvitation.id === "local-draft") {
      setMessage("데모 모드에서는 내보내기 위치만 확인할 수 있습니다. 로그인 후 실제 데이터를 CSV로 받을 수 있습니다.");
      return;
    }

    if (typeof window !== "undefined") {
      window.location.href = `/api/dashboard/invitations/${selectedInvitation.id}/export?type=${exportType}`;
    }
  }

  async function copyPublicLink(item: DashboardItem) {
    if (typeof window === "undefined") {
      return;
    }

    const publicUrl = `${window.location.origin}/invitations/${item.slug}`;
    await navigator.clipboard.writeText(publicUrl);
    setMessage("공개 링크를 복사했습니다.");
  }

  async function copyVariantLink(variant: DashboardVariant) {
    if (typeof window === "undefined") {
      return;
    }

    const publicUrl = `${window.location.origin}/invitations/${variant.slug}`;
    await navigator.clipboard.writeText(publicUrl);
    setMessage(`${variant.audienceLabel} 링크를 복사했습니다.`);
  }

  async function createAudienceVariant(item: DashboardItem, preset: InvitationVariantPreset) {
    if (item.status !== "published") {
      setMessage("대상별 링크는 발행된 초대장에서만 만들 수 있습니다.");
      return;
    }

    const existingVariant = variants.find(
      (variant) =>
        variant.invitationId === item.id &&
        variant.audienceKey === preset.audienceKey &&
        variant.status !== "archived"
    );

    if (existingVariant) {
      await copyVariantLink(existingVariant);
      return;
    }

    if (!supabase) {
      setMessage("데모 모드에서는 예시 링크만 확인할 수 있습니다. 로그인 후 실제 대상별 링크를 만들 수 있습니다.");
      return;
    }

    const requestKey = `${item.id}:${preset.audienceKey}`;
    setCreatingVariantKey(requestKey);

    const insertPayload = buildInvitationVariantInsertPayload({
      invitationId: item.id,
      baseSlug: item.slug,
      preset
    });
    const { data, error } = await supabase
      .from("invitation_variants")
      .insert(insertPayload)
      .select("*")
      .single();

    setCreatingVariantKey("");

    if (error || !data) {
      setMessage("대상별 링크를 만들지 못했습니다. 이미 같은 링크가 있거나 잠시 후 다시 시도해 주세요.");
      return;
    }

    const nextVariant: DashboardVariant = {
      id: data.id,
      invitationId: data.invitation_id,
      audienceKey: data.audience_key,
      audienceLabel: data.audience_label,
      slug: data.slug,
      status: data.status,
      viewCount: 0,
      rsvpCount: 0,
      guestbookCount: 0,
      createdAt: data.created_at
    };

    setVariants((current) => [...current, nextVariant]);
    setMessage(`${data.audience_label} 링크를 만들었습니다.`);
  }

  async function duplicateInvitation(item: DashboardItem) {
    if (!supabase || !currentUserId || item.id === "local-draft") {
      setMessage("데모 모드에서는 복제 버튼 위치만 확인할 수 있습니다. 로그인 후 실제 초대장을 새 초안으로 복제할 수 있습니다.");
      return;
    }

    const duplicatedPayload = normalizeDraft({
      ...item.payload,
      title: `${item.title} 복사본`
    });
    const slug = createInvitationSlug(duplicatedPayload);
    const insertPayload = toInvitationInsert(currentUserId, slug, duplicatedPayload, "draft");
    const { data, error } = await supabase
      .from("invitations")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !data) {
      setMessage("초대장을 복제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const duplicatedItem: DashboardItem = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      category: data.category,
      templateId: data.template_id,
      status: data.status,
      repurchaseRequired: data.repurchase_required,
      payload: normalizeDraft(data.payload),
      createdAt: data.created_at,
      publishedAt: data.published_at,
      viewCount: 0,
      rsvpCount: 0,
      guestbookCount: 0,
      reportCount: 0
    };

    setItems((current) => [duplicatedItem, ...current]);
    setSelectedInvitationId(duplicatedItem.id);
    setMessage(`"${item.title}" 복사본을 초안으로 만들었습니다.`);
  }

  async function updateVariantStatus(variant: DashboardVariant, status: DashboardVariant["status"]) {
    if (!supabase) {
      setMessage("데모 모드에서는 대상별 링크 상태를 변경할 수 없습니다.");
      return;
    }

    const { error } = await supabase
      .from("invitation_variants")
      .update({ status })
      .eq("id", variant.id);

    if (error) {
      setMessage("대상별 링크 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setVariants((current) =>
      current.map((entry) => (entry.id === variant.id ? { ...entry, status } : entry))
    );
    setMessage(status === "active" ? `${variant.audienceLabel} 링크를 다시 활성화했습니다.` : `${variant.audienceLabel} 링크를 숨겼습니다.`);
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
  const selectedVariants = variants.filter((variant) => variant.invitationId === selectedInvitationId);
  const dashboardSummary = useMemo(
    () => ({
      totalInvitations: items.length,
      publishedInvitations: items.filter((item) => item.status === "published").length,
      totalViews: items.reduce((sum, item) => sum + (item.viewCount ?? 0), 0),
      totalRsvps: items.reduce((sum, item) => sum + (item.rsvpCount ?? 0), 0),
      totalGuestbook: items.reduce((sum, item) => sum + (item.guestbookCount ?? 0), 0),
      totalReports: items.reduce((sum, item) => sum + (item.reportCount ?? 0), 0)
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
            <p className="ops-note">무료 발행 후에도 공개 링크와 대상별 링크, RSVP, 방명록, 신고 내역을 한 화면에서 관리합니다.</p>
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
          <article className="ops-card">
            <h3>누적 신고</h3>
            <p className="ops-value">{dashboardSummary.totalReports}</p>
            <p className="ops-note">검토 대기와 완료 항목 포함</p>
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
              <p className="ops-line">조회 <strong>{item.viewCount ?? 0}</strong> · RSVP <strong>{item.rsvpCount ?? 0}</strong> · 방명록 <strong>{item.guestbookCount ?? 0}</strong> · 신고 <strong>{item.reportCount ?? 0}</strong></p>
              <p className="ops-note">
                생성일 {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                <br />
                공개 링크 {item.slug}
                <br />
                {item.publishedAt ? `발행일 ${new Date(item.publishedAt).toLocaleDateString("ko-KR")}` : "아직 발행 전입니다."}
              </p>
              <div className="dashboard-actions" style={{ marginTop: "16px" }}>
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
                    <a className="btn-outline" download={`${item.slug}-qr.png`} href={buildPublicQrImagePath(item.slug)}>
                      QR 저장
                    </a>
                    <a className="btn-outline" download={`${item.slug}-instagram.png`} href={buildPublicShareImagePath(item.slug, "instagram")}>
                      인스타 이미지
                    </a>
                    <a className="btn-outline" download={`${item.slug}-a4.png`} href={buildPublicShareImagePath(item.slug, "a4")}>
                      A4 포스터
                    </a>
                    <a className="btn-outline" download={`${item.slug}.ics`} href={buildPublicCalendarPath(item.slug)}>
                      iCal 저장
                    </a>
                  </>
                ) : (
                  <Link className="btn-primary" href={`/builder?invitationId=${item.id}`}>
                    무료 발행 준비
                  </Link>
                )}
                <button className="btn-outline" onClick={() => void duplicateInvitation(item)} type="button">
                  복제
                </button>
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
          <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
            <h3>대상별 링크</h3>
            <p className="ops-note">
              {selectedInvitation
                ? `${selectedInvitation.title}을 친구용, 가족용, 직장용 링크로 나누어 공유하고 응답을 분리합니다.`
                : "대상별 링크를 만들 초대장을 선택해 주세요."}
            </p>
            {selectedInvitation ? (
              <>
                <div className="dashboard-actions" style={{ marginTop: 12 }}>
                  {invitationVariantPresets.map((preset) => {
                    const existingVariant = selectedVariants.find(
                      (variant) => variant.audienceKey === preset.audienceKey && variant.status !== "archived"
                    );
                    const requestKey = `${selectedInvitation.id}:${preset.audienceKey}`;
                    return (
                      <button
                        className={existingVariant ? "btn-outline" : "btn-primary"}
                        disabled={creatingVariantKey === requestKey}
                        key={preset.audienceKey}
                        onClick={() => void createAudienceVariant(selectedInvitation, preset)}
                        type="button"
                      >
                        {existingVariant ? `${preset.audienceLabel} 복사` : `${preset.audienceLabel} 만들기`}
                      </button>
                    );
                  })}
                </div>
                <ul className="list-box" style={{ marginTop: 16 }}>
                  {selectedVariants.length ? (
                    selectedVariants.map((variant) => (
                      <li key={variant.id}>
                        <div className="meta">
                          {variant.audienceLabel} · {variant.status === "active" ? "공개중" : "숨김"}
                        </div>
                        <div className="value">/invitations/{variant.slug}</div>
                        <div className="value">
                          조회 {variant.viewCount} · RSVP {variant.rsvpCount} · 방명록 {variant.guestbookCount}
                        </div>
                        <div className="dashboard-actions" style={{ marginTop: "12px" }}>
                          <button className="btn-primary" onClick={() => void copyVariantLink(variant)} type="button">
                            링크 복사
                          </button>
                          <a className="btn-outline" download={`${variant.slug}-qr.png`} href={buildPublicQrImagePath(variant.slug)}>
                            QR 저장
                          </a>
                          <a className="btn-outline" download={`${variant.slug}-instagram.png`} href={buildPublicShareImagePath(variant.slug, "instagram")}>
                            인스타 이미지
                          </a>
                          <a className="btn-outline" download={`${variant.slug}-a4.png`} href={buildPublicShareImagePath(variant.slug, "a4")}>
                            A4 포스터
                          </a>
                          <a className="btn-outline" download={`${variant.slug}.ics`} href={buildPublicCalendarPath(variant.slug)}>
                            iCal 저장
                          </a>
                          {variant.status === "active" ? (
                            <button className="btn-outline" onClick={() => void updateVariantStatus(variant, "hidden")} type="button">
                              숨기기
                            </button>
                          ) : (
                            <button className="btn-outline" onClick={() => void updateVariantStatus(variant, "active")} type="button">
                              다시 공개
                            </button>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="meta">아직 대상별 링크가 없습니다. 위 버튼으로 링크를 만들 수 있습니다.</li>
                  )}
                </ul>
              </>
            ) : null}
          </article>
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
            <div className="dashboard-actions" style={{ marginTop: "12px" }}>
              <button className="btn-outline" onClick={() => downloadDashboardExport("rsvps")} type="button">
                RSVP CSV 내보내기
              </button>
            </div>
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
            <div className="dashboard-actions" style={{ marginTop: "12px" }}>
              <button className="btn-outline" onClick={() => downloadDashboardExport("guestbook")} type="button">
                방명록 CSV 내보내기
              </button>
            </div>
            <ul className="list-box">
              {guestbookEntries.length ? (
                guestbookEntries.map((entry) => (
                  <li key={entry.id}>
                    <div className="meta">
                      {new Date(entry.createdAt).toLocaleString("ko-KR")} · {entry.nickname}
                    </div>
                    <div className="value">{entry.message}</div>
                    <div className="dashboard-actions" style={{ marginTop: "12px" }}>
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
          <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
            <h3>신고 관리</h3>
            <p className="ops-note">
              {selectedInvitation
                ? `${selectedInvitation.title}의 공개 신고를 검토합니다.`
                : "신고를 검토할 초대장을 선택해 주세요."}
            </p>
            <ul className="list-box">
              {contentReports.length ? (
                contentReports.map((report) => (
                  <li key={report.id}>
                    <div className="meta">
                      {new Date(report.createdAt).toLocaleString("ko-KR")} · {getReportTargetLabel(report.targetType)} · {getReportReasonLabel(report.reason)}
                    </div>
                    <div className="value">{report.detail || "상세 내용 없음"}</div>
                    {report.reporterContact ? <div className="value">회신 정보: {report.reporterContact}</div> : null}
                    <div className="dashboard-actions" style={{ marginTop: "12px" }}>
                      <button
                        className="btn-primary"
                        disabled={updatingReportId === report.id}
                        onClick={() => void updateReportStatus(report, "resolved")}
                        type="button"
                      >
                        처리 완료
                      </button>
                      <button
                        className="btn-outline"
                        disabled={updatingReportId === report.id}
                        onClick={() => void updateReportStatus(report, "rejected")}
                        type="button"
                      >
                        기각
                      </button>
                      <span className="auth-status">{getReportStatusLabel(report.status)}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="meta">접수된 신고가 없습니다.</li>
              )}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
