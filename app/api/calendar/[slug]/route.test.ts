import { vi } from "vitest";
import { GET } from "@/app/api/calendar/[slug]/route";

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => null
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => null
}));

describe("GET /api/calendar/[slug]", () => {
  it("returns a downloadable ICS file for a public demo invitation", async () => {
    const response = await GET(
      new Request("https://invitehub.test/api/calendar/kim-lee-demo"),
      { params: Promise.resolve({ slug: "kim-lee-demo" }) }
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="kim-lee-demo.ics"');
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("SUMMARY:김 & 이 결혼식 초대장");
    expect(body).toContain("DTSTART:20260412T050000Z");
    expect(body).toContain("https://invitehub.test/invitations/kim-lee-demo");
  });

  it("returns 404 for unknown slugs", async () => {
    const response = await GET(
      new Request("https://invitehub.test/api/calendar/missing"),
      { params: Promise.resolve({ slug: "missing" }) }
    );

    expect(response.status).toBe(404);
  });
});
