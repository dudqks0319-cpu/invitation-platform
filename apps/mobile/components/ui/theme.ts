export const theme = {
  colors: {
    background: "#f7f3ed",
    surface: "#fffdf9",
    surfaceSoft: "#fff7f1",
    border: "#eadfce",
    text: "#2c241e",
    muted: "#74665a",
    accent: "#9b6832",
    accentSoft: "#e8d4b7",
    blush: "#f4d8d6",
    eucalyptus: "#d9e5db",
    success: "#547a61",
    shadow: "rgba(102, 82, 63, 0.14)"
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28
  },
  radius: {
    md: 16,
    lg: 22
  },
  shadow: {
    card: {
      shadowColor: "rgba(102, 82, 63, 0.14)",
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 1,
      shadowRadius: 28,
      elevation: 6
    }
  }
} as const;
