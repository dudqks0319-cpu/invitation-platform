import {
  type InvitationDraftPayload,
  normalizeDraft
} from "@/lib/invitation-payload";
import type { Database, Json } from "@/lib/supabase/types";

export type InvitationVariantStatus = "active" | "hidden" | "archived";

export type InvitationVariantRow = Database["public"]["Tables"]["invitation_variants"]["Row"];

export type PublishedInvitationRow = Pick<
  Database["public"]["Tables"]["invitations"]["Row"],
  "id" | "slug" | "title" | "category" | "template_id" | "status" | "payload" | "published_at"
>;

type QueryResult<T> = Promise<{
  data: T | null;
  error: { message?: string } | null;
}>;

type SingleQuery<T> = {
  select(columns: string): SingleQuery<T>;
  eq(column: string, value: string): SingleQuery<T>;
  maybeSingle(): QueryResult<T>;
};

export type InvitationLookupClient = {
  from(table: string): unknown;
};

export type PublishedInvitationLookup = {
  invitation: PublishedInvitationRow;
  variant: InvitationVariantRow | null;
  requestedSlug: string;
  publicSlug: string;
  payload: InvitationDraftPayload;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergePlainRecords(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(patch).reduce<Record<string, unknown>>((next, [key, value]) => {
    const current = next[key];
    next[key] = isPlainRecord(current) && isPlainRecord(value)
      ? mergePlainRecords(current, value)
      : value;
    return next;
  }, { ...base });
}

function jsonToRecord(value: Json | null): Record<string, unknown> {
  return isPlainRecord(value) ? value : {};
}

export function applyInvitationVariant(
  invitation: PublishedInvitationRow,
  variant: InvitationVariantRow | null
): InvitationDraftPayload {
  const basePayload = jsonToRecord(invitation.payload);

  if (!variant) {
    return normalizeDraft(basePayload);
  }

  const payloadPatch = jsonToRecord(variant.payload_patch);
  const sectionPatch = jsonToRecord(variant.section_patch);
  const mergedPayload = mergePlainRecords(basePayload, payloadPatch);
  const baseSections = jsonToRecord(mergedPayload.sections as Json | null);

  return normalizeDraft({
    ...mergedPayload,
    shareUrl: variant.slug,
    sections: mergePlainRecords(baseSections, sectionPatch),
    audience: {
      variantId: variant.id,
      audienceKey: variant.audience_key,
      label: variant.audience_label,
      slug: variant.slug
    }
  });
}

async function loadInvitationBySlug(client: InvitationLookupClient, slug: string) {
  const query = client.from("invitations") as SingleQuery<PublishedInvitationRow>;
  const { data, error } = await query
    .select("id, slug, title, category, template_id, status, payload, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function loadVariantBySlug(client: InvitationLookupClient, slug: string) {
  const query = client.from("invitation_variants") as SingleQuery<InvitationVariantRow>;
  const { data, error } = await query
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function loadInvitationById(client: InvitationLookupClient, invitationId: string) {
  const query = client.from("invitations") as SingleQuery<PublishedInvitationRow>;
  const { data, error } = await query
    .select("id, slug, title, category, template_id, status, payload, published_at")
    .eq("id", invitationId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function resolvePublishedInvitationBySlug(
  client: InvitationLookupClient,
  slug: string
): Promise<PublishedInvitationLookup | null> {
  const invitation = await loadInvitationBySlug(client, slug);
  if (invitation) {
    return {
      invitation,
      variant: null,
      requestedSlug: slug,
      publicSlug: invitation.slug,
      payload: applyInvitationVariant(invitation, null)
    };
  }

  const variant = await loadVariantBySlug(client, slug);
  if (!variant) {
    return null;
  }

  const variantInvitation = await loadInvitationById(client, variant.invitation_id);
  if (!variantInvitation) {
    return null;
  }

  return {
    invitation: variantInvitation,
    variant,
    requestedSlug: slug,
    publicSlug: variant.slug,
    payload: applyInvitationVariant(variantInvitation, variant)
  };
}
