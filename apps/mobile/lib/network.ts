type Fetcher = typeof fetch;

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { fetcher?: Fetcher; timeoutMs?: number } = {}
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);

  try {
    return await (options.fetcher ?? fetch)(input, {
      ...init,
      signal: controller.signal
    });
  } catch (caught) {
    if (caught instanceof Error && caught.name === "AbortError") {
      throw new Error("서버 응답이 지연되고 있습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.");
    }
    throw caught;
  } finally {
    clearTimeout(timeout);
  }
}
