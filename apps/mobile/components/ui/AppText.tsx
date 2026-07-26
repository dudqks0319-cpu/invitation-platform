import { forwardRef } from "react";
import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps
} from "react-native";
import { resolveBodyFontFamily } from "./typography";

export const AppText = forwardRef<NativeText, TextProps>(function AppText(
  { style, ...props },
  ref
) {
  const flattenedStyle = StyleSheet.flatten(style);
  const fontFamily = flattenedStyle?.fontFamily
    ?? resolveBodyFontFamily(flattenedStyle?.fontWeight);

  return <NativeText ref={ref} {...props} style={[{ fontFamily }, style]} />;
});

export const AppTextInput = forwardRef<NativeTextInput, TextInputProps>(
  function AppTextInput({ style, ...props }, ref) {
    const flattenedStyle = StyleSheet.flatten(style);
    const fontFamily = flattenedStyle?.fontFamily
      ?? resolveBodyFontFamily(flattenedStyle?.fontWeight);

    return (
      <NativeTextInput
        ref={ref}
        {...props}
        style={[{ fontFamily }, style]}
      />
    );
  }
);
