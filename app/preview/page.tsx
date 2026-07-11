import { InvitationPreviewPage } from "@/components/invitations/invitation-preview-page";

export default async function PreviewPage({
  searchParams
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const params = await searchParams;

  return <InvitationPreviewPage initialTemplateId={params.template} />;
}
