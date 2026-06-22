import { describe, expect, it } from "vitest";
import { getPreviewFlowState } from "./preview-flow";

describe("getPreviewFlowState", () => {
  it("marks configuration review as current for non-free unpublished invitations", () => {
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

  it("skips configuration review for free unpublished invitations", () => {
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

  it("marks configuration review as current when publishing is unavailable", () => {
    const state = getPreviewFlowState({
      isPublished: false,
      purchaseUnavailable: true,
      requiresPurchase: true
    });

    expect(state.steps.map((step) => step.label)).toEqual([
      "미리보기",
      "구성 확인",
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
