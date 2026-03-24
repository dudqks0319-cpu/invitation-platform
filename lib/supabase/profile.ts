import { deriveDisplayName } from "@/lib/auth";

type UserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type UpsertableTable = {
  upsert: (
    value: Record<string, unknown>,
    options?: Record<string, unknown>
  ) => PromiseLike<{ error?: { message?: string } | null }>;
};

type SupabaseLike = {
  from: (table: string) => UpsertableTable;
};

export async function ensureProfileRow(supabase: SupabaseLike, user: UserLike) {
  const result = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: deriveDisplayName(user)
    },
    {
      onConflict: "id"
    }
  );

  const error = result?.error as { message?: string } | null | undefined;

  if (error) {
    throw new Error(error.message || "프로필 저장에 실패했습니다.");
  }
}
