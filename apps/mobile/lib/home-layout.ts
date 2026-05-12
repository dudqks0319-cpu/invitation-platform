type HomeLayoutUser = {
  id?: string;
  is_anonymous?: boolean;
} | null;

export type MobileHomeLayoutMode = "resume-first" | "templates-first";

export function getMobileHomeLayoutMode(
  status: string,
  user: HomeLayoutUser
): MobileHomeLayoutMode {
  if (status === "authenticated" && user?.id && !user.is_anonymous) {
    return "resume-first";
  }

  return "templates-first";
}

export function getTemplateScrollTargetY(templateAreaY: number, offset = 12) {
  return Math.max(templateAreaY - offset, 0);
}

export function getMobileHomeHeaderAction(status: string, user: HomeLayoutUser) {
  if (status === "authenticated" && user?.id && !user.is_anonymous) {
    return {
      accessibilityLabel: "내 초대장 목록",
      label: "내 초대장",
      pathname: "/(tabs)/my-invitations" as const
    };
  }

  return {
    accessibilityLabel: "로그인",
    label: "로그인",
    pathname: "/login" as const
  };
}
