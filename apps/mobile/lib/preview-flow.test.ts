import { describe, expect, it } from "vitest";
import { getPreviewFlowState } from "./preview-flow";

describe("getPreviewFlowState", () => {
  it("marks payment as current for paid unpublished invitations", () => {
    const state = getPreviewFlowState({
      isPublished: false,
      requiresPurchase: true
    });

    expect(state.steps.map((step) => step.status)).toEqual([
      "done",
      "current",
      "upcoming"
    ]);
  });

  it("skips payment for free unpublished invitations", () => {
    const state = getPreviewFlowState({
      isPublished: false,
      requiresPurchase: false
    });

    expect(state.steps.map((step) => step.status)).toEqual([
      "done",
      "skipped",
      "current"
    ]);
  });

  it("marks photo removal as current when paid publishing is unavailable", () => {
    const state = getPreviewFlowState({
      isPublished: false,
      purchaseUnavailable: true,
      requiresPurchase: true
    });

    expect(state.steps.map((step) => step.label)).toEqual([
      "미리보기",
      "사진 제거",
      "무료 발행"
    ]);
    expect(state.steps.map((step) => step.status)).toEqual([
      "done",
      "current",
      "upcoming"
    ]);
  });

  it("marks the whole flow complete when the invitation is published", () => {
    const state = getPreviewFlowState({
      isPublished: true,
      requiresPurchase: true
    });

    expect(state.steps.map((step) => step.status)).toEqual([
      "done",
      "done",
      "done"
    ]);
  });
});
