import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { signInWithApple } from "../lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAppleSignIn() {
    setLoading(true);
    setError("");

    const result = await signInWithApple();

    if (result.success) {
      router.replace("/(tabs)");
    } else if (result.error && result.error !== "로그인이 취소되었습니다.") {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>InviteHub</Text>
        <Text style={styles.subtitle}>
          소중한 순간을 위한{"\n"}감성 초대장 플랫폼
        </Text>

        <View style={styles.authSection}>
          {Platform.OS === "ios" ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          ) : null}

          {loading ? (
            <ActivityIndicator
              size="small"
              color="#1a1a1a"
              style={{ marginTop: 16 }}
            />
          ) : null}

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
        </View>

        <Text style={styles.terms}>
          로그인하면 이용약관 및 개인정보처리방침에{"\n"}동의하는 것으로 간주됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  content: { alignItems: "center", padding: 32 },
  logo: { fontSize: 32, fontWeight: "700", color: "#1a1a1a", marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48
  },
  authSection: { width: "100%", alignItems: "center" },
  appleButton: { width: "100%", height: 50 },
  error: {
    color: "#e74c3c",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center"
  },
  terms: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "center",
    marginTop: 32,
    lineHeight: 18
  }
});
