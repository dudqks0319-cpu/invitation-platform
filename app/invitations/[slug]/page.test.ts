import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import type { Metadata } from "next";
import GlobalError from "@/app/error";
import {
  buildPublicInvitationMetadata,
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

  it("renders user-friendly loading and error fallbacks", () => {
    const reset = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { unmount } = render(createElement(Loading));
    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
    unmount();

    render(createElement(GlobalError, { error: new Error("boom"), reset }));
    expect(screen.getByText("앗, 문제가 발생했어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it("renders a user-friendly not-found page", () => {
    render(createElement(NotFound));
    expect(screen.getByText("페이지를 찾을 수 없어요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로 돌아가기" })).toBeInTheDocument();
  });
});
