import { Text, TextInput, View } from "react-native";
import { theme } from "./theme";

type DateTimeFieldProps = {
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function DateTimeField({
  onChangeText,
  placeholder = "YYYY-MM-DD HH:mm",
  value
}: DateTimeFieldProps) {
  return (
    <View style={{ gap: 10 }}>
      <TextInput
        accessibilityLabel="행사 일시 입력"
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{
          minHeight: 56,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: theme.colors.text,
          fontSize: 15,
          lineHeight: 22
        }}
        value={value}
      />
      <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18 }}>
        웹 미리보기에서는 날짜와 시간을 직접 입력합니다.
      </Text>
    </View>
  );
}
