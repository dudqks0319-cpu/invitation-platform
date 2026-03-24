export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT ?? "default-salt";
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}${salt}`);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}
