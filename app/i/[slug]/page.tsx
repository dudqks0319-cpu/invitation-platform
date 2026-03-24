import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InvitationView } from "@/components/invitations/invitation-view";
import { SiteHeader } from "@/components/shared/site-header";
import { findDemoInvitationBySlug } from "@/lib/demo-data";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteUrl = env.siteUrl || "https://invitehub.co.kr";
  const ogImageUrl = `${siteUrl}/api/og/${decodedSlug}`;

  let title = "InviteHub 초대장";
  let description = "소중한 순간을 특별하게 초대하세요.";

  const admin = createSupabaseAdminClient();
  if (admin) {
    const { data: invitation } = await admin
      .from("invitations")
      .select("title, payload")
      .eq("slug", decodedSlug)
      .eq("status", "published")
      .maybeSingle();

    if (invitation) {
      const payload = normalizeInvitationPayload(invitation.payload);
      title = payload.title || invitation.title || title;

      const names =
        payload.groomName && payload.brideName
          ? `${payload.groomName} ♡ ${payload.brideName}`
          : "";

      description = names
        ? `${names}의 초대장 — ${payload.message || "소중한 자리에 함께해 주세요."}`
        : payload.message || description;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/i/${decodedSlug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      siteName: "InviteHub",
      locale: "ko_KR"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl]
    },
    other: {
      "og:image:width": "1200",
      "og:image:height": "630"
    }
  };
}

export default async function PublicInvitationPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const admin = createSupabaseAdminClient();
  const supabase = admin ?? (await createServerSupabaseClient());

  if (supabase) {
    const { data: invitation } = await supabase
      .from("invitations")
      .select("*")
      .eq("slug", decodedSlug)
      .eq("status", "published")
      .maybeSingle();

    if (invitation) {
      const siteUrl = env.siteUrl;
      if (siteUrl) {
        fetch(`${siteUrl}/api/public/${decodedSlug}/visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        }).catch(() => {});
      }

      const { data: guestbookEntries } = await supabase
        .from("guestbook_entries")
        .select("*")
        .eq("invitation_id", invitation.id)
        .order("created_at", { ascending: false })
        .limit(20);

      const approvedEntries = (guestbookEntries ?? []).filter((entry) => {
        if ("is_approved" in entry) return entry.is_approved === true;
        if ("approved" in entry) return (entry as Record<string, unknown>).approved === true;
        return false;
      });

      return (
        <>
          <SiteHeader />
          <div className="app-page-offset">
            <InvitationView
              initialGuestbookEntries={approvedEntries.map((entry) => ({
                id: entry.id,
                nickname: entry.nickname,
                message: entry.message,
                approved: true,
                createdAt: entry.created_at
              }))}
              mode="public"
              payload={normalizeInvitationPayload(invitation.payload)}
              shareUrl={`/i/${invitation.slug}`}
              slug={invitation.slug}
            />
          </div>
        </>
      );
    }
  }

  const demoInvitation = findDemoInvitationBySlug(decodedSlug);

  if (!demoInvitation) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <div className="app-page-offset">
        <InvitationView mode="public" payload={demoInvitation.payload} shareUrl={`/i/${demoInvitation.slug}`} slug={demoInvitation.slug} />
      </div>
    </>
  );
}
