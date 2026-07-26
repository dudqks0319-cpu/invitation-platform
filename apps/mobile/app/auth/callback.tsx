import { useEffect, useState } from "react";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams<{ code?: string; error?: string }>();
  const initialError = !supabase
    ? "Supabase 환경 변수가 없어 인증 콜백을 처리할 수 없습니다."
    : params.error
      ? String(params.error)
      : !params.code
        ? "인증 코드가 없어 로그인 처리를 완료할 수 없습니다."
        : "";
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (initialError || !supabase || !params.code) {
      return;
    }

    let mounted = true;

    void supabase.auth.exchangeCodeForSession(String(params.code)).then(({ error: exchangeError }) => {
      if (!mounted) return;

      if (exchangeError) {
        setError(exchangeError.message);
        return;
      }

      router.replace("/(tabs)/my-invitations");
    });

    return () => {
      mounted = false;
    };
  }, [initialError, params.code, router]);

  return (
    <Screen subtitle="브라우저 인증 결과를 앱 세션으로 바꾸는 중입니다." title="로그인 연결">
      {error ? (
        <>
          <ErrorView description={error} title="인증을 완료하지 못했습니다" />
          <Link asChild href="/login">
            <Pressable
              accessibilityLabel="로그인 화면으로 돌아가기"
              style={{
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: "#8d5a2b", fontWeight: "700" }}>로그인 화면으로 돌아가기</Text>
            </Pressable>
          </Link>
        </>
      ) : (
        <>
          <Loading label="로그인 세션을 연결하는 중..." />
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>
            잠시만 기다리면 내 초대장 화면으로 이동합니다.
          </Text>
        </>
      )}
    </Screen>
  );
}
