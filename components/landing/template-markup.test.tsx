import { renderToStaticMarkup } from "react-dom/server";
import { TemplateMarkup } from "@/components/landing/template-markup";

describe("TemplateMarkup", () => {
  it("renders sanitized internal template HTML", () => {
    document.body.innerHTML = renderToStaticMarkup(
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

    expect(document.body.textContent).toContain("테스트 카드");
    expect(document.querySelector(".safe")).not.toHaveAttribute("onclick");
    expect(document.querySelector("script")).toBeNull();
  });

  it("renders mapped artwork layers for supported categories", () => {
    document.body.innerHTML = renderToStaticMarkup(
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
    expect(document.body.textContent).toContain("초대장 문구");
  });
});
