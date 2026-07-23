export const TEMPLATE_PREVIEW_ANNOUNCEMENT_DELAY_MS = 250;

export function createTemplatePreviewAnnouncementController(
  announce: (message: string) => void,
  delayMs = TEMPLATE_PREVIEW_ANNOUNCEMENT_DELAY_MS
) {
  let lastTransitionKey: string | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return {
    transition(transitionKey: string, message: string | null) {
      if (transitionKey === lastTransitionKey) return;
      lastTransitionKey = transitionKey;
      if (timeout) clearTimeout(timeout);
      timeout = null;
      if (!message) return;
      timeout = setTimeout(() => {
        timeout = null;
        announce(message);
      }, delayMs);
    },
    cancel() {
      if (timeout) clearTimeout(timeout);
      timeout = null;
    }
  };
}
