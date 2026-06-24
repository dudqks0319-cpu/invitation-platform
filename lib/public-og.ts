import {
  formatEventDateTime,
  formatVenue,
  type InvitationDraftPayload
} from "@/lib/invitation-payload";

export const PUBLIC_OG_IMAGE_SIZE = {
  width: 1200,
  height: 630
} as const;

type OgPalette = {
  accentColor: string;
  backgroundColor: string;
  mutedTextColor: string;
  textColor: string;
};

export type PublicOgImageData = OgPalette & {
  categoryLabel: string;
  eventDate: string;
  message: string;
  names: string;
  title: string;
  venue: string;
};

const categoryLabels: Record<string, string> = {
  wedding: "Wedding Invitation",
  dol: "First Birthday",
  hwangap: "Family Celebration",
  bridal: "Bridal Shower",
  birthday: "Birthday Party",
  housewarming: "Housewarming",
  baby: "Baby Shower",
  graduation: "Graduation",
  business: "Business Invitation"
};

const categoryPalettes: Record<string, OgPalette> = {
  wedding: {
    backgroundColor: "#FFF7F2",
    accentColor: "#BD8C75",
    textColor: "#2C2521",
    mutedTextColor: "#75665E"
  },
  dol: {
    backgroundColor: "#FFF9DD",
    accentColor: "#D4A542",
    textColor: "#31291A",
    mutedTextColor: "#786A44"
  },
  hwangap: {
    backgroundColor: "#FBF6ED",
    accentColor: "#9C654D",
    textColor: "#2D241E",
    mutedTextColor: "#79665A"
  },
  bridal: {
    backgroundColor: "#FFF7FB",
    accentColor: "#C8849B",
    textColor: "#32232A",
    mutedTextColor: "#80606C"
  },
  birthday: {
    backgroundColor: "#F0FBFF",
    accentColor: "#5FAECE",
    textColor: "#1E2D33",
    mutedTextColor: "#55717C"
  },
  housewarming: {
    backgroundColor: "#FBFAF5",
    accentColor: "#778F69",
    textColor: "#252A20",
    mutedTextColor: "#647059"
  },
  baby: {
    backgroundColor: "#F7FBFF",
    accentColor: "#739ACA",
    textColor: "#202938",
    mutedTextColor: "#65758B"
  },
  graduation: {
    backgroundColor: "#F8F9FC",
    accentColor: "#425B8F",
    textColor: "#1D2537",
    mutedTextColor: "#5B667B"
  },
  business: {
    backgroundColor: "#F5F7FF",
    accentColor: "#2B62D9",
    textColor: "#17213A",
    mutedTextColor: "#5A6680"
  }
};

const defaultPalette = categoryPalettes.wedding;

function normalizeHexColor(value: string | undefined, fallback: string) {
  return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function readPaletteColor(
  palette: Record<string, string>,
  keys: string[],
  fallback: string
) {
  const value = keys.map((key) => palette[key]).find(Boolean);
  return normalizeHexColor(value, fallback);
}

function trimForOg(value: string, limit: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized;
}

export function buildPublicOgImagePath(slug: string) {
  return `/api/og/${encodeURIComponent(slug)}`;
}

export function buildPublicOgImageData({
  payload,
  title
}: {
  payload: InvitationDraftPayload;
  title?: string;
}): PublicOgImageData {
  const categoryPalette = categoryPalettes[payload.category] ?? defaultPalette;
  const templatePalette = payload.templateSnapshot?.palette ?? {};
  const names = [payload.groomName, payload.brideName].filter(Boolean).join(" & ");

  return {
    title: trimForOg(title || payload.title || "InviteHub 초대장", 44),
    names: trimForOg(names || payload.title || "InviteHub", 34),
    message: trimForOg(payload.message || `${title || payload.title} 안내`, 88),
    eventDate: trimForOg(formatEventDateTime(payload.eventDateTime), 40),
    venue: trimForOg(formatVenue(payload), 58),
    categoryLabel: categoryLabels[payload.category] ?? "Invitation",
    backgroundColor: readPaletteColor(
      templatePalette,
      ["backgroundHex", "background", "backgroundColor", "bg"],
      categoryPalette.backgroundColor
    ),
    accentColor: readPaletteColor(
      templatePalette,
      ["accentHex", "accent", "accentColor", "primary"],
      categoryPalette.accentColor
    ),
    textColor: readPaletteColor(
      templatePalette,
      ["primaryTextHex", "text", "textColor", "foreground"],
      categoryPalette.textColor
    ),
    mutedTextColor: readPaletteColor(
      templatePalette,
      ["secondaryTextHex", "muted", "mutedTextColor", "subtext"],
      categoryPalette.mutedTextColor
    )
  };
}
