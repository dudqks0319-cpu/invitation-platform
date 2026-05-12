import { vi } from "vitest";

const validPublishPayload = {
  title: "민준 수아 결혼식 초대장",
  eventDateTime: "2026-05-10T14:00",
  venueName: "더파인 웨딩홀",
  venueAddress: "서울 강남구 논현로 456",
  groomName: "민준",
  brideName: "수아"
};

const { createServerSupabaseClientMock, createSupabaseAdminClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/payments/publish-recovery/route";

function request(body: unknown) {
  return new Request("https://invitehub.test/api/payments/publish-recovery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

function createAdminMock({
  invitation,
  payment = { id: "payment-1" },
  updateError = null
}: {
  invitation: Record<string, unknown> | null;
  payment?: Record<string, unknown> | null;
  updateError?: { message: string } | null;
}) {
  const updates: Array<Record<string, unknown>> = [];

  return {
    updates,
    from(table: string) {
      if (table === "invitations") {
        return {
          select() {
            return this;
          },
          update(payload: Record<string, unknown>) {
            updates.push(payload);
            return {
              eq() {
                return Promise.resolve({ error: updateError });
              }
            };
          },
          eq() {
            return this;
          },
          maybeSingle() {
            return Promise.resolve({ data: invitation, error: null });
          }
        };
      }

      if (table === "payments") {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          order() {
            return this;
          },
          maybeSingle() {
            return Promise.resolve({ data: payment, error: null });
          }
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }
  };
}

describe("POST /api/payments/publish-recovery", () => {
  beforeEach(() => {
    createSupabaseAdminClientMock.mockReset();
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        async getUser() {
          return { data: { user: { id: "user-1" } } };
        }
      }
    });
  });

  it("publishes a paid invitation without recharging when readiness passes", async () => {
    const admin = createAdminMock({
      invitation: {
        id: "inv-1",
        user_id: "user-1",
        slug: "paid-invite",
        status: "paid",
        payload: {
          ...validPublishPayload,
          mainImagePath: "main/photo.jpg",
          mainImageUrl: "https://storage.example/main/photo.jpg"
        }
      }
    });
    createSupabaseAdminClientMock.mockReturnValue(admin);

    const response = await POST(request({ invitationId: "inv-1" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      slug: "paid-invite",
      recovered: true
    });
    expect(admin.updates[0]).toMatchObject({
      status: "published",
      repurchase_required: false,
      paid_payload_snapshot: expect.objectContaining(validPublishPayload),
      payload: expect.objectContaining({
        mainImageUrl: "/api/public/assets?slug=paid-invite&path=main%2Fphoto.jpg"
      })
    });
  });

  it("blocks recovery when paid payment exists but required fields are still missing", async () => {
    const admin = createAdminMock({
      invitation: {
        id: "inv-1",
        user_id: "user-1",
        slug: "paid-invite",
        status: "paid",
        payload: {
          ...validPublishPayload,
          groomName: ""
        }
      }
    });
    createSupabaseAdminClientMock.mockReturnValue(admin);

    const response = await POST(request({ invitationId: "inv-1" }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload).toMatchObject({
      success: false,
      paymentConfirmed: true,
      publishBlocked: true
    });
    expect(payload.message).toContain("신랑 이름");
    expect(admin.updates).toHaveLength(0);
  });
});
