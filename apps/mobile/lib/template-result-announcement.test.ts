import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createTemplateResultAnnouncer,
  scheduleTemplateResultCommit,
  TEMPLATE_RESULT_ANNOUNCEMENT_DELAY_MS,
  TEMPLATE_RESULT_COMMIT_DELAY_MS
} from "./template-result-announcement";

afterEach(() => vi.useRealTimers());

describe("template result announcements", () => {
  it("announces only the last committed result once after the debounce window", async () => {
    vi.useFakeTimers();
    const announce = vi.fn();
    const announcer = createTemplateResultAnnouncer(announce);

    announcer.schedule("웨딩 12개");
    announcer.schedule("웨딩 플라워 5개");
    announcer.schedule("웨딩 플라워 봄 2개");

    expect(announce).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(TEMPLATE_RESULT_ANNOUNCEMENT_DELAY_MS - 1);
    expect(announce).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith("웨딩 플라워 봄 2개");
  });

  it("does not announce per keystroke and announces once after query commit", async () => {
    vi.useFakeTimers();
    const announce = vi.fn();
    const committedQueries: string[] = [];
    const announcer = createTemplateResultAnnouncer(announce);
    let cancelCommit: () => void = () => undefined;

    for (const query of ["ㅍ", "플", "플라", "플라워"]) {
      cancelCommit();
      cancelCommit = scheduleTemplateResultCommit(query, (committed) => {
        committedQueries.push(committed);
        announcer.schedule(`${committed} 결과 2개`);
      });
      await vi.advanceTimersByTimeAsync(40);
      expect(announce).not.toHaveBeenCalled();
    }

    await vi.advanceTimersByTimeAsync(TEMPLATE_RESULT_COMMIT_DELAY_MS - 40);
    expect(committedQueries).toEqual(["플라워"]);
    expect(announce).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(TEMPLATE_RESULT_ANNOUNCEMENT_DELAY_MS);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith("플라워 결과 2개");
  });

  it("can cancel a pending result announcement on unmount", async () => {
    vi.useFakeTimers();
    const announce = vi.fn();
    const announcer = createTemplateResultAnnouncer(announce);
    announcer.schedule("디자인 3개");
    announcer.cancel();
    await vi.runAllTimersAsync();
    expect(announce).not.toHaveBeenCalled();
  });
});
