import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { signInWithApple } from "@/lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAppleSignIn() {
    setLoading(true);
    const result = await signInWithApple();
    setLoading(false);

    if (result.success) {
      router.back();
    } else if (result.error && result.error !== "로그인이 취소되었습니다.") {
      Alert.alert("로그인 실패", result.error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💌</Text>
        <Text style={styles.title}>InviteHub</Text>
        <Text style={styles.description}>
          로그인하면 초대장을 저장하고{"\n"}
          RSVP와 방명록을 관리할 수 있습니다.
        </Text>

        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        />

        {loading ? (
          <ActivityIndicator style={{ marginTop: 16 }} color="#4A90D9" />
        ) : null}

        <Text style={styles.terms}>
          로그인하면 이용약관과 개인정보 처리방침에{"\n"}동의하는 것으로 간주됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    justifyContent: "center"
  },
  content: {
    alignItems: "center",
    padding: 32
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#222", marginBottom: 8 },
  description: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32
  },
  appleButton: {
    width: 280,
    height: 50
  },
  terms: {
    fontSize: 11,
    color: "#AAA",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 16
  }
});
