import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ExportType = "rsvps" | "guestbook";

const csvBom = "\uFEFF";

function sanitizeFilenamePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 80) || "invitation";
}

function encodeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>) {
  return [
    headers.map(encodeCsvCell).join(","),
    ...rows.map((row) => row.map(encodeCsvCell).join(","))
  ].join("\n");
}

function csvResponse(filename: string, csv: string) {
  return new Response(`${csvBom}${csv}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json(
      { success: false, message: "내보내기 서버 설정이 완료되지 않았습니다." },
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

  const exportType = new URL(request.url).searchParams.get("type") as ExportType | null;
  if (exportType !== "rsvps" && exportType !== "guestbook") {
    return NextResponse.json(
      { success: false, message: "지원하지 않는 내보내기 형식입니다." },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("id, slug, title")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invitationError || !invitation) {
    return NextResponse.json(
      { success: false, message: "초대장을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const filenameBase = sanitizeFilenamePart(invitation.slug || invitation.title || invitation.id);

  if (exportType === "rsvps") {
    const { data, error } = await admin
      .from("rsvps")
      .select("created_at, guest_name, guest_phone, attending, guests, memo, variant_id")
      .eq("invitation_id", invitation.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: "RSVP 내보내기에 실패했습니다." },
        { status: 500 }
      );
    }

    const csv = toCsv(
      ["제출일", "이름", "연락처", "참석 여부", "동행 인원", "메모", "대상별 링크 ID"],
      (data ?? []).map((entry) => [
        entry.created_at,
        entry.guest_name,
        entry.guest_phone ?? "",
        entry.attending ? "참석" : "불참",
        entry.guests,
        entry.memo ?? "",
        entry.variant_id ?? ""
      ])
    );

    return csvResponse(`${filenameBase}-rsvps.csv`, csv);
  }

  const { data, error } = await admin
    .from("guestbook_entries")
    .select("created_at, nickname, message, approved, variant_id")
    .eq("invitation_id", invitation.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, message: "방명록 내보내기에 실패했습니다." },
      { status: 500 }
    );
  }

  const csv = toCsv(
    ["작성일", "닉네임", "메시지", "공개 상태", "대상별 링크 ID"],
    (data ?? []).map((entry) => [
      entry.created_at,
      entry.nickname,
      entry.message,
      entry.approved ? "공개" : "승인 대기",
      entry.variant_id ?? ""
    ])
  );

  return csvResponse(`${filenameBase}-guestbook.csv`, csv);
}
