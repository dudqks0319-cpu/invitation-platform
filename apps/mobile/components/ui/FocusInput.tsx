import { useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { theme } from "./theme";

export function FocusInput(props: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...props}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      style={[
        {
          minHeight: 48,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: focused ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 15,
          color: theme.colors.text
        },
        props.style
      ]}
    />
  );
}
