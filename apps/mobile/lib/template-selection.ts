import type { MobileTemplateGalleryItem } from "./template-gallery";

type SelectableTemplate = Pick<MobileTemplateGalleryItem, "id" | "category" | "badge">;

type DraftCreator = (
  ownerId: string,
  input: { templateId: string; eventType: string; title: string }
) => Promise<{ localId: string }>;

type BuilderRouter = {
  push: (destination: { pathname: "/builder/step1-basic"; params: { localId: string } }) => void;
};

export async function selectTemplateAndOpenBuilder({
  template,
  draftOwnerId,
  createAndPersistDraft,
  router
}: {
  template: SelectableTemplate;
  draftOwnerId: string;
  createAndPersistDraft: DraftCreator;
  router: BuilderRouter;
}) {
  const draft = await createAndPersistDraft(draftOwnerId, {
    templateId: template.id,
    eventType: template.category,
    title: `${template.badge} 초대장`
  });
  router.push({ pathname: "/builder/step1-basic", params: { localId: draft.localId } });
}
