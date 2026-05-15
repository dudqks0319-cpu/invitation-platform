import {
  createEmptyInvitationDraft,
  getDefaultInvitationSample,
  type InvitationPayload
} from "./invitation-shared";
import type { MobileTemplateGalleryItem } from "./template-gallery";

const TEMPLATE_PREVIEW_OWNER_ID = "template-preview-owner";

export function createTemplatePreviewPayload(template: MobileTemplateGalleryItem): InvitationPayload {
  const sample = getDefaultInvitationSample(template.category);
  const payload = createEmptyInvitationDraft(TEMPLATE_PREVIEW_OWNER_ID).payload;

  return {
    ...payload,
    eventType: template.category,
    templateId: template.id,
    title: sample.title,
    eventDateTime: sample.eventDateTime,
    venueName: sample.venueName,
    venueAddress: sample.venueAddress,
    message: sample.message,
    eventData: {
      ...payload.eventData,
      type: template.category,
      groom: {
        ...payload.eventData.groom,
        name: sample.groomName
      },
      bride: {
        ...payload.eventData.bride,
        name: sample.brideName
      }
    }
  };
}
