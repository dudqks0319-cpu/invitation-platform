import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/types";
import {
  createAccountDeletionTicket,
  processAccountDeletionJob,
  validateRecentAuthClaims,
  verifyAccountDeletionTicket
} from "@/lib/account-deletion";

const userId = "11111111-1111-4111-8111-111111111111";
const otherUserId = "22222222-2222-4222-8222-222222222222";
const sessionId = "33333333-3333-4333-8333-333333333333";
const now = Date.parse("2026-08-03T13:00:00.000Z");

function recentClaims(overrides: Record<string, unknown> = {}) {
  return {
    sub: userId,
    session_id: sessionId,
    is_anonymous: false,
    amr: [{ method: "password", timestamp: now / 1000 - 30 }],
    exp: now / 1000 + 3600,
    ...overrides
  };
}

describe("account deletion recent-auth ticket", () => {
  beforeEach(() => {
    process.env.ACCOUNT_DELETE_TICKET_KEY_V1 = "test-account-delete-ticket-key-32-bytes";
  });

  afterEach(() => {
    delete process.env.ACCOUNT_DELETE_TICKET_KEY_V1;
  });

  it("accepts only a verified full-account AMR with a recent timestamp", () => {
    expect(validateRecentAuthClaims(recentClaims(), now)).toEqual({
      userId,
      sessionId
    });
    expect(validateRecentAuthClaims(recentClaims({ is_anonymous: true }), now)).toBeNull();
    expect(validateRecentAuthClaims(recentClaims({ amr: ["password"] }), now)).toBeNull();
    expect(validateRecentAuthClaims(recentClaims({
      amr: [{ method: "password", timestamp: now / 1000 - 301 }]
    }), now)).toBeNull();
    expect(validateRecentAuthClaims(recentClaims({
      amr: [{ method: "anonymous", timestamp: now / 1000 }]
    }), now)).toBeNull();
  });

  it("binds a short-lived ticket to one user, session, and request id", () => {
    const issued = createAccountDeletionTicket({
      claims: recentClaims(),
      now,
      ticketId: "44444444-4444-4444-8444-444444444444"
    });

    expect(issued?.requestId).toBe("44444444-4444-4444-8444-444444444444");
    expect(issued?.ticket).not.toContain(userId);
    expect(verifyAccountDeletionTicket({
      ticket: issued!.ticket,
      userId,
      sessionId,
      now: now + 60_000
    })?.requestId).toBe(issued?.requestId);
    expect(verifyAccountDeletionTicket({
      ticket: issued!.ticket,
      userId: otherUserId,
      sessionId,
      now: now + 60_000
    })).toBeNull();
    expect(verifyAccountDeletionTicket({
      ticket: issued!.ticket,
      userId,
      sessionId: otherUserId,
      now: now + 60_000
    })).toBeNull();
    expect(verifyAccountDeletionTicket({
      ticket: issued!.ticket,
      userId,
      sessionId,
      now: now + 301_000
    })).toBeNull();
  });

  it("fails closed without a valid server ticket key", () => {
    delete process.env.ACCOUNT_DELETE_TICKET_KEY_V1;
    expect(createAccountDeletionTicket({ claims: recentClaims(), now })).toBeNull();
  });
});

describe("account deletion staged worker", () => {
  beforeEach(() => {
    process.env.ACCOUNT_DELETE_TICKET_KEY_V1 = "test-account-delete-ticket-key-32-bytes";
  });

  afterEach(() => {
    delete process.env.ACCOUNT_DELETE_TICKET_KEY_V1;
  });

  function createWorker(stageSequence: string[]) {
    let stageIndex = 0;
    const calls: string[] = [];
    const rpc = vi.fn<(name: string) => Promise<{ data: unknown; error: unknown }>>((name: string) => {
      if (name === "claim_account_deletion") {
        const stage = stageSequence[stageIndex];
        return Promise.resolve({
          data: stage ? [{ claimed: true, stage, attempt_count: stageIndex + 1 }] : [],
          error: null
        });
      }
      if (name === "advance_account_deletion") {
        stageIndex += 1;
        calls.push(`advance:${stageSequence[stageIndex - 1]}`);
        return Promise.resolve({ data: [{ advanced: true }], error: null });
      }
      if (name === "fail_account_deletion") {
        calls.push("failed");
        return Promise.resolve({ data: [{ recorded: true, blocked: false }], error: null });
      }
      throw new Error(`unexpected rpc ${name}`);
    });
    const deleteUser = vi.fn<() => Promise<{
      data: { user: null };
      error: null | { code: string; message: string };
    }>>(async () => {
      calls.push("auth");
      return { data: { user: null }, error: null };
    });
    const admin = {
      rpc,
      auth: { admin: { deleteUser } }
    } as unknown as SupabaseClient<Database>;
    return { admin, calls, deleteUser, rpc };
  }

  it("orders storage, bounded provider cleanup, Auth deletion, and redacted finalize", async () => {
    const worker = createWorker(["storage", "provider", "auth", "finalize"]);
    const removeStorage = vi.fn(async () => {
      worker.calls.push("storage");
      return 2;
    });
    const cleanupProviders = vi.fn(async () => {
      worker.calls.push("provider");
    });

    await expect(processAccountDeletionJob({
      admin: worker.admin,
      requestId: "55555555-5555-4555-8555-555555555555",
      userId,
      removeStorage,
      cleanupProviders,
      timeoutMs: 50
    })).resolves.toEqual({ status: "completed" });
    expect(worker.calls).toEqual([
      "storage", "advance:storage",
      "provider", "advance:provider",
      "auth", "advance:auth",
      "advance:finalize"
    ]);
    expect(worker.deleteUser).toHaveBeenCalledWith(userId, false);
  });

  it("treats an already-deleted Auth identity as idempotent success", async () => {
    const worker = createWorker(["auth", "finalize"]);
    worker.deleteUser.mockResolvedValueOnce({
      data: { user: null },
      error: { code: "user_not_found", message: "not found" }
    });

    await expect(processAccountDeletionJob({
      admin: worker.admin,
      requestId: "55555555-5555-4555-8555-555555555555",
      userId,
      removeStorage: vi.fn(),
      timeoutMs: 50
    })).resolves.toEqual({ status: "completed" });
    expect(worker.deleteUser).toHaveBeenCalledTimes(1);
  });

  it("records a storage partial failure without deleting Auth or retrying", async () => {
    const worker = createWorker(["storage"]);
    const removeStorage = vi.fn(async () => {
      throw new Error("partial storage failure with raw provider detail");
    });

    await expect(processAccountDeletionJob({
      admin: worker.admin,
      requestId: "55555555-5555-4555-8555-555555555555",
      userId,
      removeStorage,
      timeoutMs: 50
    })).resolves.toEqual({ status: "retry_wait", stage: "storage" });
    expect(removeStorage).toHaveBeenCalledTimes(1);
    expect(worker.deleteUser).not.toHaveBeenCalled();
    expect(worker.rpc).toHaveBeenCalledWith("fail_account_deletion", expect.objectContaining({
      p_error_code: "storage_unavailable"
    }));
    expect(JSON.stringify(worker.rpc.mock.calls)).not.toContain("raw provider detail");
  });

  it("fails closed on a DB claim timeout without destructive work or retry", async () => {
    const worker = createWorker([]);
    worker.rpc.mockImplementationOnce(() => new Promise(() => undefined));
    const removeStorage = vi.fn();

    await expect(processAccountDeletionJob({
      admin: worker.admin,
      requestId: "55555555-5555-4555-8555-555555555555",
      userId,
      removeStorage,
      timeoutMs: 5
    })).resolves.toEqual({ status: "dependency_unavailable" });
    expect(worker.rpc).toHaveBeenCalledTimes(1);
    expect(removeStorage).not.toHaveBeenCalled();
    expect(worker.deleteUser).not.toHaveBeenCalled();
  });

  it("does no destructive work when another worker holds the lease or retry is not due", async () => {
    const worker = createWorker([]);
    const removeStorage = vi.fn();

    await expect(processAccountDeletionJob({
      admin: worker.admin,
      requestId: "55555555-5555-4555-8555-555555555555",
      userId,
      removeStorage,
      timeoutMs: 50
    })).resolves.toEqual({ status: "dependency_unavailable" });
    expect(worker.rpc).toHaveBeenCalledTimes(1);
    expect(removeStorage).not.toHaveBeenCalled();
    expect(worker.deleteUser).not.toHaveBeenCalled();
  });

  it("does not retry an Auth failure in the same execution", async () => {
    const worker = createWorker(["auth"]);
    worker.deleteUser.mockResolvedValueOnce({
      data: { user: null },
      error: { code: "provider_failure", message: "sensitive provider detail" }
    });

    await expect(processAccountDeletionJob({
      admin: worker.admin,
      requestId: "55555555-5555-4555-8555-555555555555",
      userId,
      removeStorage: vi.fn(),
      timeoutMs: 50
    })).resolves.toEqual({ status: "retry_wait", stage: "auth" });
    expect(worker.deleteUser).toHaveBeenCalledTimes(1);
    expect(worker.rpc).toHaveBeenCalledWith("fail_account_deletion", expect.objectContaining({
      p_error_code: "auth_unavailable"
    }));
    expect(JSON.stringify(worker.rpc.mock.calls)).not.toContain("sensitive provider detail");
  });
});
