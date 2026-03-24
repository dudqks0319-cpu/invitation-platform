import type { InvitationDraftPayload, InvitationStatus } from "@/lib/invitation-payload";

export type SaveResult = {
  success: boolean;
  errorCode: string | null;
  currentRevision: number;
  serverPayload: unknown | null;
};

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_SESSION_EXPIRED: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  SAVE_PAYLOAD_INVALID: "저장할 수 없는 데이터입니다. 필수 항목을 확인해 주세요.",
  SAVE_REVISION_CONFLICT: "다른 기기에서 수정이 있었습니다. 최신 데이터를 불러옵니다.",
  SLUG_RESERVED_WORD: "사용할 수 없는 주소입니다. 다른 주소를 선택해 주세요.",
  SLUG_ALREADY_TAKEN: "이미 사용 중인 주소입니다. 다른 주소를 선택해 주세요.",
  SLUG_INVALID_FORMAT: "주소 형식이 올바르지 않습니다. 4자 이상 입력해 주세요.",
  PHOTO_LIMIT_EXCEEDED: "사진은 최대 10장까지 추가할 수 있습니다."
};

export function getErrorMessage(code: string | null) {
  if (!code) {
    return "알 수 없는 오류가 발생했습니다.";
  }

  return ERROR_MESSAGES[code] ?? `오류가 발생했습니다. (${code})`;
}

type SupabaseLike = {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => PromiseLike<{
    data: Array<{
      success: boolean;
      error_code: string | null;
      current_revision: number;
      server_payload: unknown | null;
    }> | null;
    error: { message: string } | null;
  }>;
};

export async function callSaveInvitation(
  supabase: SupabaseLike,
  args: {
    id: string;
    payload: InvitationDraftPayload;
    expectedRevision: number;
    status: InvitationStatus;
  }
): Promise<SaveResult> {
  const { data, error } = await supabase.rpc("save_invitation", {
    p_id: args.id,
    p_payload: args.payload as unknown,
    p_expected_revision: args.expectedRevision,
    p_status: args.status
  });

  if (error) {
    console.error("save_invitation RPC error:", error.message);
    return {
      success: false,
      errorCode: "UNKNOWN_ERROR",
      currentRevision: args.expectedRevision,
      serverPayload: null
    };
  }

  const row = data?.[0];

  if (!row) {
    return {
      success: false,
      errorCode: "UNKNOWN_ERROR",
      currentRevision: args.expectedRevision,
      serverPayload: null
    };
  }

  return {
    success: row.success,
    errorCode: row.error_code,
    currentRevision: row.current_revision,
    serverPayload: row.server_payload
  };
}
