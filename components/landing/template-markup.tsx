import type { TemplatePreset } from "@/lib/templates";

export function TemplateMarkup({
  template,
  className = ""
}: {
  template: TemplatePreset;
  className?: string;
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: template.html }} />;
}
