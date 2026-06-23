import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { applyGuestbookReportAutoBlock, checkPublicAbuseBlock } from "@/lib/public-abuse";
import type { Database } from "@/lib/supabase/types";

const clientHash = "a".repeat(64);

function createPublicAbuseClient(options?: {
  activeBlocks?: Array<{ id: string; expires_at: string | null }>;
  guestbookClientHash?: string | null;
  reportCount?: number;
  insertError?: { message: string } | null;
}) {
  const insertMock = vi.fn(async (payload: unknown) => {
    void payload;
    return {
      error: options?.insertError ?? null
    };
  });

  const client = {
    from(table: string) {
      if (table === "public_abuse_blocks") {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async insert(payload: unknown) {
            return insertMock(payload);
          },
          then(resolve: (value: { data: Array<{ id: string; expires_at: string | null }>; error: null }) => void) {
            return Promise.resolve(resolve({
              data: options?.activeBlocks ?? [],
              error: null
            }));
          }
        };
      }

      if (table === "guestbook_entries") {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            return {
              data: options?.guestbookClientHash === undefined
                ? {
                    id: "guestbook-1",
                    client_hash: clientHash
                  }
                : options.guestbookClientHash
                  ? {
                      id: "guestbook-1",
                      client_hash: options.guestbookClientHash
                    }
                  : null,
              error: null
            };
          }
        };
      }

      if (table === "content_reports") {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async in() {
            return {
              data: Array.from({ length: options?.reportCount ?? 0 }, (_, index) => ({
                id: `report-${index}`
              })),
              error: null
            };
          }
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }
  };

  return {
    client: client as unknown as SupabaseClient<Database>,
    insertMock
  };
}

describe("public abuse controls", () => {
  it("blocks active client hashes", async () => {
    const { client } = createPublicAbuseClient({
      activeBlocks: [{ id: "block-1", expires_at: null }]
    });

    const result = await checkPublicAbuseBlock({
      admin: client,
      invitationId: "invitation-1",
      clientHash
    });

    expect(result).toEqual({
      ok: true,
      blocked: true
    });
  });

  it("ignores expired blocks", async () => {
    const { client } = createPublicAbuseClient({
      activeBlocks: [{ id: "block-1", expires_at: "2026-01-01T00:00:00.000Z" }]
    });

    const result = await checkPublicAbuseBlock({
      admin: client,
      invitationId: "invitation-1",
      clientHash,
      now: Date.parse("2026-02-01T00:00:00.000Z")
    });

    expect(result).toEqual({
      ok: true,
      blocked: false
    });
  });

  it("creates a block when guestbook reports reach the threshold", async () => {
    const { client, insertMock } = createPublicAbuseClient({
      reportCount: 3
    });

    const result = await applyGuestbookReportAutoBlock({
      admin: client,
      invitationId: "invitation-1",
      targetType: "guestbook",
      targetId: "guestbook-1"
    });

    expect(result).toEqual({
      ok: true,
      blocked: true
    });
    expect(insertMock).toHaveBeenCalledWith({
      invitation_id: "invitation-1",
      client_hash: clientHash,
      target_type: "guestbook",
      target_id: "guestbook-1",
      reason: "report_threshold",
      status: "active"
    });
  });

  it("does not block when the guestbook entry has no client hash", async () => {
    const { client, insertMock } = createPublicAbuseClient({
      guestbookClientHash: null,
      reportCount: 3
    });

    const result = await applyGuestbookReportAutoBlock({
      admin: client,
      invitationId: "invitation-1",
      targetType: "guestbook",
      targetId: "guestbook-1"
    });

    expect(result).toEqual({
      ok: true,
      blocked: false
    });
    expect(insertMock).not.toHaveBeenCalled();
  });
});
