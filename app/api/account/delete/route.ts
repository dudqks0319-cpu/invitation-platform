import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { INVITATION_ASSET_BUCKET } from "@/lib/invitation-assets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

async function removeUserStorageAssets(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string
) {
  const bucket = admin.storage.from(INVITATION_ASSET_BUCKET);
  const limit = 100;
  let offset = 0;
  const paths: string[] = [];

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit,
      offset,
      sortBy: {
        column: "name",
        order: "asc"
      }
    });

    if (error) {
      return {
        ok: false as const
      };
    }

    const entries = data ?? [];
    paths.push(
      ...entries
        .map((entry) => entry.name)
        .filter((name): name is string => Boolean(name))
        .map((name) => `${userId}/${name}`)
    );

    if (entries.length < limit) {
      break;
    }

    offset += limit;
  }

  if (!paths.length) {
    return {
      ok: true as const
    };
  }

  const { error } = await bucket.remove(paths);
  return {
    ok: !error
  } as const;
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  const admin = createSupabaseAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!token) {
    return NextResponse.json({ success: false, message: "인증 토큰이 필요합니다." }, { status: 401 });
  }

  if (!admin || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: false, message: "계정 삭제 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const {
    data: { user },
    error: userError
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ success: false, message: "세션을 확인할 수 없습니다." }, { status: 401 });
  }

  const storageCleanup = await removeUserStorageAssets(admin, user.id);
  if (!storageCleanup.ok) {
    return NextResponse.json({ success: false, message: "계정 데이터를 정리하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  const { error } = await admin.auth.admin.deleteUser(user.id, false);

  if (error) {
    return NextResponse.json({ success: false, message: "계정 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
