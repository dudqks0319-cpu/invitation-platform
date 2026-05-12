export async function copyTextWithFallback(value: string, fallbackMessage = "아래 내용을 복사해 주세요.") {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API is unavailable");
    }

    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    window.prompt(fallbackMessage, value);
    return false;
  }
}
