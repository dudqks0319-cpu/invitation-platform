export type TemplatePreset = {
  id: string;
  category: string;
  name: string;
  badge: string;
  desc: string;
  tags: string[];
  html: string;
};

function imageOnly(className: string, src: string) {
  return `<div class="${className} tmpl-standalone-art">
    <img class="tmpl-card-image" src="${src}" alt="" loading="lazy" decoding="async" />
  </div>`;
}

export const templates: TemplatePreset[] = [
  {
    id: "wedding-flower-garden",
    category: "wedding",
    name: "플라워 가든",
    badge: "결혼식",
    desc: "화사한 플로럴 아치 웨딩 초대장",
    tags: ["#플로럴", "#로맨틱", "#세로형"],
    html: imageOnly("tmpl-character-card wedding-flower-garden", "/images/highres/wedding/flower-garden.svg")
  },
  {
    id: "wedding-minimal-line",
    category: "wedding",
    name: "미니멀 라인",
    badge: "결혼식",
    desc: "여백이 넓고 단정한 라인드로잉 웨딩 초대장",
    tags: ["#미니멀", "#라인드로잉", "#세로형"],
    html: imageOnly("tmpl-character-card wedding-minimal-line", "/images/highres/wedding/minimal-line.svg")
  },
  {
    id: "wedding-ribbon-frame",
    category: "wedding",
    name: "리본 프레임",
    badge: "결혼식",
    desc: "리본 장식과 부드러운 파스텔 톤의 웨딩 카드",
    tags: ["#리본", "#클래식", "#세로형"],
    html: imageOnly("tmpl-character-card wedding-ribbon-frame", "/images/highres/wedding/ribbon-frame.svg")
  }
];

export const templateCategories = [
  { key: "wedding", label: "결혼식", emoji: "💍" }
] as const;

export function getTemplatesByCategory(category: string) {
  return templates.filter((template) => template.category === category);
}
