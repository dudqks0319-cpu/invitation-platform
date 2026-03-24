import { redirect } from "next/navigation";

export default async function LegacyInvitationRedirect({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/i/${slug}`);
}
