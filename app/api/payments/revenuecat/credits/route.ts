import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "Authorization");
  return response;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

async function getAuthenticatedUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return { user: null };
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const {
    data: { user },
    error
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return { user: null };
  }

  return { user };
}

export async function GET(request: Request) {
  const { user } = await getAuthenticatedUser(request);

  if (!user) {
    return noStoreJson({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return noStoreJson({ success: false, message: "발행권 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("publish_credits")
    .select("credits")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return noStoreJson({ success: false, message: "발행권 조회에 실패했습니다." }, { status: 500 });
  }

  return noStoreJson({ success: true, credits: data?.credits ?? 0 });
}
