import { Text } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { theme } from "@/components/ui/theme";
import { useStorePurchase } from "@/hooks/useStorePurchase";

type StorePurchaseCardProps = {
  accessToken?: string;
  disabledReason?: string;
  invitationId?: string;
  onBeforePurchase?: () => Promise<{ invitationId: string } | null>;
  onVerified?: (result: { invitationId: string; slug: string }) => void;
};

export function StorePurchaseCard({
  accessToken,
  disabledReason,
  invitationId,
  onBeforePurchase,
  onVerified
}: StorePurchaseCardProps) {
  const { canPurchase, connected, error, message, notice, pendingPurchase, product, productIds, provider, purchase } =
    useStorePurchase({
      accessToken,
      invitationId,
      onBeforePurchase,
      onVerified
    });

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
            : "결제 준비가 아직 완료되지 않았습니다."}
      </Text>
      {message ? (
        <Text style={{ color: theme.colors.success, lineHeight: 22, marginTop: 10 }}>{message}</Text>
      ) : null}
      {error ? (
        <Text style={{ color: theme.colors.primaryDark, lineHeight: 22, marginTop: 10 }}>{error}</Text>
      ) : null}
      {disabledReason ? (
        <Text style={{ color: theme.colors.primaryDark, lineHeight: 22, marginTop: 10 }}>{disabledReason}</Text>
      ) : null}
      <Text style={{ color: theme.colors.textLight, lineHeight: 20, marginTop: 10 }}>
        유료 옵션 초대장은 앱 스토어 결제를 완료해야 발행됩니다.
      </Text>
      <Button
        accessibilityLabel="스토어 결제 시작"
        onPress={canPurchase && !disabledReason ? () => void purchase() : undefined}
        variant={canPurchase && !disabledReason ? "primary" : "outline"}
      >
        {pendingPurchase
          ? "결제 요청 중..."
          : disabledReason
            ? "결제 전 준비 필요"
            : canPurchase
              ? "스토어 결제로 발행권 구매"
              : "결제 준비 중"}
      </Button>
    </Card>
  );
}
