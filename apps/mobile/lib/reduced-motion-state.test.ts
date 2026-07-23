import { describe, expect, it, vi } from "vitest";
import { subscribeToReducedMotion } from "./reduced-motion-state";

describe("reduced motion state subscription", () => {
  it("publishes initial and transition states, then removes the listener", async () => {
    const listeners: Array<(enabled: boolean) => void> = [];
    const remove = vi.fn();
    const onChange = vi.fn();
    const cleanup = subscribeToReducedMotion({
      isReduceMotionEnabled: async () => true,
      addEventListener: (_event, nextListener) => {
        listeners.push(nextListener);
        return { remove };
      }
    }, onChange);

    await Promise.resolve();
    expect(onChange).toHaveBeenCalledWith(true);
    listeners[0]?.(false);
    expect(onChange).toHaveBeenLastCalledWith(false);

    cleanup();
    expect(remove).toHaveBeenCalledOnce();
  });

  it("ignores a late initial lookup after unmount", async () => {
    let resolveInitial!: (enabled: boolean) => void;
    const onChange = vi.fn();
    const cleanup = subscribeToReducedMotion({
      isReduceMotionEnabled: () => new Promise((resolve) => {
        resolveInitial = resolve;
      }),
      addEventListener: () => ({ remove: vi.fn() })
    }, onChange);

    cleanup();
    resolveInitial(true);
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();
  });
});
