export type PreviewFlowStepStatus = "current" | "done" | "upcoming" | "skipped";

export function getPreviewFlowState(options: {
  isPublished: boolean;
  purchaseUnavailable?: boolean;
  requiresPurchase: boolean;
}) {
  const { isPublished, purchaseUnavailable = false, requiresPurchase } = options;

  if (isPublished) {
    return {
      note: requiresPurchase
        ? "미리보기 확인과 구성 검토가 끝나서 초대장이 공개된 상태입니다."
        : "무료 발행이 완료되어 초대장이 공개된 상태입니다.",
      steps: [
        { label: "미리보기", status: "done" as const },
        { label: "구성 확인", status: requiresPurchase ? ("done" as const) : ("skipped" as const) },
        { label: "발행 완료", status: "done" as const }
      ]
    };
  }

  if (purchaseUnavailable) {
    return {
      note: "현재 제출 버전에서는 무료 발행 범위에 포함된 기능만 제공합니다. 구성을 확인하면 무료 발행으로 진행할 수 있습니다.",
      steps: [
        { label: "미리보기", status: "done" as const },
        { label: "구성 확인", status: "current" as const },
        { label: "무료 발행", status: "upcoming" as const }
      ]
    };
  }

  if (requiresPurchase) {
    return {
      note: "지금은 구성 확인 단계입니다. 미리보기를 확인한 뒤 발행을 진행하면 공개 링크가 생성됩니다.",
      steps: [
        { label: "미리보기", status: "done" as const },
        { label: "구성 확인", status: "current" as const },
        { label: "발행 완료", status: "upcoming" as const }
      ]
    };
  }

  return {
    note: "현재 구성은 무료입니다. 바로 발행 완료로 이동할 수 있습니다.",
    steps: [
      { label: "미리보기", status: "done" as const },
      { label: "구성 확인", status: "skipped" as const },
      { label: "발행 완료", status: "current" as const }
    ]
  };
}
