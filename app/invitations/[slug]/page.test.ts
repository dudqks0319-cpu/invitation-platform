import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Metadata } from "next";
import GlobalError from "@/app/error";
import {
  buildPublicInvitationMetadata,
  loadApprovedGuestbookEntries,
  logInvitationView,
  resolveRequestOrigin
} from "@/app/invitations/[slug]/page";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

describe("public invitation page helpers", () => {
  it("builds absolute metadata for sharing", () => {
    const metadata = buildPublicInvitationMetadata({
      title: "김 & 이 결혼식 초대장",
      description: "두 사람의 시작을 함께 축복해 주세요.",
      shareUrl: "https://invitehub.test/invitations/kim-lee-demo",
      imageUrl: "https://invitehub.test/images/genspark/cncrue0H.jpg"
    }) as Metadata;

    expect(metadata.title).toBe("김 & 이 결혼식 초대장");
    expect(metadata.description).toBe("두 사람의 시작을 함께 축복해 주세요.");
    expect(metadata.openGraph?.url).toBe("https://invitehub.test/invitations/kim-lee-demo");
    const images = Array.isArray(metadata.openGraph?.images) ? metadata.openGraph.images : [];
    const firstImage = images[0];
    const normalizedImage =
      typeof firstImage === "string"
        ? firstImage
        : firstImage instanceof URL
          ? firstImage.toString()
          : firstImage?.url;
    expect(normalizedImage).toBe(
      "https://invitehub.test/images/genspark/cncrue0H.jpg"
    );
  });

  it("prefers forwarded headers when resolving origin", () => {
    const headersLike = {
      get(name: string) {
        return {
          "x-forwarded-host": "invitehub.co.kr",
          "x-forwarded-proto": "https"
        }[name] ?? null;
      }
    };

    expect(resolveRequestOrigin(headersLike)).toBe("https://invitehub.co.kr");
  });

  it("avoids duplicate view logs for the same invitation and user agent within the cooldown window", async () => {
    const insert = vi.fn(async () => ({ error: null }));
    const recentQuery = {
      eq() {
        return this;
      },
      gte() {
        return this;
      },
      limit() {
        return Promise.resolve({
          data: [{ id: 1 }],
          error: null
        });
      }
    };

    const admin = {
      from(table: string) {
        if (table === "view_logs") {
          return {
            select() {
              return recentQuery;
            },
            insert
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    };

    await logInvitationView(admin, "invitation-1", "test-agent");

    expect(insert).not.toHaveBeenCalled();
  });

  it("returns an empty guestbook when the admin client is unavailable", async () => {
    await expect(loadApprovedGuestbookEntries(null, "invitation-1")).resolves.toEqual([]);
  });

  it("loads approved guestbook entries through the admin client", async () => {
    const limit = vi.fn(async () => ({
      data: [
        {
          id: "guestbook-1",
          nickname: "하객",
          message: "축하합니다",
          approved: true,
          created_at: "2026-05-08T00:00:00.000Z"
        }
      ],
      error: null
    }));
    const order = vi.fn(() => ({ limit }));
    const approvedEq = vi.fn(() => ({ order }));
    const invitationEq = vi.fn(() => ({ eq: approvedEq }));
    const select = vi.fn(() => ({ eq: invitationEq }));
    const from = vi.fn(() => ({ select }));

    const entries = await loadApprovedGuestbookEntries({ from }, "invitation-1");

    expect(from).toHaveBeenCalledWith("guestbook_entries");
    expect(invitationEq).toHaveBeenCalledWith("invitation_id", "invitation-1");
    expect(approvedEq).toHaveBeenCalledWith("approved", true);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(limit).toHaveBeenCalledWith(20);
    expect(entries).toHaveLength(1);
  });

  it("returns an empty guestbook when the guestbook query fails", async () => {
    const limit = vi.fn(async () => ({
      data: null,
      error: { message: "database unavailable" }
    }));
    const order = vi.fn(() => ({ limit }));
    const approvedEq = vi.fn(() => ({ order }));
    const invitationEq = vi.fn(() => ({ eq: approvedEq }));
    const select = vi.fn(() => ({ eq: invitationEq }));
    const from = vi.fn(() => ({ select }));

    await expect(loadApprovedGuestbookEntries({ from }, "invitation-1")).resolves.toEqual([]);
  });

  it("renders user-friendly loading and error fallbacks", () => {
    const reset = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    document.body.innerHTML = renderToStaticMarkup(createElement(Loading));
    expect(document.body.textContent).toContain("불러오는 중...");

    document.body.innerHTML = renderToStaticMarkup(createElement(GlobalError, { error: new Error("boom"), reset }));
    expect(document.body.textContent).toContain("앗, 문제가 발생했어요");
    expect(document.body.textContent).toContain("다시 시도");
    consoleErrorSpy.mockRestore();
  });

  it("renders a user-friendly not-found page", () => {
    document.body.innerHTML = renderToStaticMarkup(createElement(NotFound));
    expect(document.body.textContent).toContain("페이지를 찾을 수 없어요");
    expect(document.body.textContent).toContain("홈으로 돌아가기");
  });
});
