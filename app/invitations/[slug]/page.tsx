import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitations/invitation-view";
import { SiteHeader } from "@/components/shared/site-header";
import { findDemoInvitationBySlug } from "@/lib/demo-data";
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
    user_agent: string;
  }): Promise<{ error: { message?: string } | null }>;
};

const VIEW_LOG_COOLDOWN_MS = 30 * 60 * 1000;
const DEFAULT_OG_IMAGE = "/images/genspark/cncrue0H.jpg";

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
      siteName: "InviteHub",
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

export async function logInvitationView(
  admin: {
    from(table: string): unknown;
  },
  invitationId: string,
  userAgent: string
) {
  if (!userAgent) {
    return;
  }

  const cutoff = new Date(Date.now() - VIEW_LOG_COOLDOWN_MS).toISOString();
  const viewLogsTable = admin.from("view_logs") as ViewLogsTable;
  const { data: recentLogs, error: recentError } = await viewLogsTable
    .select("id")
    .eq("invitation_id", invitationId)
    .eq("user_agent", userAgent)
    .gte("created_at", cutoff)
    .limit(1);

  if (!recentError && recentLogs?.length) {
    return;
  }

  await viewLogsTable.insert({
    invitation_id: invitationId,
    user_agent: userAgent
  });
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
  const shareUrl = getPublicShareUrl(`/invitations/${decodedSlug}`, origin);
  const { invitation } = await loadPublishedInvitation(decodedSlug);

  if (invitation) {
    const payload = normalizeInvitationPayload(invitation.payload);
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
    title: "InviteHub",
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
  const { admin, invitation } = await loadPublishedInvitation(decodedSlug);

  if (invitation) {
    if (admin) {
      await logInvitationView(admin, invitation.id, headerList.get("user-agent") || "");
    }

    const { data: guestbookEntries } = await (admin ?? createSupabaseAdminClient())!
      .from("guestbook_entries")
      .select("*")
      .eq("invitation_id", invitation.id)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(20);

    return (
      <>
        <SiteHeader mode="focus" />
        <div className="app-page-offset">
          <InvitationView
            initialGuestbookEntries={(guestbookEntries ?? []).map((entry) => ({
              id: entry.id,
              nickname: entry.nickname,
              message: entry.message,
              approved: entry.approved,
              createdAt: entry.created_at
            }))}
            mode="public"
            payload={normalizeInvitationPayload(invitation.payload)}
            shareUrl={getPublicShareUrl(`/invitations/${invitation.slug}`, origin)}
            slug={invitation.slug}
          />
        </div>
      </>
    );
  }

  const demoInvitation = findDemoInvitationBySlug(decodedSlug);

  if (!demoInvitation) {
    notFound();
  }

  return (
    <>
      <SiteHeader mode="focus" />
      <div className="app-page-offset">
        <InvitationView
          mode="public"
          payload={demoInvitation.payload}
          shareUrl={getPublicShareUrl(`/invitations/${demoInvitation.slug}`, origin)}
          slug={demoInvitation.slug}
        />
      </div>
    </>
  );
}
