export const theme = {
  colors: {
    primary: "#2B2824",
    primaryLight: "#EFE8DF",
    primaryDark: "#2B2824",
    accent: "#9A7D56",
    bgCream: "#F6F2ED",
    bgLight: "#F8F5F0",
    background: "#F6F2ED",
    surface: "#FFFDF9",
    surfaceSoft: "#F0EAE2",
    border: "#E4D9CE",
    text: "#2B2824",
    muted: "#6D6257",
    textLight: "#9B9085",
    blush: "rgba(215,170,162,0.18)",
    eucalyptus: "rgba(141,152,120,0.16)",
    success: "#547A61",
    shadow: "rgba(62,49,37,0.09)",
    flower: "#D7AAA2",
    leaf: "#8D9878",
    gold: "#C6A46E",
    charcoal: "#282726"
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
    md: 12,
    lg: 18,
    pill: 50
  },
  shadow: {
    card: {
      shadowColor: "rgba(62,49,37,0.09)",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 26,
      elevation: 4
    },
    heroButton: {
      shadowColor: "rgba(43,40,36,0.18)",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 18,
      elevation: 4
    }
  }
} as const;
