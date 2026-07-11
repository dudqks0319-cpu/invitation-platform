import { createHash } from "node:crypto";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitations/invitation-view";
import { findDemoInvitationBySlug } from "@/lib/demo-data";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import { getPublicShareUrl } from "@/lib/invitation-presentation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type HeaderSource = {
  get(name: string): string | null;
};

type ViewLogsTable = {
  select(columns: string): {
    eq(column: string, value: string): {
      eq(column: string, value: string): {
        gte(column: string, value: string): {
          limit(count: number): Promise<{
            data: Array<{ id: number }> | null;
            error: { message?: string } | null;
          }>;
        };
      };
    };
  };
  insert(payload: {
    invitation_id: string;
    visitor_key: string;
    user_agent: string;
  }): Promise<{ error: { message?: string } | null }>;
};

type GuestbookEntryRow = {
  id: string;
  nickname: string;
  message: string;
  approved: boolean;
  created_at: string;
};

type GuestbookEntriesTable = {
  select(columns: string): {
    eq(column: string, value: string): {
      eq(column: string, value: boolean): {
        order(column: string, options: { ascending: boolean }): {
          limit(count: number): Promise<{
            data: GuestbookEntryRow[] | null;
            error: { message?: string } | null;
          }>;
        };
      };
    };
  };
};

const VIEW_LOG_COOLDOWN_MS = 30 * 60 * 1000;
const DEFAULT_OG_IMAGE = "/images/genspark/cncrue0H.jpg";
const MAX_LOGGED_USER_AGENT_LENGTH = 200;

export function resolveRequestOrigin(headerList: HeaderSource) {
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost || headerList.get("host") || "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export function buildPublicInvitationMetadata({
  title,
  description,
  shareUrl,
  imageUrl
}: {
  title: string;
  description: string;
  shareUrl: string;
  imageUrl: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: "오삼오삼",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

function getHeaderIp(headerList: HeaderSource) {
  return (
    headerList.get("cf-connecting-ip") ||
    headerList.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "anonymous"
  );
}

export function createVisitorKey(invitationId: string, userAgent: string, headerList: HeaderSource) {
  return createHash("sha256")
    .update(`${invitationId}:${getHeaderIp(headerList)}:${userAgent.slice(0, MAX_LOGGED_USER_AGENT_LENGTH)}`)
    .digest("hex");
}

export async function logInvitationView(
  admin: {
    from(table: string): unknown;
  },
  invitationId: string,
  userAgent: string,
  visitorKey: string
) {
  if (!userAgent || !visitorKey) {
    return;
  }

  const cutoff = new Date(Date.now() - VIEW_LOG_COOLDOWN_MS).toISOString();
  const viewLogsTable = admin.from("view_logs") as ViewLogsTable;
  const { data: recentLogs, error: recentError } = await viewLogsTable
    .select("id")
    .eq("invitation_id", invitationId)
    .eq("visitor_key", visitorKey)
    .gte("created_at", cutoff)
    .limit(1);

  if (!recentError && recentLogs?.length) {
    return;
  }

  await viewLogsTable.insert({
    invitation_id: invitationId,
    visitor_key: visitorKey,
    user_agent: userAgent.slice(0, MAX_LOGGED_USER_AGENT_LENGTH)
  });
}

export async function loadApprovedGuestbookEntries(
  admin: { from(table: string): unknown } | null,
  invitationId: string
) {
  if (!admin) {
    return [];
  }

  try {
    const guestbookEntriesTable = admin.from("guestbook_entries") as GuestbookEntriesTable;
    const { data, error } = await guestbookEntriesTable
      .select("*")
      .eq("invitation_id", invitationId)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return [];
    }

    return data ?? [];
  } catch {
    return [];
  }
}

async function loadPublishedInvitation(slug: string) {
  const admin = createSupabaseAdminClient();
  const supabase = admin ?? (await createServerSupabaseClient());

  if (!supabase) {
    return {
      admin,
      invitation: null
    };
  }

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return {
    admin,
    invitation
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const origin = resolveRequestOrigin(await headers());
  const shareUrl = getPublicShareUrl(`/i/${decodedSlug}`, origin);
  const { invitation } = await loadPublishedInvitation(decodedSlug);

  if (invitation) {
    const payload = buildPublishedInvitationAssetPayload(
      invitation.slug,
      normalizeInvitationPayload(invitation.payload)
    );
    const imageUrl = getPublicShareUrl(payload.mainImageUrl || payload.backgroundImageUrl || DEFAULT_OG_IMAGE, origin);

    return buildPublicInvitationMetadata({
      title: invitation.title || payload.title,
      description: payload.message || `${invitation.title || payload.title} 안내`,
      shareUrl,
      imageUrl
    });
  }

  const demoInvitation = findDemoInvitationBySlug(decodedSlug);
  if (demoInvitation) {
    return buildPublicInvitationMetadata({
      title: demoInvitation.title,
      description: demoInvitation.payload.message || `${demoInvitation.title} 안내`,
      shareUrl,
      imageUrl: getPublicShareUrl(DEFAULT_OG_IMAGE, origin)
    });
  }

  return buildPublicInvitationMetadata({
    title: "오삼오삼",
    description: "모바일 초대장을 손쉽게 만들고 공유하세요.",
    shareUrl,
    imageUrl: getPublicShareUrl(DEFAULT_OG_IMAGE, origin)
  });
}

export default async function PublicInvitationPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const headerList = await headers();
  const origin = resolveRequestOrigin(headerList);
  const platformKakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";
  const { admin, invitation } = await loadPublishedInvitation(decodedSlug);

  if (invitation) {
    const payload = buildPublishedInvitationAssetPayload(
      invitation.slug,
      normalizeInvitationPayload(invitation.payload)
    );
    if (admin) {
      const userAgent = headerList.get("user-agent") || "";
      await logInvitationView(admin, invitation.id, userAgent, createVisitorKey(invitation.id, userAgent, headerList));
    }

    const guestbookEntries = await loadApprovedGuestbookEntries(admin, invitation.id);

    return (
      <InvitationView
        initialGuestbookEntries={(guestbookEntries ?? []).map((entry) => ({
          id: entry.id,
          nickname: entry.nickname,
          message: entry.message,
          approved: entry.approved,
          createdAt: entry.created_at
        }))}
        mode="public"
        payload={payload}
        platformKakaoJsKey={platformKakaoJsKey}
        shareUrl={getPublicShareUrl(`/i/${invitation.slug}`, origin)}
        slug={invitation.slug}
      />
    );
  }

  const demoInvitation = findDemoInvitationBySlug(decodedSlug);

  if (!demoInvitation) {
    notFound();
  }

  return (
    <InvitationView
      mode="public"
      payload={demoInvitation.payload}
      platformKakaoJsKey={platformKakaoJsKey}
      shareUrl={getPublicShareUrl(`/i/${demoInvitation.slug}`, origin)}
      slug={demoInvitation.slug}
    />
  );
}
