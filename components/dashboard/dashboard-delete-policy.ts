import type { InvitationStatus } from "@/lib/invitation-payload";

export function canDeleteInvitation(status: InvitationStatus) {
  return status === "draft" || status === "payment_failed" || status === "refunded";
}

export function getDeletePolicyNote(status: InvitationStatus) {
  if (canDeleteInvitation(status)) {
    return "";
  }

  return "발행되었거나 결제 이력이 있는 초대장은 삭제 대신 환불 또는 상태 변경으로 관리해 주세요.";
}
