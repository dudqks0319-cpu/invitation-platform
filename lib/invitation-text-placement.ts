export const INVITATION_TEXT_PLACEMENTS = [
  { value: "top", label: "상단 여백" },
  { value: "center", label: "중앙" },
  { value: "bottom", label: "하단 여백" },
  { value: "left", label: "왼쪽 여백" },
  { value: "right", label: "오른쪽 여백" }
] as const;

export type InvitationTextPlacement = (typeof INVITATION_TEXT_PLACEMENTS)[number]["value"];

export type InvitationTextPlacementFrame = {
  align: "left" | "center" | "right";
  label: string;
  width: number;
  x: number;
  y: number;
};

const placementFrames: Record<InvitationTextPlacement, InvitationTextPlacementFrame> = {
  top: { align: "center", label: "상단 여백", width: 72, x: 50, y: 20 },
  center: { align: "center", label: "중앙", width: 68, x: 50, y: 48 },
  bottom: { align: "center", label: "하단 여백", width: 74, x: 50, y: 75 },
  left: { align: "left", label: "왼쪽 여백", width: 48, x: 12, y: 50 },
  right: { align: "right", label: "오른쪽 여백", width: 48, x: 88, y: 50 }
};

export function normalizeInvitationTextPlacement(value: unknown): InvitationTextPlacement {
  return INVITATION_TEXT_PLACEMENTS.some((placement) => placement.value === value)
    ? (value as InvitationTextPlacement)
    : "top";
}

export function getInvitationTextPlacementFrame(value: unknown) {
  return placementFrames[normalizeInvitationTextPlacement(value)];
}

export function getInvitationTextPlacementTransform(align: InvitationTextPlacementFrame["align"]) {
  if (align === "left") {
    return "translate(0, -50%)";
  }

  if (align === "right") {
    return "translate(-100%, -50%)";
  }

  return "translate(-50%, -50%)";
}
