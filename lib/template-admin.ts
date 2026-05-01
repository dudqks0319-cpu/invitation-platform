export function parseTemplateAdminEmails(value: string) {
  return value
    .split(/[,\s]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getTemplateAdminEmails() {
  return parseTemplateAdminEmails(process.env.TEMPLATE_ADMIN_EMAILS ?? "");
}

export function isTemplateAdminEmail(
  email: string | null | undefined,
  options: { allowlist?: string[]; nodeEnv?: string } = {}
) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const allowlist = options.allowlist ?? getTemplateAdminEmails();
  if (allowlist.length > 0) {
    return allowlist.includes(normalizedEmail);
  }

  return (options.nodeEnv ?? process.env.NODE_ENV) !== "production";
}

