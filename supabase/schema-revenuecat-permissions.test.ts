import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(join(process.cwd(), "supabase/schema.sql"), "utf8");

function compactSql(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s*,\s*/g, ", ")
    .trim()
    .toLowerCase();
}

const normalizedSchema = compactSql(schema);

function expectServiceOnlyExecute(functionName: string, signature: string) {
  const normalizedSignature = compactSql(signature);
  expect(normalizedSchema).toContain(
    compactSql(`revoke all on function public.${functionName}(${normalizedSignature}) from public, anon, authenticated;`)
  );
  expect(normalizedSchema).toContain(
    compactSql(`grant execute on function public.${functionName}(${normalizedSignature}) to service_role;`)
  );
}

function expectSqlContract(snippet: string) {
  expect(normalizedSchema).toContain(compactSql(snippet));
}

describe("RevenueCat Supabase RPC contract", () => {
  it("keeps credit grant and revoke RPCs service-role only", () => {
    expectServiceOnlyExecute(
      "grant_publish_credit",
      "uuid, text, text, text, text, integer, timestamptz, jsonb"
    );
    expectServiceOnlyExecute("revoke_publish_credit", "text, timestamptz, jsonb");
  });

  it("keeps paid publish credit consumption RPC service-role only", () => {
    expectServiceOnlyExecute("publish_invitation_with_credit", "uuid, uuid, jsonb, jsonb");
  });

  it("grants credits idempotently by transaction id before increasing balance", () => {
    expectSqlContract(`
      if p_user_id is null then
        raise exception 'user_id is required';
      end if;
    `);
    expectSqlContract(`
      if p_quantity < 1 then
        raise exception 'quantity must be positive';
      end if;
    `);
    expectSqlContract(`
      if p_entitlement <> 'publish_credit' then
        raise exception 'unsupported entitlement';
      end if;
    `);
    expectSqlContract(`
      if p_platform not in ('ios', 'android') then
        raise exception 'unsupported platform';
      end if;
    `);
    expectSqlContract(`
      if nullif(btrim(p_transaction_id), '') is null then
        raise exception 'transaction_id is required';
      end if;
    `);
    expectSqlContract("p_platform = 'ios' and p_product_id <> 'com.invitehub.publish.credit'");
    expectSqlContract("p_platform = 'android' and p_product_id <> 'publish.credit.android'");
    expectSqlContract("on conflict (transaction_id) do nothing;");
    expectSqlContract("get diagnostics inserted_count = row_count;");
    expectSqlContract(`
      if inserted_count = 0 then
        return false;
      end if;
    `);
    expectSqlContract(`
      insert into public.publish_credits (user_id, credits, updated_at)
      values (p_user_id, p_quantity, now())
      on conflict (user_id)
      do update
        set credits = public.publish_credits.credits + excluded.credits,
            updated_at = now();
    `);
  });

  it("revokes only unused credit quantity and never drives the balance negative", () => {
    expectSqlContract(`
      if not found or entitlement_row.revoked_at is not null then
        return 0;
      end if;
    `);
    expectSqlContract("unused_quantity := greatest(entitlement_row.quantity - entitlement_row.consumed_quantity, 0);");
    expectSqlContract(`
      update public.publish_credits
      set credits = greatest(credits - unused_quantity, 0),
          updated_at = now()
      where user_id = entitlement_row.user_id;
    `);
  });

  it("consumes a server-granted publish credit atomically for the invitation owner", () => {
    expectSqlContract(`
      perform 1
      from public.invitations
      where id = p_invitation_id
        and user_id = p_user_id
      for update;
    `);
    expectSqlContract(`
      where user_id = p_user_id
        and entitlement = 'publish_credit'
        and revoked_at is null
        and consumed_quantity < quantity
      order by purchased_at asc
      for update skip locked
      limit 1;
    `);
    expectSqlContract(`
      update public.user_entitlements
      set consumed_quantity = consumed_quantity + 1,
          updated_at = now()
      where id = selected_entitlement_id;
    `);
    expectSqlContract(`
      set credits = greatest(public.publish_credits.credits - 1, 0),
          updated_at = now()
    `);
    expectSqlContract(`
      update public.invitations
      set payload = p_published_payload,
          status = 'published',
          published_at = now(),
          repurchase_required = false,
          paid_payload_snapshot = p_paid_payload_snapshot,
          updated_at = now()
      where id = p_invitation_id
        and user_id = p_user_id;
    `);
  });
});
