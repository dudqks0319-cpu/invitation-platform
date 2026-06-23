import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type PublicAbuseClient = SupabaseClient<Database>;

type PublicAbuseResult = {
  ok: true;
  blocked: boolean;
} | {
  ok: false;
};

const GUESTBOOK_REPORT_BLOCK_THRESHOLD = 3;

export async function checkPublicAbuseBlock({
  admin,
  invitationId,
  clientHash,
  now = Date.now()
}: {
  admin: PublicAbuseClient;
  invitationId: string;
  clientHash: string;
  now?: number;
}): Promise<PublicAbuseResult> {
  const { data, error } = await admin
    .from("public_abuse_blocks")
    .select("id, expires_at")
    .eq("invitation_id", invitationId)
    .eq("client_hash", clientHash)
    .eq("status", "active");

  if (error) {
    return {
      ok: false
    };
  }

  return {
    ok: true,
    blocked: (data ?? []).some((entry) => !entry.expires_at || Date.parse(entry.expires_at) > now)
  };
}

export async function applyGuestbookReportAutoBlock({
  admin,
  invitationId,
  targetType,
  targetId
}: {
  admin: PublicAbuseClient;
  invitationId: string;
  targetType: "invitation" | "guestbook" | "image";
  targetId: string;
}): Promise<PublicAbuseResult> {
  if (targetType !== "guestbook") {
    return {
      ok: true,
      blocked: false
    };
  }

  const { data: guestbookEntry, error: guestbookError } = await admin
    .from("guestbook_entries")
    .select("id, client_hash")
    .eq("id", targetId)
    .eq("invitation_id", invitationId)
    .maybeSingle();

  if (guestbookError) {
    return {
      ok: false
    };
  }

  if (!guestbookEntry?.client_hash) {
    return {
      ok: true,
      blocked: false
    };
  }

  const { data: reports, error: reportsError } = await admin
    .from("content_reports")
    .select("id")
    .eq("target_type", "guestbook")
    .eq("target_id", targetId)
    .in("status", ["pending", "reviewing"]);

  if (reportsError) {
    return {
      ok: false
    };
  }

  if ((reports ?? []).length < GUESTBOOK_REPORT_BLOCK_THRESHOLD) {
    return {
      ok: true,
      blocked: false
    };
  }

  const existingBlock = await checkPublicAbuseBlock({
    admin,
    invitationId,
    clientHash: guestbookEntry.client_hash
  });

  if (!existingBlock.ok || existingBlock.blocked) {
    return existingBlock;
  }

  const { error: insertError } = await admin
    .from("public_abuse_blocks")
    .insert({
      invitation_id: invitationId,
      client_hash: guestbookEntry.client_hash,
      target_type: "guestbook",
      target_id: targetId,
      reason: "report_threshold",
      status: "active"
    });

  if (insertError) {
    return {
      ok: false
    };
  }

  return {
    ok: true,
    blocked: true
  };
}
