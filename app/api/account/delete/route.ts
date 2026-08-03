import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  beginAccountDeletion,
  createAccountDeletionTicket,
  hashAccountDeletionValue,
  isAllowedAccountDeletionOrigin,
  processAccountDeletionJob,
  validateRecentAuthClaims,
  verifyAccountDeletionTicket,
  withAccountDeletionTimeout
} from "@/lib/account-deletion";
import { INVITATION_ASSET_BUCKET } from "@/lib/invitation-assets";
import { removeAllUserStorageObjects } from "@/lib/invitation-upload-security";
import { consumeRateLimits, getClientIdentifier } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ensureJsonRequest,
  getBearerToken,
  getIdempotencyKey,
  readJsonBody
} from "@/lib/supabase/public-write";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const AUTH_TIMEOUT_MS = 1500;
const DELETE_REQUEST_HEADER = "InviteHub-Account-Delete";

type VerifiedDeletionAuth = {
  claims: Record<string, unknown>;
  userId: string;
  sessionId: string;
};

function securityUnavailable() {
  return NextResponse.json(
    { success: false, message: "계정 삭제 보호 서비스를 일시적으로 사용할 수 없습니다." },
    { status: 503 }
  );
}

function validateRequestBoundary(request: Request) {
  return request.headers.get("x-requested-with") === DELETE_REQUEST_HEADER &&
    isAllowedAccountDeletionOrigin(request);
}

async function authenticate(request: Request): Promise<VerifiedDeletionAuth | null> {
  const token = getBearerToken(request);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  try {
    const { data, error } = await withAccountDeletionTimeout(
      authClient.auth.getClaims(token),
      AUTH_TIMEOUT_MS
    );
    if (error || !data?.claims) return null;
    const claims = data.claims as Record<string, unknown>;
    const identity = validateRecentAuthClaims(claims);
    return identity ? { claims, ...identity } : null;
  } catch {
    return null;
  }
}

async function requestContext(request: Request) {
  if (!validateRequestBoundary(request)) return null;
  const auth = await authenticate(request);
  const admin = createSupabaseAdminClient();
  const clientIdentifier = getClientIdentifier(request);
  if (!auth || !admin || !clientIdentifier) return null;
  const subjectHash = hashAccountDeletionValue("subject", auth.userId);
  if (!subjectHash) return null;
  return { admin, auth, clientIdentifier, subjectHash };
}

export async function PUT(request: Request) {
  if (process.env.ACCOUNT_DELETION_ENABLED !== "true") return securityUnavailable();
  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }
  const body = await readJsonBody(request, 2 * 1024);
  if (!body.ok || !body.body || typeof body.body !== "object" ||
    (body.body as { confirmation?: unknown }).confirmation !== "REQUEST_ACCOUNT_DELETE") {
    return NextResponse.json({ success: false, message: "재인증 요청값이 올바르지 않습니다." }, { status: 400 });
  }

  const context = await requestContext(request);
  if (!context) {
    return NextResponse.json(
      { success: false, message: "최근 로그인이 필요합니다. 다시 로그인한 뒤 시도해 주세요." },
      { status: 403 }
    );
  }
  const quota = await consumeRateLimits({
    admin: context.admin,
    timeoutMs: AUTH_TIMEOUT_MS,
    policies: [
      { key: `account_delete_ticket:user:${context.subjectHash}:burst`, limit: 1, windowMs: MINUTE_MS },
      { key: `account_delete_ticket:user:${context.subjectHash}:rolling`, limit: 3, windowMs: HOUR_MS },
      { key: `account_delete_ticket:client:${context.clientIdentifier}:daily`, limit: 5, windowMs: DAY_MS },
      { key: "account_delete_ticket:global:daily", limit: 100, windowMs: DAY_MS }
    ]
  });
  if (!quota.ok) return securityUnavailable();
  if (!quota.allowed) {
    return NextResponse.json(
      { success: false, message: "재인증 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  const issued = createAccountDeletionTicket({ claims: context.auth.claims });
  if (!issued) return securityUnavailable();
  return NextResponse.json({ success: true, ...issued });
}

export async function POST(request: Request) {
  if (process.env.ACCOUNT_DELETION_ENABLED !== "true") return securityUnavailable();
  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }
  const bodyResult = await readJsonBody(request, 4 * 1024);
  const body = bodyResult.ok && bodyResult.body && typeof bodyResult.body === "object"
    ? bodyResult.body as {
        confirmation?: unknown;
        exportDisposition?: unknown;
        restoreAcknowledged?: unknown;
      }
    : null;
  if (
    body?.confirmation !== "DELETE_ACCOUNT" ||
    !["downloaded", "skipped"].includes(String(body.exportDisposition)) ||
    body.restoreAcknowledged !== true
  ) {
    return NextResponse.json(
      { success: false, message: "삭제·내보내기·복구 불가 확인값이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const context = await requestContext(request);
  if (!context) {
    return NextResponse.json(
      { success: false, message: "최근 로그인 세션을 확인할 수 없습니다." },
      { status: 403 }
    );
  }
  const ticket = request.headers.get("x-account-delete-ticket") ?? "";
  const verifiedTicket = verifyAccountDeletionTicket({
    ticket,
    userId: context.auth.userId,
    sessionId: context.auth.sessionId
  });
  if (!verifiedTicket) {
    return NextResponse.json(
      { success: false, message: "재인증 티켓이 없거나 만료되었습니다." },
      { status: 403 }
    );
  }
  const idempotencyKey = getIdempotencyKey(request);
  if (idempotencyKey !== `account-delete:${verifiedTicket.requestId}`) {
    return NextResponse.json({ success: false, message: "요청 식별자가 올바르지 않습니다." }, { status: 400 });
  }

  const idempotencyKeyHash = hashAccountDeletionValue("idempotency", idempotencyKey);
  const ticketHash = hashAccountDeletionValue("ticket", ticket);
  const requestHash = hashAccountDeletionValue(
    "request",
    JSON.stringify({
      requestId: verifiedTicket.requestId,
      confirmation: body.confirmation,
      exportDisposition: body.exportDisposition,
      restoreAcknowledged: body.restoreAcknowledged
    })
  );
  if (!idempotencyKeyHash || !ticketHash || !requestHash) return securityUnavailable();

  const quota = await consumeRateLimits({
    admin: context.admin,
    timeoutMs: AUTH_TIMEOUT_MS,
    policies: [
      { key: `account_delete:user:${context.subjectHash}:burst`, limit: 1, windowMs: MINUTE_MS },
      { key: `account_delete:user:${context.subjectHash}:daily`, limit: 3, windowMs: DAY_MS },
      { key: `account_delete:client:${context.clientIdentifier}:daily`, limit: 5, windowMs: DAY_MS },
      { key: "account_delete:global:daily", limit: 100, windowMs: DAY_MS }
    ]
  });
  if (!quota.ok) return securityUnavailable();
  if (!quota.allowed) {
    return NextResponse.json(
      { success: false, message: "계정 삭제 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  const started = await beginAccountDeletion({
    admin: context.admin,
    userId: context.auth.userId,
    subjectHash: context.subjectHash,
    idempotencyKeyHash,
    ticketHash,
    requestHash,
    exportDisposition: body.exportDisposition as "downloaded" | "skipped",
    ticketIssuedAt: verifiedTicket.issuedAt,
    timeoutMs: AUTH_TIMEOUT_MS
  });
  if (!started.ok) return securityUnavailable();
  if (started.outcome === "collision") {
    return NextResponse.json(
      { success: false, message: "재인증 티켓 또는 요청 식별자가 이미 다른 요청에 사용되었습니다." },
      { status: 409 }
    );
  }
  if (started.outcome === "retention_required") {
    return NextResponse.json(
      { success: false, message: "법적 보존 검토가 필요한 기록이 있어 자동 삭제를 시작하지 않았습니다." },
      { status: 423 }
    );
  }
  if (started.outcome === "replayed" || !started.requestId) {
    return NextResponse.json(
      { success: true, status: "pending", message: "기존 계정 삭제 요청을 처리 중입니다." },
      { status: 202 }
    );
  }

  if (started.outcome === "in_progress") {
    // A fresh recent-auth ticket may resume an existing durable outbox job.
    // The ticket-specific durable bucket makes that recovery authorization
    // one-shot; the database lease and next_retry_at still decide whether a
    // cleanup stage may actually run.
    const recoveryTicketQuota = await consumeRateLimits({
      admin: context.admin,
      timeoutMs: AUTH_TIMEOUT_MS,
      policies: [
        { key: `account_delete:recovery_ticket:${ticketHash}`, limit: 1, windowMs: 10 * MINUTE_MS }
      ]
    });
    if (!recoveryTicketQuota.ok) return securityUnavailable();
    if (!recoveryTicketQuota.allowed) {
      return NextResponse.json(
        { success: false, message: "이 재인증 티켓은 이미 사용되었습니다. 다시 로그인해 주세요." },
        { status: 409 }
      );
    }
  }

  const result = await processAccountDeletionJob({
    admin: context.admin,
    requestId: started.requestId,
    userId: context.auth.userId,
    removeStorage: () => removeAllUserStorageObjects(
      context.admin.storage.from(INVITATION_ASSET_BUCKET),
      context.auth.userId
    ),
    // Current providers have transaction verification but no remote account
    // resource. This explicit no-op stage preserves ordering for a future adapter.
    cleanupProviders: async () => undefined,
    timeoutMs: AUTH_TIMEOUT_MS
  });

  if (result.status === "completed") {
    return NextResponse.json({ success: true, status: "completed" });
  }
  return NextResponse.json(
    {
      success: true,
      status: result.status === "blocked" ? "blocked" : "pending",
      message: "삭제 요청을 접수했으며 데이터는 다시 공개되지 않습니다. 후속 정리를 진행 중입니다."
    },
    { status: 202 }
  );
}
