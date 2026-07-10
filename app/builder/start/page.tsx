import { TemplateStartRedirect } from "@/components/builder/template-start-redirect";

export default async function TemplateStartPage({
  searchParams
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const params = await searchParams;

  return <TemplateStartRedirect templateId={params.template ?? ""} />;
}
