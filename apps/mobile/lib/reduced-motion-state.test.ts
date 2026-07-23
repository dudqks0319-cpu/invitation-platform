import { describe, expect, it, vi } from "vitest";
import {
  REDUCED_MOTION_SAFE_DEFAULT,
  getInitialReducedMotionState,
  subscribeToReducedMotion
} from "./reduced-motion-state";

describe("reduced motion state subscription", () => {
  it("suppresses motion while the platform preference is unresolved", () => {
    expect(getInitialReducedMotionState()).toBe(true);
  });
  it.each([true, false])("publishes resolved initial state %s and later transitions", async (initial) => {
    const listeners: Array<(enabled: boolean) => void> = [];
    const remove = vi.fn();
    const onChange = vi.fn();
    const cleanup = subscribeToReducedMotion({
      isReduceMotionEnabled: async () => initial,
      addEventListener: (_event, nextListener) => {
        listeners.push(nextListener);
        return { remove };
      }
    }, onChange);

    await Promise.resolve();
    expect(onChange).toHaveBeenCalledWith(initial);
    listeners[0]?.(!initial);
    expect(onChange).toHaveBeenLastCalledWith(!initial);

    cleanup();
    expect(remove).toHaveBeenCalledOnce();
  });

  it("keeps the safe motion-suppressed fallback when initial lookup rejects", async () => {
    const onChange = vi.fn();
    subscribeToReducedMotion({
      isReduceMotionEnabled: async () => {
        throw new Error("unavailable");
      },
      addEventListener: () => ({ remove: vi.fn() })
    }, onChange);

    await Promise.resolve();
    await Promise.resolve();
    expect(REDUCED_MOTION_SAFE_DEFAULT).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("ignores a late initial lookup after unmount", async () => {
    let resolveInitial!: (enabled: boolean) => void;
    const onChange = vi.fn();
    const listeners: Array<(enabled: boolean) => void> = [];
    const remove = vi.fn();
    const cleanup = subscribeToReducedMotion({
      isReduceMotionEnabled: () => new Promise((resolve) => {
        resolveInitial = resolve;
      }),
      addEventListener: (_event, listener) => {
        listeners.push(listener);
        return { remove };
      }
    }, onChange);

    cleanup();
    resolveInitial(true);
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();
    listeners[0]?.(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledOnce();
  });
});
