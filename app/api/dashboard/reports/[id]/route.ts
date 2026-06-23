import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";

const reportModerationSchema = z.object({
  status: z.enum(["resolved", "rejected"]),
  adminNote: z.string().trim().max(500).optional().default("")
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json(
      { success: false, message: "신고 관리 서버 설정이 완료되지 않았습니다." },
      { status: 503 }
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  if (!ensureJsonRequest(request)) {
    return NextResponse.json(
      { success: false, message: "JSON 요청만 허용됩니다." },
      { status: 415 }
    );
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { success: false, message: bodyResult.message },
      { status: 400 }
    );
  }

  const parsed = reportModerationSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "입력값이 올바르지 않습니다.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const { data: report, error: reportError } = await admin
    .from("content_reports")
    .select("id, invitation_id, status, admin_note, resolved_at")
    .eq("id", id)
    .maybeSingle();

  if (reportError || !report?.invitation_id) {
    return NextResponse.json(
      { success: false, message: "신고 내역을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("id")
    .eq("id", report.invitation_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invitationError || !invitation) {
    return NextResponse.json(
      { success: false, message: "신고 내역을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const resolvedAt = new Date().toISOString();
  const { data: updatedReport, error: updateError } = await admin
    .from("content_reports")
    .update({
      status: parsed.data.status,
      admin_note: parsed.data.adminNote || null,
      resolved_at: resolvedAt
    })
    .eq("id", report.id)
    .select("id, status, resolved_at")
    .single();

  if (updateError || !updatedReport) {
    return NextResponse.json(
      { success: false, message: "신고 상태를 변경하지 못했습니다." },
      { status: 500 }
    );
  }

  const { error: eventError } = await admin
    .from("moderation_events")
    .insert({
      target_type: "report",
      target_id: report.id,
      action: parsed.data.status === "resolved" ? "resolve" : "reject",
      reason: parsed.data.adminNote || null,
      actor_id: user.id
    });

  if (eventError) {
    await admin
      .from("content_reports")
      .update({
        status: report.status,
        admin_note: report.admin_note,
        resolved_at: report.resolved_at
      })
      .eq("id", report.id);

    return NextResponse.json(
      { success: false, message: "운영 이력을 기록하지 못해 신고 상태를 변경하지 않았습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    report: {
      id: updatedReport.id,
      status: updatedReport.status,
      resolvedAt: updatedReport.resolved_at
    }
  });
}
