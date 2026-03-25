import { render, screen } from "@testing-library/react";
import { TemplateMarkup } from "@/components/landing/template-markup";

describe("TemplateMarkup", () => {
  it("renders sanitized internal template HTML", () => {
    render(
      <TemplateMarkup
        template={{
          id: "test",
          category: "wedding",
          name: "테스트",
          badge: "테스트",
          desc: "테스트",
          tags: [],
          html: `<div class="safe" onclick="alert('xss')"><p>테스트 카드</p><script>alert('xss')</script></div>`
        }}
      />
    );

    const text = screen.getByText("테스트 카드");
    expect(text).toBeInTheDocument();
    expect(text.closest(".safe")).not.toHaveAttribute("onclick");
    expect(document.querySelector("script")).toBeNull();
  });

  it("renders mapped artwork layers for supported categories", () => {
    render(
      <TemplateMarkup
        template={{
          id: "wedding-classic",
          category: "wedding",
          name: "클래식 로즈",
          badge: "결혼식",
          desc: "테스트",
          tags: [],
          html: `<div class="safe"><p>초대장 문구</p></div>`
        }}
      />
    );

    const artworkImages = document.querySelectorAll(".template-markup-enhanced img");
    expect(artworkImages.length).toBeGreaterThan(0);
    expect(screen.getByText("초대장 문구")).toBeInTheDocument();
  });
});
