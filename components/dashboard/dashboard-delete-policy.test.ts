import {
  canDeleteInvitation,
  getDeletePolicyNote
} from "@/components/dashboard/dashboard-delete-policy";

describe("dashboard invitation deletion policy", () => {
  it("allows deleting only safe invitation states", () => {
    expect(canDeleteInvitation("draft")).toBe(true);
    expect(canDeleteInvitation("payment_failed")).toBe(true);
    expect(canDeleteInvitation("refunded")).toBe(true);
    expect(canDeleteInvitation("published")).toBe(false);
    expect(canDeleteInvitation("paid")).toBe(false);
    expect(canDeleteInvitation("payment_pending")).toBe(false);
    expect(canDeleteInvitation("refund_pending")).toBe(false);
  });

  it("explains why published or operated invitations are not deletable", () => {
    expect(getDeletePolicyNote("published")).toContain("발행");
    expect(getDeletePolicyNote("paid")).toContain("상태 변경");
    expect(getDeletePolicyNote("draft")).toBe("");
  });
});
