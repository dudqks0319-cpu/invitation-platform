export function normalizeSupportEmail(value: string | undefined) {
  const email = (value ?? "").trim();

  if (!email) {
    return "";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "";
  }

  return email;
}

export function getSupportEmail() {
  return normalizeSupportEmail(process.env.NEXT_PUBLIC_SUPPORT_EMAIL);
}
