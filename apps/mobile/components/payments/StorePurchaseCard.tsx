import { AppText as Text } from "@/components/ui/AppText";
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
  userId?: string;
};

export function StorePurchaseCard({
  accessToken,
  disabledReason,
  invitationId,
  onBeforePurchase,
  onVerified,
  userId
}: StorePurchaseCardProps) {
  const { canPurchase, connected, error, message, notice, pendingPurchase, product, productIds, provider, purchase, restore } =
    useStorePurchase({
      accessToken,
      invitationId,
      onBeforePurchase,
      onVerified,
      userId
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
              ? "발행권 상품을 불러오는 중입니다."
              : "스토어 연결을 준비 중입니다."
            : "현재 결제 기능을 준비하고 있습니다. 준비가 끝나면 이 화면에서 바로 구매할 수 있습니다."}
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
        프리미엄 발행권은 초대장 1개 최종 발행, 공유 링크, 참석 여부, 방명록, 지도와 계좌 표시를 포함합니다.
      </Text>
      <Button
        accessibilityLabel="발행권 구매"
        onPress={canPurchase && !disabledReason ? () => void purchase() : undefined}
        variant={canPurchase && !disabledReason ? "primary" : "outline"}
      >
        {pendingPurchase
          ? "결제 요청 중..."
          : disabledReason
            ? "결제 전 준비 필요"
            : canPurchase
              ? "발행권 구매하기"
              : "결제 준비 중"}
      </Button>
      <Button
        accessibilityLabel="구매 복원"
        onPress={!pendingPurchase && !disabledReason ? () => void restore() : undefined}
        variant="outline"
      >
        구매 복원
      </Button>
    </Card>
  );
}
