import { vi } from "vitest";

const {
  createServerSupabaseClientMock,
  createSupabaseAdminClientMock
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { PATCH } from "@/app/api/dashboard/reports/[id]/route";

type UpdatePayload = {
  status?: string;
  admin_note?: string | null;
  resolved_at?: string;
};

type EventPayload = {
  target_type: string;
  target_id: string;
  action: string;
  reason: string | null;
  actor_id: string;
};

function createRequest(body: object) {
  return new Request("https://invitehub.test/api/dashboard/reports/report-1", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function createServerClient(userId = "user-1") {
  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: userId ? { id: userId } : null
        }
      }))
    }
  };
}

function createAdminDouble(options?: {
  reportInvitationId?: string | null;
  invitationFound?: boolean;
  updateError?: { message: string } | null;
  eventError?: { message: string } | null;
}) {
  let updatePayload: UpdatePayload | null = null;
  const updatePayloads: UpdatePayload[] = [];
  let eventPayload: EventPayload | null = null;
  const reportInvitationId = options?.reportInvitationId === undefined ? "invitation-1" : options.reportInvitationId;

  return {
    get updatePayload() {
      return updatePayload;
    },
    get updatePayloads() {
      return updatePayloads;
    },
    get eventPayload() {
      return eventPayload;
    },
    client: {
      from(table: string) {
        if (table === "content_reports") {
          return {
            select() {
              return {
                eq() {
                  return {
                    async maybeSingle() {
                      return {
                        data: reportInvitationId === null
                          ? null
                          : {
                              id: "report-1",
                              invitation_id: reportInvitationId,
                              status: "pending",
                              admin_note: null,
                              resolved_at: null
                            },
                        error: null
                      };
                    }
                  };
                }
              };
            },
            update(payload: UpdatePayload) {
              updatePayload = payload;
              updatePayloads.push(payload);
              return {
                eq() {
                  return {
                    select() {
                      return {
                        async single() {
                          if (options?.updateError) {
                            return {
                              data: null,
                              error: options.updateError
                            };
                          }

                          return {
                            data: {
                              id: "report-1",
                              status: payload.status,
                              resolved_at: payload.resolved_at
                            },
                            error: null
                          };
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        }

        if (table === "invitations") {
          const filters: Record<string, string> = {};
          return {
            select() {
              return this;
            },
            eq(column: string, value: string) {
              filters[column] = value;
              return this;
            },
            async maybeSingle() {
              if (options?.invitationFound === false || filters.id !== "invitation-1" || filters.user_id !== "user-1") {
                return {
                  data: null,
                  error: null
                };
              }

              return {
                data: {
                  id: "invitation-1"
                },
                error: null
              };
            }
          };
        }

        if (table === "moderation_events") {
          return {
            async insert(payload: EventPayload) {
              eventPayload = payload;
              return {
                error: options?.eventError ?? null
              };
            }
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("PATCH /api/dashboard/reports/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerSupabaseClientMock.mockResolvedValue(createServerClient());
  });

  it("updates owned reports and records a moderation event", async () => {
    const adminDouble = createAdminDouble();
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await PATCH(createRequest({
      status: "resolved",
      adminNote: "개인정보 노출 여부를 확인했습니다."
    }), {
      params: Promise.resolve({ id: "report-1" })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(adminDouble.updatePayload).toMatchObject({
      status: "resolved",
      admin_note: "개인정보 노출 여부를 확인했습니다."
    });
    expect(adminDouble.eventPayload).toMatchObject({
      target_type: "report",
      target_id: "report-1",
      action: "resolve",
      reason: "개인정보 노출 여부를 확인했습니다.",
      actor_id: "user-1"
    });
  });

  it("requires a logged-in user", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient(""));
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await PATCH(createRequest({ status: "resolved" }), {
      params: Promise.resolve({ id: "report-1" })
    });

    expect(response.status).toBe(401);
  });

  it("does not update reports owned by another user", async () => {
    const adminDouble = createAdminDouble({ invitationFound: false });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await PATCH(createRequest({ status: "rejected" }), {
      params: Promise.resolve({ id: "report-1" })
    });

    expect(response.status).toBe(404);
    expect(adminDouble.updatePayload).toBeNull();
    expect(adminDouble.eventPayload).toBeNull();
  });

  it("rolls back the report update when moderation event recording fails", async () => {
    const adminDouble = createAdminDouble({ eventError: { message: "insert failed" } });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await PATCH(createRequest({ status: "resolved" }), {
      params: Promise.resolve({ id: "report-1" })
    });

    expect(response.status).toBe(500);
    expect(adminDouble.updatePayloads).toHaveLength(2);
    expect(adminDouble.updatePayloads[0]).toMatchObject({
      status: "resolved"
    });
    expect(adminDouble.updatePayloads[1]).toEqual({
      status: "pending",
      admin_note: null,
      resolved_at: null
    });
  });

  it("rejects unsupported report states", async () => {
    const adminDouble = createAdminDouble();
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await PATCH(createRequest({ status: "pending" }), {
      params: Promise.resolve({ id: "report-1" })
    });

    expect(response.status).toBe(400);
    expect(adminDouble.updatePayload).toBeNull();
  });
});
