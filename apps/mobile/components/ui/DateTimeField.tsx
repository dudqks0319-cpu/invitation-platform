import { useMemo, useState } from "react";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Platform, Pressable, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { formatInviteDateTime, mergeInviteDateTimePart, parseInviteDateTime } from "@/lib/date-time";
import { theme } from "./theme";

type DateTimeFieldProps = {
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
};

type PickerMode = "date" | "time" | null;

function PickerTab({
  active,
  label,
  onPress
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 40,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.colors.primary : theme.colors.surface,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.border,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : theme.colors.primaryDark,
          fontSize: 13,
          fontWeight: "700"
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function DateTimeField({ onChangeText, placeholder = "날짜와 시간을 선택하세요", value }: DateTimeFieldProps) {
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const selectedDate = useMemo(() => parseInviteDateTime(value) ?? new Date(), [value]);
  const displayValue = formatInviteDateTime(value);

  function openPicker(mode: Exclude<PickerMode, null>) {
    if (!value && mode === "time") {
      setPickerMode("date");
      return;
    }

    setPickerMode(mode);
  }

  function handleChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === "android") {
      if (event.type === "dismissed" || !nextDate) {
        setPickerMode(null);
        return;
      }

      onChangeText(mergeInviteDateTimePart(value, nextDate, pickerMode === "time" ? "time" : "date"));

      if (pickerMode === "date") {
        setPickerMode("time");
        return;
      }

      setPickerMode(null);
      return;
    }

    if (!nextDate || !pickerMode) {
      return;
    }

    onChangeText(mergeInviteDateTimePart(value, nextDate, pickerMode));
  }

  return (
    <View style={{ gap: 10 }}>
      <Pressable
        accessibilityLabel="행사 일시 선택"
        onPress={() => openPicker("date")}
        style={{
          minHeight: 56,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: pickerMode ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 14,
          justifyContent: "center"
        }}
      >
        <Text
          style={{
            color: displayValue ? theme.colors.text : theme.colors.textLight,
            fontSize: 15,
            lineHeight: 22,
            fontWeight: displayValue ? "600" : "500"
          }}
        >
          {displayValue || placeholder}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
          날짜를 먼저 고르면 시간 선택이 이어집니다.
        </Text>
      </Pressable>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <PickerTab active={pickerMode === "date"} label="날짜 선택" onPress={() => openPicker("date")} />
        <PickerTab active={pickerMode === "time"} label="시간 선택" onPress={() => openPicker("time")} />
      </View>

      {pickerMode ? (
        <View
          style={{
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceSoft,
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 10
          }}
        >
          {Platform.OS === "ios" ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <PickerTab active={pickerMode === "date"} label="날짜" onPress={() => setPickerMode("date")} />
              <PickerTab active={pickerMode === "time"} label="시간" onPress={() => setPickerMode("time")} />
              <Pressable
                onPress={() => setPickerMode(null)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8
                }}
              >
                <Text style={{ color: theme.colors.primaryDark, fontSize: 13, fontWeight: "700" }}>닫기</Text>
              </Pressable>
            </View>
          ) : null}
          <DateTimePicker
            display={Platform.OS === "ios" ? "spinner" : "default"}
            locale="ko-KR"
            mode={pickerMode}
            onChange={handleChange}
            value={selectedDate}
          />
        </View>
      ) : null}
    </View>
  );
}
