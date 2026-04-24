export const theme = {
  colors: {
    primary: "#C9935A",
    primaryLight: "#F0DEC8",
    primaryDark: "#A5743D",
    accent: "#8B7355",
    ink: "#29231D",
    rose: "#D9A69A",
    sage: "#7A8B6F",
    gold: "#B88645",
    paper: "#FFFDF8",
    bgCream: "#FDF8F3",
    bgLight: "#FAF7F4",
    background: "#FDF8F3",
    surface: "#FFFFFF",
    surfaceSoft: "#FAF7F4",
    border: "#E8DDD3",
    text: "#2C2C2C",
    muted: "#666666",
    textLight: "#999999",
    blush: "rgba(201,147,90,0.12)",
    eucalyptus: "rgba(201,147,90,0.08)",
    success: "#547A61",
    shadow: "rgba(0,0,0,0.08)"
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    pill: 50
  },
  shadow: {
    card: {
      shadowColor: "rgba(0,0,0,0.08)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 4
    },
    heroButton: {
      shadowColor: "rgba(201,147,90,0.4)",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 5
    }
  }
} as const;
