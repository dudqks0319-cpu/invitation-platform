import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/types";

const { consumeRateLimitsMock } = vi.hoisted(() => ({
  consumeRateLimitsMock: vi.fn()
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...original,
    consumeRateLimits: consumeRateLimitsMock
  };
});

import {
  ViewLogConcurrencyGate,
  recordInvitationView,
  resolveViewLogIdentity
} from "@/lib/view-log";

const invitationId = "11111111-1111-4111-8111-111111111111";
const issuedAt = Date.parse("2026-08-03T12:00:00.000Z");

function request(ip = "203.0.113.10") {
  return new Request("https://invitehub.test/invitations/demo", {
    headers: { "x-real-ip": ip }
  });
}

function createAdmin(outcome = "inserted") {
  const rpc = vi.fn(async () => ({
    data: [{ outcome }],
    error: null
  }));
  return {
    rpc,
    client: { rpc } as unknown as SupabaseClient<Database>
  };
}

describe("view log security boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RATE_LIMIT_FINGERPRINT_KEY_V1 = "test-rate-limit-fingerprint-key-32";
    process.env.VIEW_LOGGING_ENABLED = "true";
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 2,
      resetAt: issuedAt + 60_000
    });
  });

  afterEach(() => {
    delete process.env.RATE_LIMIT_FINGERPRINT_KEY_V1;
    delete process.env.VIEW_LOGGING_ENABLED;
  });

  it("distinguishes authenticated, signed anonymous, and IP identities without raw identifiers", () => {
    const authenticated = resolveViewLogIdentity(request(), {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      is_anonymous: false
    });
    const anonymous = resolveViewLogIdentity(request(), {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      is_anonymous: true
    });
    const ip = resolveViewLogIdentity(request());

    expect(authenticated?.kind).toBe("authenticated");
    expect(anonymous?.kind).toBe("anonymous_session");
    expect(ip?.kind).toBe("ip");
    for (const identity of [authenticated, anonymous, ip]) {
      expect(identity?.key).toMatch(/^v1:[a-f0-9]{64}$/);
      expect(identity?.key).not.toContain("203.0.113.10");
      expect(identity?.key).not.toContain("aaaaaaaa");
      expect(identity?.key).not.toContain("bbbbbbbb");
    }
  });

  it("fails closed when no keyed privacy-safe identity can be derived", () => {
    delete process.env.RATE_LIMIT_FINGERPRINT_KEY_V1;
    expect(resolveViewLogIdentity(request())).toBeNull();
    expect(resolveViewLogIdentity(request("not-an-ip"))).toBeNull();
  });

  it("keeps the server-side kill switch fail-closed", async () => {
    delete process.env.VIEW_LOGGING_ENABLED;
    const admin = createAdmin();

    await expect(recordInvitationView({
      admin: admin.client,
      invitationId,
      identity: resolveViewLogIdentity(request())!,
      issuedAt,
      now: issuedAt
    })).resolves.toBe("disabled");
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("applies identity burst/rolling/daily plus invitation and global daily ceilings", async () => {
    const admin = createAdmin();
    const identity = resolveViewLogIdentity(request())!;

    await recordInvitationView({
      admin: admin.client,
      invitationId,
      identity,
      issuedAt,
      now: issuedAt
    });

    const policies = consumeRateLimitsMock.mock.calls[0][0].policies;
    expect(policies.map((policy: { key: string }) => policy.key)).toEqual([
      `view_log:identity:${identity.key}:burst`,
      `view_log:identity:${identity.key}:rolling`,
      `view_log:identity:${identity.key}:daily`,
      `view_log:invitation:${invitationId}:daily`,
      "view_log:global:daily"
    ]);
    expect(policies.map((policy: { limit: number }) => policy.limit)).toEqual([
      3, 30, 100, 1000, 1000
    ]);
    expect(admin.rpc).toHaveBeenCalledWith("record_invitation_view", expect.objectContaining({
      p_identity_kind: "ip",
      p_visitor_key: identity.key,
      p_idempotency_key_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_request_hash: expect.stringMatching(/^[a-f0-9]{64}$/)
    }));
    expect(JSON.stringify(admin.rpc.mock.calls)).not.toContain("203.0.113.10");
  });

  it.each(["burst", "rolling", "daily", "global budget"])(
    "does not write when the %s quota is exhausted",
    async () => {
      consumeRateLimitsMock.mockResolvedValue({
        ok: true,
        allowed: false,
        remaining: 0,
        resetAt: issuedAt + 60_000
      });
      const admin = createAdmin();

      await expect(recordInvitationView({
        admin: admin.client,
        invitationId,
        identity: resolveViewLogIdentity(request())!,
        issuedAt,
        now: issuedAt
      })).resolves.toBe("quota_denied");
      expect(admin.rpc).not.toHaveBeenCalled();
    }
  );

  it("keeps invitation/global ceilings stable when an attacker rotates identifiers", async () => {
    const first = resolveViewLogIdentity(request("203.0.113.10"))!;
    const second = resolveViewLogIdentity(request("198.51.100.12"))!;
    const admin = createAdmin();

    await recordInvitationView({ admin: admin.client, invitationId, identity: first, issuedAt, now: issuedAt });
    await recordInvitationView({ admin: admin.client, invitationId, identity: second, issuedAt, now: issuedAt });

    const [firstPolicies, secondPolicies] = consumeRateLimitsMock.mock.calls.map(
      ([input]) => input.policies.map((policy: { key: string }) => policy.key)
    );
    expect(firstPolicies[0]).not.toBe(secondPolicies[0]);
    expect(firstPolicies.slice(-2)).toEqual(secondPolicies.slice(-2));
  });

  it("rejects stale or future server tickets before quota/database work", async () => {
    const admin = createAdmin();
    const identity = resolveViewLogIdentity(request())!;

    await expect(recordInvitationView({
      admin: admin.client,
      invitationId,
      identity,
      issuedAt: issuedAt - 61_000,
      now: issuedAt
    })).resolves.toBe("stale");
    await expect(recordInvitationView({
      admin: admin.client,
      invitationId,
      identity,
      issuedAt: issuedAt + 6_000,
      now: issuedAt
    })).resolves.toBe("stale");
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("rejects malformed or batch-shaped input before quota/database work", async () => {
    const admin = createAdmin();

    await expect(recordInvitationView({
      admin: admin.client,
      invitationId: [invitationId] as unknown as string,
      identity: resolveViewLogIdentity(request())!,
      issuedAt,
      now: issuedAt
    })).resolves.toBe("invalid");
    await expect(recordInvitationView({
      admin: admin.client,
      invitationId: "x".repeat(10_000),
      identity: resolveViewLogIdentity(request())!,
      issuedAt,
      now: issuedAt
    })).resolves.toBe("invalid");
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("rejects concurrency overflow without starting another quota or database operation", async () => {
    const gate = new ViewLogConcurrencyGate(1);
    let releaseQuota!: () => void;
    consumeRateLimitsMock.mockImplementationOnce(() => new Promise((resolve) => {
      releaseQuota = () => resolve({ ok: true, allowed: true, remaining: 1, resetAt: issuedAt + 60_000 });
    }));
    const admin = createAdmin();
    const identity = resolveViewLogIdentity(request())!;
    const first = recordInvitationView({ admin: admin.client, invitationId, identity, issuedAt, now: issuedAt, gate });
    await Promise.resolve();

    await expect(recordInvitationView({ admin: admin.client, invitationId, identity, issuedAt, now: issuedAt, gate }))
      .resolves.toBe("concurrency_limited");
    expect(consumeRateLimitsMock).toHaveBeenCalledTimes(1);
    releaseQuota();
    await first;
  });

  it("does not retry dependency failures or timeouts", async () => {
    const admin = createAdmin();
    consumeRateLimitsMock.mockResolvedValueOnce({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });

    await expect(recordInvitationView({
      admin: admin.client,
      invitationId,
      identity: resolveViewLogIdentity(request())!,
      issuedAt,
      now: issuedAt,
      timeoutMs: 5
    })).resolves.toBe("dependency_unavailable");
    expect(consumeRateLimitsMock).toHaveBeenCalledTimes(1);
    expect(admin.rpc).not.toHaveBeenCalled();

    consumeRateLimitsMock.mockResolvedValue({ ok: true, allowed: true, remaining: 1, resetAt: issuedAt + 60_000 });
    admin.rpc.mockImplementationOnce(() => new Promise(() => undefined));
    await expect(recordInvitationView({
      admin: admin.client,
      invitationId,
      identity: resolveViewLogIdentity(request())!,
      issuedAt,
      now: issuedAt,
      timeoutMs: 5
    })).resolves.toBe("dependency_unavailable");
    expect(admin.rpc).toHaveBeenCalledTimes(1);
  });

  it("surfaces replay and idempotency collision outcomes without retrying", async () => {
    const identity = resolveViewLogIdentity(request())!;
    for (const outcome of ["replayed", "collision"] as const) {
      const admin = createAdmin(outcome);
      await expect(recordInvitationView({
        admin: admin.client,
        invitationId,
        identity,
        issuedAt,
        now: issuedAt
      })).resolves.toBe(outcome);
      expect(admin.rpc).toHaveBeenCalledTimes(1);
    }
  });
});
