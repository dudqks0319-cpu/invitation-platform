/* eslint-disable @next/next/no-img-element */

import type { TemplatePreset } from "@/lib/templates";
import { sanitizeTemplateMarkup } from "@/lib/template-sanitizer";
import { getTemplateImages } from "@/lib/template-images";

export function TemplateMarkup({
  template,
  className = "",
  variant = "full"
}: {
  template: TemplatePreset;
  className?: string;
  variant?: "full" | "browser";
}) {
  const images = getTemplateImages(template.category);
  const sanitizedHtml = sanitizeTemplateMarkup(template.html);
  const isStandaloneArtwork = sanitizedHtml.includes("tmpl-standalone-art");
  const hasImages = Boolean(
    images.topDecor || images.bottomDecor || images.divider || images.background || images.frame
  );

  if (variant === "browser" || isStandaloneArtwork) {
    return (
      <div
        className={`${variant === "browser" ? "template-markup-browser" : "template-markup-plain"} ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  if (!hasImages) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
  }

  return (
    <div className={`template-markup-enhanced ${className}`.trim()}>
      {images.background ? <img alt="" aria-hidden="true" className="tmpl-bg-texture" src={images.background} /> : null}
      {images.topDecor ? <img alt="" aria-hidden="true" className="tmpl-top-decor" src={images.topDecor} /> : null}
      {images.frame ? <img alt="" aria-hidden="true" className="tmpl-frame" src={images.frame} /> : null}
      <div className="tmpl-text-content" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      {images.divider ? <img alt="" aria-hidden="true" className="tmpl-divider" src={images.divider} /> : null}
      {images.bottomDecor ? <img alt="" aria-hidden="true" className="tmpl-bottom-decor" src={images.bottomDecor} /> : null}
    </div>
  );
}
