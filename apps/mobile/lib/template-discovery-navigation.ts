export type TemplatePreviewDestination = {
  pathname: "/template-preview";
  params: { templateId: string };
};

export function createTemplatePreviewDestination(templateId: string): TemplatePreviewDestination | null {
  if (!/^[a-z0-9-]{2,80}$/.test(templateId)) return null;
  return { pathname: "/template-preview", params: { templateId } };
}
