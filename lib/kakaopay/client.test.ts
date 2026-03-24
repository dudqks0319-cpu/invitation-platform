import { requestKakaoPayReady } from "@/lib/kakaopay/client";

describe("kakaopay client", () => {
  it("throws when credentials are missing", async () => {
    await expect(
      requestKakaoPayReady({
        partner_order_id: "order-1",
        partner_user_id: "user-1",
        item_name: "InviteHub Invitation",
        quantity: 1,
        total_amount: 4900,
        tax_free_amount: 0,
        approval_url: "http://localhost/approve",
        cancel_url: "http://localhost/cancel",
        fail_url: "http://localhost/fail"
      })
    ).rejects.toThrow();
  });
});
