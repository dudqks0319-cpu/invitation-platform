import type { Metadata } from "next";
import { generatePublicInvitationMetadata, renderPublicInvitationPage } from "@/app/invitations/[slug]/page";

export default async function PublicInvitationAliasPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  return renderPublicInvitationPage({ params, pathPrefix: "/i" });
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return generatePublicInvitationMetadata({ params, pathPrefix: "/i" });
}
