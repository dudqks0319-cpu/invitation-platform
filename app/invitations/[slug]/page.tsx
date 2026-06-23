import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitations/invitation-view";
import { SiteHeader } from "@/components/shared/site-header";
import { findDemoInvitationBySlug } from "@/lib/demo-data";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import { buildPublicInvitationPayload } from "@/lib/invitation-payload";
import { getPublicShareUrl } from "@/lib/invitation-presentation";
import { resolvePublishedInvitationBySlug } from "@/lib/invitation-variants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type HeaderSource = {
  get(name: string): string | null;
};

type ViewLogsTable = {
  select(columns: string): ViewLogFilterQuery;
  insert(payload: {
    invitation_id: string;
    variant_id?: string | null;
    user_agent: string;
  }): Promise<{ error: { message?: string } | null }>;
};

type ViewLogFilterQuery = {
  eq(column: string, value: string): ViewLogFilterQuery;
  is(column: string, value: null): ViewLogFilterQuery;
  gte(column: string, value: string): {
    limit(count: number): Promise<{
      data: Array<{ id: number }> | null;
      error: { message?: string } | null;
    }>;
  };
};

type GuestbookEntryFilterQuery = {
  eq(column: string, value: string | boolean): GuestbookEntryFilterQuery;
  is(column: string, value: null): GuestbookEntryFilterQuery;
  order(column: string, options: { ascending: boolean }): {
    limit(count: number): Promise<{
      data: GuestbookEntryRow[] | null;
      error: { message?: string } | null;
    }>;
  };
};

type GuestbookEntriesTable = {
  select(columns: string): GuestbookEntryFilterQuery;
};

type GuestbookEntryRow = {
  id: string;
  nickname: string;
  message: string;
  approved: boolean;
  created_at: string;
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
  userAgent: string,
  variantId: string | null = null
) {
  if (!userAgent) {
    return;
  }

  const cutoff = new Date(Date.now() - VIEW_LOG_COOLDOWN_MS).toISOString();
  const viewLogsTable = admin.from("view_logs") as ViewLogsTable;
  const recentQuery = viewLogsTable
    .select("id")
    .eq("invitation_id", invitationId)
    .eq("user_agent", userAgent);
  const scopedRecentQuery = variantId
    ? recentQuery.eq("variant_id", variantId)
    : recentQuery.is("variant_id", null);
  const { data: recentLogs, error: recentError } = await scopedRecentQuery
    .gte("created_at", cutoff)
    .limit(1);

  if (!recentError && recentLogs?.length) {
    return;
  }

  await viewLogsTable.insert({
    invitation_id: invitationId,
    variant_id: variantId,
    user_agent: userAgent
  });
}

export async function loadApprovedGuestbookEntries(
  admin: { from(table: string): unknown } | null,
  invitationId: string,
  variantId: string | null = null
) {
  if (!admin) {
    return [];
  }

  try {
    const guestbookEntriesTable = admin.from("guestbook_entries") as GuestbookEntriesTable;
    const guestbookQuery = guestbookEntriesTable
      .select("*")
      .eq("invitation_id", invitationId)
      .eq("approved", true);
    const scopedGuestbookQuery = variantId
      ? guestbookQuery.eq("variant_id", variantId)
      : guestbookQuery.is("variant_id", null);
    const { data, error } = await scopedGuestbookQuery
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
      lookup: null
    };
  }

  return {
    admin,
    lookup: await resolvePublishedInvitationBySlug(supabase, slug)
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
  const { lookup } = await loadPublishedInvitation(decodedSlug);

  if (lookup) {
    const payload = buildPublicInvitationPayload(
      buildPublishedInvitationAssetPayload(lookup.publicSlug, lookup.payload)
    );
    const imageUrl = getPublicShareUrl(
      payload.mainImageUrl || payload.backgroundImageUrl || payload.templateSnapshot?.backgroundImageUrl || DEFAULT_OG_IMAGE,
      origin
    );

    return buildPublicInvitationMetadata({
      title: lookup.invitation.title || payload.title,
      description: payload.message || `${lookup.invitation.title || payload.title} 안내`,
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
  const platformKakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";
  const { admin, lookup } = await loadPublishedInvitation(decodedSlug);

  if (lookup) {
    const payload = buildPublicInvitationPayload(
      buildPublishedInvitationAssetPayload(lookup.publicSlug, lookup.payload)
    );
    if (admin) {
      await logInvitationView(admin, lookup.invitation.id, headerList.get("user-agent") || "", lookup.variant?.id ?? null);
    }

    const guestbookEntries = await loadApprovedGuestbookEntries(admin, lookup.invitation.id, lookup.variant?.id ?? null);

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
            payload={payload}
            platformKakaoJsKey={platformKakaoJsKey}
            shareUrl={getPublicShareUrl(`/invitations/${lookup.publicSlug}`, origin)}
            slug={lookup.publicSlug}
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
          platformKakaoJsKey={platformKakaoJsKey}
          shareUrl={getPublicShareUrl(`/invitations/${demoInvitation.slug}`, origin)}
          slug={demoInvitation.slug}
        />
      </div>
    </>
  );
}
