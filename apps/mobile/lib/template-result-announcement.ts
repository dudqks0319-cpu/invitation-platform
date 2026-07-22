export const TEMPLATE_RESULT_COMMIT_DELAY_MS = 300;
export const TEMPLATE_RESULT_ANNOUNCEMENT_DELAY_MS = 350;

export function scheduleTemplateResultCommit<T>(
  value: T,
  commit: (value: T) => void,
  delayMs = TEMPLATE_RESULT_COMMIT_DELAY_MS
) {
  const timeout = setTimeout(() => commit(value), delayMs);
  return () => clearTimeout(timeout);
}

export function createTemplateResultAnnouncer(
  announce: (message: string) => void,
  delayMs = TEMPLATE_RESULT_ANNOUNCEMENT_DELAY_MS
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule(message: string) {
      if (timeout) clearTimeout(timeout);
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
