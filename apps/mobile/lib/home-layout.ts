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
