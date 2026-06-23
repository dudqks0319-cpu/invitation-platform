import type { Json } from "@/lib/supabase/types";

export type InvitationVariantPreset = {
  audienceKey: string;
  audienceLabel: string;
  description: string;
  payloadPatch: Json;
  sectionPatch: Json;
};

export type InvitationVariantCreateInput = {
  invitationId: string;
  baseSlug: string;
  preset: InvitationVariantPreset;
};

export type InvitationVariantInsertPayload = {
  invitation_id: string;
  audience_key: string;
  audience_label: string;
  slug: string;
  payload_patch: Json;
  section_patch: Json;
  status: "active";
};

export const invitationVariantPresets: InvitationVariantPreset[] = [
  {
    audienceKey: "friends",
    audienceLabel: "친구용",
    description: "편한 문구와 방명록 중심으로 공유합니다.",
    payloadPatch: {
      message: "편하게 와서 함께 축하해 주세요."
    },
    sectionPatch: {
      accounts: false
    }
  },
  {
    audienceKey: "family",
    audienceLabel: "가족용",
    description: "가족과 친척에게 필요한 연락/계좌 영역을 유지합니다.",
    payloadPatch: {},
    sectionPatch: {}
  },
  {
    audienceKey: "coworkers",
    audienceLabel: "직장용",
    description: "직장 동료에게 민감한 연락처와 계좌를 숨깁니다.",
    payloadPatch: {
      message: "바쁘시겠지만 시간 되시면 함께 축하해 주세요."
    },
    sectionPatch: {
      accounts: false,
      contact: false
    }
  },
  {
    audienceKey: "parents",
    audienceLabel: "부모님 지인용",
    description: "부모님 지인에게 보낼 별도 링크로 응답을 분리합니다.",
    payloadPatch: {},
    sectionPatch: {}
  }
];

export function normalizeVariantSlugSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildInvitationVariantSlug(baseSlug: string, audienceKey: string) {
  const normalizedBase = normalizeVariantSlugSegment(baseSlug) || "invitehub";
  const normalizedAudience = normalizeVariantSlugSegment(audienceKey) || "audience";
  return `${normalizedBase}-${normalizedAudience}`.slice(0, 160);
}

export function buildInvitationVariantInsertPayload({
  invitationId,
  baseSlug,
  preset
}: InvitationVariantCreateInput): InvitationVariantInsertPayload {
  return {
    invitation_id: invitationId,
    audience_key: preset.audienceKey,
    audience_label: preset.audienceLabel,
    slug: buildInvitationVariantSlug(baseSlug, preset.audienceKey),
    payload_patch: preset.payloadPatch,
    section_patch: preset.sectionPatch,
    status: "active"
  };
}
