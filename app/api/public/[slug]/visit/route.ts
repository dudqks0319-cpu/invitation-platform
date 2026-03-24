import { NextRequest, NextResponse } from "next/server";
import { hashIp } from "@/lib/hash-ip";
import { checkVisitLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return NextResponse.json({ success: false }, { status: 503 });
  }

  const { data: invitation } = await admin
    .from("invitations")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  const clientIp = getClientIp(request);
  const { allowed } = await checkVisitLimit(invitation.id, clientIp);
  if (!allowed) {
    return NextResponse.json({ success: true });
  }

  await admin.from("visits").insert({
    invitation_id: invitation.id,
    user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
    ip_hash: await hashIp(clientIp)
  });

  return NextResponse.json({ success: true });
}
