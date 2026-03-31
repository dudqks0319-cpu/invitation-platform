import { Text } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { theme } from "@/components/ui/theme";
import { useStorePurchase } from "@/hooks/useStorePurchase";

export function StorePurchaseCard() {
  const { canPurchase, connected, error, message, notice, pendingPurchase, product, productIds, provider, purchase } =
    useStorePurchase();

  const title = provider === "apple_iap" ? "Apple 인앱결제" : provider === "google_play" ? "Google Play 결제" : "스토어 결제";

  return (
    <Card eyebrow="앱 결제" title={title}>
      <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>{notice}</Text>
      <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: 6 }}>
        {product
          ? `상품: ${product.displayName ?? product.id}${product.displayPrice ? ` · ${product.displayPrice}` : ""}`
          : productIds.length > 0
            ? connected
              ? "스토어 상품을 불러오는 중입니다."
              : "스토어 연결을 준비 중입니다."
            : "환경변수에 스토어 상품 ID를 설정하면 실제 구매 버튼이 활성화됩니다."}
      </Text>
      {message ? (
        <Text style={{ color: theme.colors.success, lineHeight: 22, marginTop: 10 }}>{message}</Text>
      ) : null}
      {error ? (
        <Text style={{ color: theme.colors.primaryDark, lineHeight: 22, marginTop: 10 }}>{error}</Text>
      ) : null}
      <Text style={{ color: theme.colors.textLight, lineHeight: 20, marginTop: 10 }}>
        실제 발행권 반영은 다음 단계에서 서버 영수증 검증과 entitlement 연결이 필요합니다.
      </Text>
      <Button
        accessibilityLabel="스토어 결제 시작"
        onPress={canPurchase ? () => void purchase() : undefined}
        variant={canPurchase ? "primary" : "outline"}
      >
        {pendingPurchase ? "결제 요청 중..." : canPurchase ? "스토어 결제로 발행권 구매" : "스토어 상품 설정 필요"}
      </Button>
    </Card>
  );
}
