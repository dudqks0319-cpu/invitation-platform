import { getPublicInvitationUrl } from "./web-links";

export function createInvitationShareMessage(slug: string, title: string) {
  const url = getPublicInvitationUrl(slug);
  const normalizedTitle = title.trim() || "오삼오삼 초대장";

  return {
    title: normalizedTitle,
    message: `${normalizedTitle}\n초대장을 확인해 주세요.\n${url}`
  };
}
