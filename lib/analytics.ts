type GtagEvent = (command: "event", name: string, params: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagEvent;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.gtag?.("event", name, params);
}
