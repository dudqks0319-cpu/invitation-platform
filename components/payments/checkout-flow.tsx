"use client";

import Link from "next/link";
import { authDestination } from "@/lib/auth";

export function CheckoutFlow({
  initialInvitationId
}: {
  initialInvitationId?: string;
  initialPaymentState?: string;
}) {
  return (
    <div className="ops-card">
      <h1 className="section-title" style={{ textAlign: "left" }}>
        결제 기능 준비 중
      </h1>
      <p className="ops-note" style={{ marginTop: "8px" }}>
        v1.0에서는 결제를 제외하고 초대장 작성과 발행에 집중합니다. 결제 연동은 v1.1에서 다시 추가될 예정입니다.
      </p>
      <div className="header-actions" style={{ marginTop: "20px" }}>
        <Link
          className="btn-primary"
          href={initialInvitationId ? `/builder?invitationId=${initialInvitationId}` : "/builder"}
        >
          빌더로 돌아가기
        </Link>
        <Link className="btn-outline" href={authDestination.dashboard}>
          대시보드로 이동
        </Link>
      </div>
    </div>
  );
}
