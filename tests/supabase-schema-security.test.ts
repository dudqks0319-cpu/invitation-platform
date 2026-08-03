import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const schema = readFileSync(resolve(root, "supabase/schema.sql"), "utf8");
const migrationPath = resolve(
  root,
  "supabase/migrations/202607300001_harden_database_security.sql"
);
const publicWriteMigrationPath = resolve(
  root,
  "supabase/migrations/202608030001_bind_guest_owners_and_public_write_idempotency.sql"
);
const viewLogMigrationPath = resolve(
  root,
  "supabase/migrations/202608030002_harden_view_log_cost_boundary.sql"
);
const accountDeletionMigrationPath = resolve(
  root,
  "supabase/migrations/202608030003_harden_account_deletion_lifecycle.sql"
);
const signedAssetMigrationPath = resolve(
  process.cwd(),
  "supabase/migrations/202608030004_harden_signed_asset_delivery.sql"
);

function normalized(sql: string) {
  return sql.replace(/\s+/g, " ").trim().toLowerCase();
}

describe("Supabase schema security", () => {
  it("keeps invitation assets private and removes public object reads", () => {
    const sql = normalized(schema);

    expect(sql).toContain(
      "values ( 'invitation-assets', 'invitation-assets', false,"
    );
    expect(sql).toContain(
      'drop policy if exists "public can read invitation assets" on storage.objects'
    );
    expect(sql).not.toContain(
      'create policy "public can read invitation assets"'
    );
    expect(sql).not.toContain(
      'create policy "authenticated users manage own invitation assets"'
    );
    expect(sql).not.toContain(
      'create policy "authenticated users can read own invitation assets"'
    );
    expect(sql).not.toContain(
      'create policy "authenticated users can delete own invitation assets"'
    );
  });

  it("allows public invitation data only through the service-backed path", () => {
    const sql = normalized(schema);

    expect(sql).toContain(
      'drop policy if exists "public can read published invitations" on public.invitations'
    );
    expect(sql).not.toContain(
      'create policy "public can read published invitations"'
    );
    expect(sql).toContain(
      "revoke select on table public.invitations from public, anon"
    );
    expect(sql).toContain(
      "grant select on table public.invitations to authenticated, service_role"
    );
  });

  it("splits owner invitation policies into draft-only writes", () => {
    const sql = normalized(schema);

    expect(sql).not.toContain('create policy "owners manage invitations"');
    expect(sql).toContain('create policy "owners can read invitations"');
    expect(sql).toContain('create policy "owners can create draft invitations"');
    expect(sql).toContain('create policy "owners can update draft invitations"');
    expect(sql).toContain('create policy "owners can delete invitations"');
    expect(sql).toMatch(
      /create policy "owners can create draft invitations".*?with check \(.*?status = 'draft'.*?repurchase_required = false.*?paid_payload_snapshot is null.*?published_at is null/
    );
    expect(sql).toMatch(
      /create policy "owners can update draft invitations".*?using \(.*?\) with check \(.*?status = 'draft'.*?repurchase_required = false.*?paid_payload_snapshot is null.*?published_at is null/
    );
    expect(sql).toMatch(
      /create policy "owners can create draft invitations".*?guest_publish_idempotency_key_hash is null.*?guest_publish_request_hash is null/
    );
    expect(sql).toMatch(
      /create policy "owners can update draft invitations".*?using \( \(select auth\.uid\(\)\) = user_id and guest_publish_idempotency_key_hash is null.*?status <> 'deletion_pending'.*?account_is_active/
    );
  });

  it("limits rate-limit RPCs to bounded service-role calls", () => {
    const sql = normalized(schema);

    expect(sql).toContain(
      "pg_catalog.char_length(bucket_key) not between 1 and 200"
    );
    expect(sql).toContain("max_hits not between 1 and 1000");
    expect(sql).toContain("window_seconds not between 1 and 86400");
    expect(sql).toContain("on conflict on constraint rate_limits_pkey do update");
    expect(sql).toContain(
      "least(public.rate_limits.count + 1, $2 + 1)"
    );
    expect(sql).not.toContain("from public.rate_limits where rate_limits.bucket_key = $1 for update");
    expect(sql).toContain(
      "revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated"
    );
    expect(sql).toContain(
      "grant execute on function public.consume_rate_limit(text, integer, integer) to service_role"
    );
  });

  it("removes direct client view-log inserts and adds bounded retention cleanup", () => {
    const sql = normalized(schema);

    expect(sql).toContain(
      'drop policy if exists "public can insert view logs for published invitations" on public.view_logs'
    );
    expect(sql).not.toContain(
      'create policy "public can insert view logs for published invitations"'
    );
    expect(sql).toContain(
      "revoke insert, update, delete on table public.view_logs from public, anon, authenticated, service_role"
    );
    expect(sql).toContain(
      "grant execute on function public.record_invitation_view(uuid, text, text, text, text, timestamptz) to service_role"
    );
    expect(sql).toContain(
      "create or replace function public.cleanup_rate_limits("
    );
    expect(sql).toContain("retention_seconds not between 60 and 604800");
    expect(sql).toContain(
      "grant execute on function public.cleanup_rate_limits(integer) to service_role"
    );
    expect(sql).toContain(
      "create index if not exists idx_rate_limits_reset_at on public.rate_limits(reset_at)"
    );
  });

  it("binds guest ownership to auth users and makes public writes replay-safe", () => {
    const sql = normalized(schema);

    expect(sql).toContain("guest_publish_idempotency_key_hash text");
    expect(sql).toContain("guest_publish_request_hash text");
    expect(sql).toContain(
      "create unique index if not exists idx_invitations_guest_publish_idempotency"
    );
    expect(sql).toContain(
      "create unique index if not exists idx_rsvps_public_idempotency"
    );
    expect(sql).toContain(
      "create unique index if not exists idx_guestbook_public_idempotency"
    );
    expect(sql).toContain(
      "revoke insert, update, delete on table public.rsvps from public, anon, authenticated"
    );
    expect(sql).toContain(
      "revoke insert, delete on table public.guestbook_entries from public, anon, authenticated"
    );
  });

  it("ships the same controls as an unapplied migration", () => {
    const migration = normalized(readFileSync(migrationPath, "utf8"));

    expect(migration).toContain(
      "update storage.buckets set public = false where id = 'invitation-assets'"
    );
    expect(migration).toContain(
      'drop policy if exists "authenticated users manage own invitation assets" on storage.objects'
    );
    expect(migration).toContain(
      'create policy "authenticated users can read own invitation assets"'
    );
    expect(migration).toContain(
      'create policy "authenticated users can delete own invitation assets"'
    );
    expect(migration).toContain(
      "revoke select on table public.invitations from public, anon"
    );
    expect(migration).toContain(
      'create policy "owners can update draft invitations"'
    );
    expect(migration).toContain(
      "revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated"
    );
    expect(migration).toContain(
      'drop policy if exists "public can insert view logs for published invitations" on public.view_logs'
    );
    expect(migration).toContain(
      "create or replace function public.cleanup_rate_limits("
    );
  });

  it("ships guest ownership and idempotency as a separate unapplied migration", () => {
    const migration = normalized(readFileSync(publicWriteMigrationPath, "utf8"));

    expect(migration).toContain("guest_publish_idempotency_key_hash text");
    expect(migration).toContain(
      "create unique index if not exists idx_invitations_guest_publish_idempotency"
    );
    expect(migration).toContain(
      "revoke insert, update, delete on table public.rsvps from public, anon, authenticated"
    );
    expect(migration).toContain(
      "revoke insert, delete on table public.guestbook_entries from public, anon, authenticated"
    );
    expect(migration).toContain(
      "and guest_publish_idempotency_key_hash is null"
    );
    expect(migration).toContain(
      "create or replace function public.consume_rate_limit("
    );
    expect(migration).toContain(
      "on conflict on constraint rate_limits_pkey do update"
    );
    expect(migration).toContain(
      "revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated"
    );
  });

  it("makes view logging atomic, replay-safe, bounded, and retention-limited", () => {
    const sql = normalized(schema);

    expect(sql).toContain("visitor_key text");
    expect(sql).toContain("identity_kind text");
    expect(sql).toContain("idempotency_key_hash text");
    expect(sql).toContain("request_hash text");
    expect(sql).toContain("cost_units smallint not null default 1");
    expect(sql).toContain("identity_expires_at timestamptz");
    expect(sql).toContain("expires_at timestamptz");
    expect(sql).toContain("create unique index if not exists idx_view_logs_idempotency");
    expect(sql).toContain("create or replace function public.record_invitation_view(");
    expect(sql).toContain("p_visitor_key is null or p_visitor_key !~");
    expect(sql).toContain("issued_at < pg_catalog.now() - interval '60 seconds'");
    expect(sql).toContain("on conflict (invitation_id, idempotency_key_hash) do nothing");
    expect(sql).toContain("p_identity_kind, null, p_idempotency_key_hash");
    expect(sql).toContain("revoke all on function public.record_invitation_view(");
    expect(sql).toContain("grant execute on function public.record_invitation_view(");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("create or replace function public.cleanup_view_logs(");
    expect(sql).toContain("for update skip locked");
    expect(sql).toContain("batch_size not between 1 and 5000");
    expect(sql).toContain("(select auth.uid()) = invitations.user_id");
  });

  it("ships the view-log boundary as a forward-only unapplied migration", () => {
    const migration = normalized(readFileSync(viewLogMigrationPath, "utf8"));

    expect(migration).toContain("local migration artifact only");
    expect(migration).toContain("alter table public.view_logs add column if not exists visitor_key text");
    expect(migration).toContain("create unique index if not exists idx_view_logs_idempotency");
    expect(migration).toContain("create or replace function public.record_invitation_view(");
    expect(migration).toContain("create or replace function public.cleanup_view_logs(");
    expect(migration).toContain("revoke insert, update, delete on table public.view_logs from public, anon, authenticated");
  });

  it("tombstones account data and uses a bounded service-only deletion outbox", () => {
    const sql = normalized(schema);

    expect(sql).toContain("create table if not exists public.account_deletion_requests");
    expect(sql).toContain("status in ('pending', 'processing', 'retry_wait', 'blocked', 'completed')");
    expect(sql).toContain("stage in ('storage', 'provider', 'auth', 'finalize', 'completed')");
    expect(sql).toContain("attempt_count between 0 and 5");
    expect(sql).toContain("create unique index if not exists idx_account_deletion_active_user");
    expect(sql).toContain("where status <> 'completed'");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("create or replace function public.begin_account_deletion(");
    expect(sql).toContain("create or replace function public.claim_account_deletion(");
    expect(sql).toContain("create or replace function public.advance_account_deletion(");
    expect(sql).toContain("create or replace function public.fail_account_deletion(");
    expect(sql).toContain("create or replace function public.cleanup_account_deletion_requests(");
    expect(sql).toContain("grant execute on function public.begin_account_deletion(");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("status = 'deletion_pending'");
    expect(sql).toContain("lease_expires_at = pg_catalog.now() + interval '2 minutes'");
    expect(sql).toContain("attempt_count < 5");
    expect(sql).toContain("case when adr.attempt_count >= 5 then 'blocked' else 'retry_wait' end");
    expect(sql).toContain("to_regclass('public.user_entitlements')");
    expect(sql).toContain("to_regclass('public.publish_credits')");
    expect(sql).toContain("for update skip locked");
    expect(sql).toContain("set user_id = null, idempotency_key_hash = null");
  });

  it("ships account deletion as an unapplied forward migration with deny-by-default grants", () => {
    const migration = normalized(readFileSync(accountDeletionMigrationPath, "utf8"));

    expect(migration).toContain("local migration artifact only");
    expect(migration).toContain("create table if not exists public.account_deletion_requests");
    expect(migration).toContain("revoke all on table public.account_deletion_requests from public, anon, authenticated");
    expect(migration).toContain("create or replace function public.account_is_active(");
    expect(migration).toContain("grant execute on function public.account_is_active(uuid) to authenticated");
    expect(migration).toContain("create or replace function public.begin_account_deletion(");
    expect(migration).toContain("grant execute on function public.begin_account_deletion(");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("bucket_id = 'invitation-assets'");
    expect(migration).toContain("public.account_is_active((select auth.uid()))");
  });

  it("removes direct authenticated Storage reads so signed URLs cannot bypass server budgets", () => {
    const sql = normalized(schema);
    expect(sql).toContain("values ( 'invitation-assets', 'invitation-assets', false,");
    expect(sql).toContain('drop policy if exists "authenticated users can read own invitation assets"');
    expect(sql).toContain('drop policy if exists "authenticated users can delete own invitation assets"');
    expect(sql).not.toContain('create policy "authenticated users can read own invitation assets"');
    expect(sql).not.toContain('create policy "authenticated users can delete own invitation assets"');
    expect(sql).toContain("bounded service endpoints enforce owner/public access");
  });

  it("ships the signed asset boundary as an unapplied forward migration", () => {
    const migration = normalized(readFileSync(signedAssetMigrationPath, "utf8"));
    expect(migration).toContain("local migration artifact only");
    expect(migration).toContain("set public = false");
    expect(migration).toContain('drop policy if exists "public can read invitation assets"');
    expect(migration).toContain('drop policy if exists "authenticated users can read own invitation assets"');
    expect(migration).toContain('drop policy if exists "authenticated users can delete own invitation assets"');
    expect(migration).not.toContain("create policy");
  });
});
