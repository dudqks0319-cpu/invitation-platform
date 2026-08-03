import { vi } from "vitest";

const {
  beginAccountDeletionMock,
  consumeRateLimitsMock,
  createClientMock,
  createSupabaseAdminClientMock,
  getClaimsMock,
  getClientIdentifierMock,
  processAccountDeletionJobMock,
  removeAllUserStorageObjectsMock
} = vi.hoisted(() => ({
  beginAccountDeletionMock: vi.fn(),
  consumeRateLimitsMock: vi.fn(),
  createClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  getClaimsMock: vi.fn(),
  getClientIdentifierMock: vi.fn(),
  processAccountDeletionJobMock: vi.fn(),
  removeAllUserStorageObjectsMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

vi.mock("@/lib/invitation-upload-security", () => ({
  removeAllUserStorageObjects: removeAllUserStorageObjectsMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimits: consumeRateLimitsMock,
  getClientIdentifier: getClientIdentifierMock
}));

vi.mock("@/lib/account-deletion", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/account-deletion")>();
  return {
    ...original,
    beginAccountDeletion: beginAccountDeletionMock,
    processAccountDeletionJob: processAccountDeletionJobMock
  };
});

import { POST, PUT } from "@/app/api/account/delete/route";

const now = Date.parse("2026-08-03T13:00:00.000Z");
const userId = "11111111-1111-4111-8111-111111111111";
const otherUserId = "22222222-2222-4222-8222-222222222222";
const sessionId = "33333333-3333-4333-8333-333333333333";
const jobId = "55555555-5555-4555-8555-555555555555";

function claims(subject = userId, overrides: Record<string, unknown> = {}) {
  return {
    sub: subject,
    session_id: sessionId,
    is_anonymous: false,
    amr: [{ method: "password", timestamp: now / 1000 - 30 }],
    exp: now / 1000 + 3600,
    ...overrides
  };
}

function request(method: "PUT" | "POST", options: {
  ticket?: string;
  requestId?: string;
  origin?: string;
  requestedWith?: string;
  body?: Record<string, unknown>;
} = {}) {
  const headers: Record<string, string> = {
    Authorization: "Bearer access-token",
    "Content-Type": "application/json",
    "X-Requested-With": options.requestedWith ?? "InviteHub-Account-Delete",
    "x-real-ip": "203.0.113.10"
  };
  if (options.origin) headers.Origin = options.origin;
  if (options.ticket) headers["X-Account-Delete-Ticket"] = options.ticket;
  if (options.requestId) headers["Idempotency-Key"] = `account-delete:${options.requestId}`;
  return new Request("https://invitehub.test/api/account/delete", {
    method,
    headers,
    body: JSON.stringify(options.body ?? (method === "PUT"
      ? { confirmation: "REQUEST_ACCOUNT_DELETE" }
      : {
          confirmation: "DELETE_ACCOUNT",
          exportDisposition: "skipped",
          restoreAcknowledged: true
        }))
  });
}

async function issueTicket() {
  const response = await PUT(request("PUT"));
  expect(response.status).toBe(200);
  return response.json() as Promise<{ ticket: string; requestId: string }>;
}

describe("/api/account/delete recent-auth boundary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.NEXT_PUBLIC_SITE_URL = "https://invitehub.test";
    process.env.ACCOUNT_DELETE_TICKET_KEY_V1 = "test-account-delete-ticket-key-32-bytes";
    process.env.ACCOUNT_DELETION_ENABLED = "true";
    getClaimsMock.mockResolvedValue({ data: { claims: claims() }, error: null });
    createClientMock.mockReturnValue({ auth: { getClaims: getClaimsMock } });
    createSupabaseAdminClientMock.mockReturnValue({
      rpc: vi.fn(),
      storage: { from: vi.fn().mockReturnValue({ list: vi.fn(), remove: vi.fn() }) },
      auth: { admin: { deleteUser: vi.fn() } }
    });
    getClientIdentifierMock.mockReturnValue("v1:client-fingerprint");
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 1,
      resetAt: now + 60_000
    });
    beginAccountDeletionMock.mockResolvedValue({
      ok: true,
      requestId: jobId,
      outcome: "inserted",
      status: "pending",
      stage: "storage"
    });
    processAccountDeletionJobMock.mockResolvedValue({ status: "completed" });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.ACCOUNT_DELETE_TICKET_KEY_V1;
    delete process.env.ACCOUNT_DELETION_ENABLED;
  });

  it("issues a server ticket only after recent verified AMR and processes one tombstoned job", async () => {
    const issued = await issueTicket();
    const response = await POST(request("POST", {
      ticket: issued.ticket,
      requestId: issued.requestId,
      origin: "https://invitehub.test"
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, status: "completed" });
    expect(beginAccountDeletionMock).toHaveBeenCalledWith(expect.objectContaining({
      userId,
      ticketIssuedAt: now,
      exportDisposition: "skipped",
      subjectHash: expect.stringMatching(/^v1:[a-f0-9]{64}$/),
      ticketHash: expect.stringMatching(/^v1:[a-f0-9]{64}$/)
    }));
    expect(processAccountDeletionJobMock).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(consumeRateLimitsMock.mock.calls)).not.toContain(userId);
  });

  it("keeps destructive account deletion disabled by default", async () => {
    delete process.env.ACCOUNT_DELETION_ENABLED;
    const response = await PUT(request("PUT"));
    expect(response.status).toBe(503);
    expect(getClaimsMock).not.toHaveBeenCalled();
    expect(beginAccountDeletionMock).not.toHaveBeenCalled();
  });

  it("rejects anonymous, stale, or timestamp-less AMR before ticket issuance", async () => {
    for (const amrClaims of [
      claims(userId, { is_anonymous: true }),
      claims(userId, { amr: [{ method: "password", timestamp: now / 1000 - 301 }] }),
      claims(userId, { amr: ["password"] })
    ]) {
      getClaimsMock.mockResolvedValueOnce({ data: { claims: amrClaims }, error: null });
      const response = await PUT(request("PUT"));
      expect(response.status).toBe(403);
    }
    expect(beginAccountDeletionMock).not.toHaveBeenCalled();
  });

  it("rejects another user's ticket and an expired ticket", async () => {
    const issued = await issueTicket();
    getClaimsMock.mockResolvedValueOnce({ data: { claims: claims(otherUserId) }, error: null });
    const crossUser = await POST(request("POST", {
      ticket: issued.ticket,
      requestId: issued.requestId
    }));
    expect(crossUser.status).toBe(403);

    vi.setSystemTime(now + 301_000);
    getClaimsMock.mockResolvedValueOnce({ data: { claims: claims(userId, {
      amr: [{ method: "password", timestamp: (now + 301_000) / 1000 }],
      exp: (now + 301_000) / 1000 + 3600
    }) }, error: null });
    const stale = await POST(request("POST", {
      ticket: issued.ticket,
      requestId: issued.requestId
    }));
    expect(stale.status).toBe(403);
    expect(beginAccountDeletionMock).not.toHaveBeenCalled();
  });

  it("requires a bearer session, custom CSRF header, same-site origin, and irreversible confirmation", async () => {
    const missingBoundary = await PUT(request("PUT", { requestedWith: "wrong" }));
    expect(missingBoundary.status).toBe(403);
    const crossSite = await PUT(request("PUT", { origin: "https://evil.example" }));
    expect(crossSite.status).toBe(403);
    const malformed = await POST(request("POST", {
      body: { confirmation: "DELETE_ACCOUNT", exportDisposition: "skipped", restoreAcknowledged: false }
    }));
    expect(malformed.status).toBe(400);

    getClaimsMock.mockResolvedValueOnce({ data: null, error: { message: "deleted session" } });
    const alreadyDeleted = await PUT(request("PUT"));
    expect(alreadyDeleted.status).toBe(403);
    expect(beginAccountDeletionMock).not.toHaveBeenCalled();
  });

  it("does not rerun destructive stages for an exact replay or collision", async () => {
    const issued = await issueTicket();
    for (const [outcome, expectedStatus] of [
      ["replayed", 202],
      ["collision", 409]
    ] as const) {
      beginAccountDeletionMock.mockResolvedValueOnce({
        ok: true,
        requestId: jobId,
        outcome,
        status: "pending",
        stage: "storage"
      });
      const response = await POST(request("POST", {
        ticket: issued.ticket,
        requestId: issued.requestId
      }));
      expect(response.status).toBe(expectedStatus);
    }
    expect(processAccountDeletionJobMock).not.toHaveBeenCalled();
  });

  it("resumes a partial-failure outbox once with a fresh ticket and rejects a retry storm", async () => {
    const issued = await issueTicket();
    beginAccountDeletionMock.mockResolvedValue({
      ok: true,
      requestId: jobId,
      outcome: "in_progress",
      status: "retry_wait",
      stage: "storage"
    });
    processAccountDeletionJobMock.mockResolvedValueOnce({ status: "retry_wait", stage: "storage" });

    const resumed = await POST(request("POST", {
      ticket: issued.ticket,
      requestId: issued.requestId
    }));
    expect(resumed.status).toBe(202);
    expect(processAccountDeletionJobMock).toHaveBeenCalledTimes(1);
    expect(consumeRateLimitsMock).toHaveBeenLastCalledWith(expect.objectContaining({
      policies: [expect.objectContaining({
        key: expect.stringMatching(/^account_delete:recovery_ticket:v1:[a-f0-9]{64}$/),
        limit: 1
      })]
    }));

    consumeRateLimitsMock
      .mockResolvedValueOnce({ ok: true, allowed: true, remaining: 1, resetAt: now + 60_000 })
      .mockResolvedValueOnce({ ok: true, allowed: false, remaining: 0, resetAt: now + 60_000 });
    const storm = await POST(request("POST", {
      ticket: issued.ticket,
      requestId: issued.requestId
    }));
    expect(storm.status).toBe(409);
    expect(processAccountDeletionJobMock).toHaveBeenCalledTimes(1);
  });

  it("blocks legal-retention accounts before tombstone and fails closed on DB uncertainty", async () => {
    const issued = await issueTicket();
    beginAccountDeletionMock.mockResolvedValueOnce({
      ok: true,
      requestId: null,
      outcome: "retention_required",
      status: "blocked",
      stage: null
    });
    const retained = await POST(request("POST", {
      ticket: issued.ticket,
      requestId: issued.requestId
    }));
    expect(retained.status).toBe(423);
    expect(processAccountDeletionJobMock).not.toHaveBeenCalled();

    beginAccountDeletionMock.mockResolvedValueOnce({ ok: false });
    const unavailable = await POST(request("POST", {
      ticket: issued.ticket,
      requestId: issued.requestId
    }));
    expect(unavailable.status).toBe(503);
    expect(processAccountDeletionJobMock).not.toHaveBeenCalled();
  });

  it("accepts a tombstoned partial failure without exposing provider details", async () => {
    const issued = await issueTicket();
    processAccountDeletionJobMock.mockResolvedValueOnce({ status: "retry_wait", stage: "storage" });
    const response = await POST(request("POST", {
      ticket: issued.ticket,
      requestId: issued.requestId
    }));
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      success: true,
      status: "pending",
      message: "삭제 요청을 접수했으며 데이터는 다시 공개되지 않습니다. 후속 정리를 진행 중입니다."
    });
  });
});
