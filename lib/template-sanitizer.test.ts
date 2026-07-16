import { sanitizeTemplateMarkup } from "@/lib/template-sanitizer";

describe("sanitizeTemplateMarkup", () => {
  it("removes disallowed tags and event handlers", () => {
    const html = `
      <div class="card" onclick="alert('xss')">
        <script>alert('boom')</script>
        <p>안전한 본문</p>
        <img src="/images/genspark/cncrue0H.jpg" onerror="alert('xss')" />
      </div>
    `;

    const sanitized = sanitizeTemplateMarkup(html);

    expect(sanitized).toContain('<div class="card">');
    expect(sanitized).toContain("<p>안전한 본문</p>");
    expect(sanitized).toContain('src="/images/genspark/cncrue0H.jpg"');
    expect(sanitized).not.toContain("script");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("onerror");
  });

  it("drops dangerous inline style values but keeps safe style declarations", () => {
    const html = `
      <div style="background: url(javascript:alert(1)); color: red;">bad</div>
      <div style="color: #333; font-size: 20px;">good</div>
    `;

    const sanitized = sanitizeTemplateMarkup(html);

    expect(sanitized).toContain(">bad</div>");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).toContain('style="color: #333; font-size: 20px;"');
  });

  it("keeps bounded image loading hints and drops them from other elements", () => {
    const html = `
      <img src="/images/card.png" loading="lazy" decoding="async" />
      <img src="/images/bad.png" loading="immediate" decoding="script" />
      <div loading="lazy" decoding="async">본문</div>
    `;

    const sanitized = sanitizeTemplateMarkup(html);

    expect(sanitized).toContain('loading="lazy"');
    expect(sanitized).toContain('decoding="async"');
    expect(sanitized).not.toContain("immediate");
    expect(sanitized).not.toContain("script");
    expect(sanitized).toContain("<div>본문</div>");
  });
});
