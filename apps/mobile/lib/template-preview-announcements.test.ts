import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createTemplatePreviewAnnouncementController,
  TEMPLATE_PREVIEW_ANNOUNCEMENT_DELAY_MS
} from "./template-preview-announcements";

afterEach(() => vi.useRealTimers());

describe("template preview accessibility announcements", () => {
  it("announces each inspection and creation transition once", async () => {
    vi.useFakeTimers();
    const announce = vi.fn();
    const controller = createTemplatePreviewAnnouncementController(announce);

    controller.transition("inspection:checking", "기존 초안을 확인하는 중입니다.");
    controller.transition("inspection:checking", "기존 초안을 확인하는 중입니다.");
    await vi.advanceTimersByTimeAsync(TEMPLATE_PREVIEW_ANNOUNCEMENT_DELAY_MS);
    expect(announce).toHaveBeenCalledTimes(1);

    controller.transition("inspection:error", "초안 저장소를 확인하지 못했어요.");
    await vi.advanceTimersByTimeAsync(TEMPLATE_PREVIEW_ANNOUNCEMENT_DELAY_MS);
    controller.transition("creation:creating", "초대장을 만드는 중입니다.");
    await vi.advanceTimersByTimeAsync(TEMPLATE_PREVIEW_ANNOUNCEMENT_DELAY_MS);
    controller.transition("creation:failed", "초대장을 만들지 못했어요.");
    controller.transition("creation:failed", "초대장을 만들지 못했어요.");
    await vi.advanceTimersByTimeAsync(TEMPLATE_PREVIEW_ANNOUNCEMENT_DELAY_MS);

    expect(announce.mock.calls.map(([message]) => message)).toEqual([
      "기존 초안을 확인하는 중입니다.",
      "초안 저장소를 확인하지 못했어요.",
      "초대장을 만드는 중입니다.",
      "초대장을 만들지 못했어요."
    ]);
  });

  it("cancels stale pending speech when the state changes or unmounts", async () => {
    vi.useFakeTimers();
    const announce = vi.fn();
    const controller = createTemplatePreviewAnnouncementController(announce);

    controller.transition("inspection:checking", "기존 초안을 확인하는 중입니다.");
    controller.transition("inspection:ready", null);
    await vi.runAllTimersAsync();
    expect(announce).not.toHaveBeenCalled();

    controller.transition("creation:creating", "초대장을 만드는 중입니다.");
    controller.cancel();
    await vi.runAllTimersAsync();
    expect(announce).not.toHaveBeenCalled();
  });
});
