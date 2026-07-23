export type TemplatePreviewSelection<T> = {
  templateId: string;
  template: T;
};

export function retainFirstValidatedTemplateSelection<T extends { id: string }>(
  current: TemplatePreviewSelection<T> | null,
  requestedTemplateId: string | undefined,
  candidate: T | null
): TemplatePreviewSelection<T> | null {
  if (current) return current;
  if (!requestedTemplateId || !candidate || candidate.id !== requestedTemplateId) return null;
  return { templateId: requestedTemplateId, template: candidate };
}
