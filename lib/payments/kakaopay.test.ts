import { getCheckoutPrice } from "@/lib/payments/kakaopay";

describe("kakaopay helpers", () => {
  it("returns the fixed invitation price", () => {
    expect(getCheckoutPrice()).toMatchObject({
      amount: 4900,
      currency: "KRW"
    });
  });
});
