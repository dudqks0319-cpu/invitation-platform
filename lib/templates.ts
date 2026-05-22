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
    id: "wedding-classic",
    category: "wedding",
    name: "로즈 프레임",
    badge: "결혼식",
    desc: "로즈 가득한 보더 프레임 위에 정갈하게 올리는 클래식 웨딩 카드",
    tags: ["#로즈", "#프레임", "#클래식"],
    html: imageOnly("tmpl-character-card wedding-classic", "/images/custom/wedding/wedding-01.jpeg")
  },
  {
    id: "wedding-nature",
    category: "wedding",
    name: "골드 플로럴 보더",
    badge: "결혼식",
    desc: "섬세한 골드 라인과 플라워 코너가 어우러진 포멀 웨딩 초대장",
    tags: ["#골드", "#포멀", "#보더"],
    html: imageOnly("tmpl-character-card wedding-nature", "/images/custom/wedding/wedding-05.jpeg")
  },
  {
    id: "wedding-rose-gold",
    category: "wedding",
    name: "로즈 골드 보더",
    badge: "결혼식",
    desc: "로즈 포인트와 골드 라인이 어우러진 화사한 웨딩 보더 카드",
    tags: ["#로즈골드", "#보더", "#우아함"],
    html: imageOnly("tmpl-character-card wedding-rose-gold", "/images/custom/wedding/wedding-06.jpeg")
  },
  {
    id: "wedding-photo-minimal",
    category: "wedding",
    name: "아이보리 가든",
    badge: "결혼식",
    desc: "아이보리 종이 질감과 보태니컬 프레임이 은은한 웨딩 카드",
    tags: ["#아이보리", "#가든", "#여백"],
    html: imageOnly("tmpl-character-card wedding-photo-minimal", "/images/custom/wedding/wedding-07.png")
  },
  {
    id: "wedding-blush-petal",
    category: "wedding",
    name: "플라워 테라스",
    badge: "결혼식",
    desc: "꽃 장식과 야외 테라스 풍경이 어우러진 화사한 웨딩 카드",
    tags: ["#테라스", "#플라워", "#야외"],
    html: imageOnly("tmpl-character-card wedding-blush-petal", "/images/custom/wedding/wedding-08.png")
  },
  {
    id: "wedding-traditional-knot",
    category: "wedding",
    name: "스카이 가든",
    badge: "결혼식",
    desc: "맑은 하늘과 화이트 플라워 아치가 열려 있는 야외 웨딩 카드",
    tags: ["#스카이", "#가든", "#플라워"],
    html: imageOnly("tmpl-character-card wedding-traditional-knot", "/images/custom/wedding/wedding-09.png")
  },
  {
    id: "wedding-envelope-photo",
    category: "wedding",
    name: "채플 가든",
    badge: "결혼식",
    desc: "화이트 채플과 풍성한 정원 플라워가 차분한 웨딩 카드",
    tags: ["#채플", "#정원", "#화이트"],
    html: imageOnly("tmpl-character-card wedding-envelope-photo", "/images/custom/wedding/wedding-10.png")
  },
  {
    id: "wedding-gold-botanical",
    category: "wedding",
    name: "베일 아치",
    badge: "결혼식",
    desc: "아이보리 커튼과 플라워 아치가 고급스럽게 감싸는 웨딩 카드",
    tags: ["#아치", "#베일", "#플라워"],
    html: imageOnly("tmpl-character-card wedding-gold-botanical", "/images/custom/wedding/wedding-11.png")
  },
  {
    id: "wedding-illustration-curtain",
    category: "wedding",
    name: "스카이 채플",
    badge: "결혼식",
    desc: "푸른 하늘과 하얀 커튼, 플라워 장식이 시원한 웨딩 카드",
    tags: ["#스카이", "#커튼", "#채플"],
    html: imageOnly("tmpl-character-card wedding-illustration-curtain", "/images/custom/wedding/wedding-12.png")
  },
  {
    id: "wedding-botanical-vertical",
    category: "wedding",
    name: "화이트 아치",
    badge: "결혼식",
    desc: "화이트 아치와 보태니컬 플라워가 차분하게 둘러주는 웨딩 카드",
    tags: ["#화이트", "#아치", "#보태니컬"],
    html: imageOnly("tmpl-character-card wedding-botanical-vertical", "/images/custom/wedding/wedding-13.png")
  },
  {
    id: "wedding-photo-overlay",
    category: "wedding",
    name: "섀도우 아치",
    badge: "결혼식",
    desc: "빛과 그림자가 드리운 아치 공간으로 고급스러운 여백을 살린 웨딩 카드",
    tags: ["#아치", "#섀도우", "#프리미엄"],
    html: imageOnly("tmpl-character-card wedding-photo-overlay", "/images/custom/wedding/wedding-14.png")
  },
  {
    id: "wedding-photo-hero",
    category: "wedding",
    name: "로즈 아치",
    badge: "결혼식",
    desc: "은은한 골드 아치와 장미 플라워가 우아하게 감싸는 웨딩 카드",
    tags: ["#로즈", "#아치", "#골드"],
    html: imageOnly("tmpl-character-card wedding-photo-hero", "/images/custom/wedding/wedding-15.png")
  },
  {
    id: "wedding-green-arch",
    category: "wedding",
    name: "폴라로이드 카드",
    badge: "결혼식",
    desc: "폴라로이드 프레임 안에 초대 문구를 넣기 좋은 미니멀 웨딩 카드",
    tags: ["#폴라로이드", "#미니멀", "#프레임"],
    html: imageOnly("tmpl-character-card wedding-green-arch", "/images/custom/wedding/wedding-16.png")
  },
  {
    id: "dol-cute",
    category: "dol",
    name: "테디 벌룬",
    badge: "돌잔치",
    desc: "곰돌이와 풍선이 반겨주는 따뜻한 노란빛 돌잔치 카드",
    tags: ["#곰돌이", "#풍선", "#옐로우"],
    html: imageOnly("tmpl-character-card dol-cute", "/images/custom/dol/dol-card-01.jpeg")
  },
  {
    id: "hwangap-classic",
    category: "hwangap",
    name: "은은한 금빛",
    badge: "환갑잔치",
    desc: "차분한 금빛 여백과 전통 무드가 살아 있는 환갑 초대장",
    tags: ["#금빛", "#전통", "#품격"],
    html: imageOnly("tmpl-character-card hwangap-classic", "/images/custom/hwangap/hwangap-01.jpeg")
  },
  {
    id: "bridal-pink",
    category: "bridal",
    name: "핑크 드림",
    badge: "브라이덜샤워",
    desc: "핑크 포인트와 리본 장식이 사랑스러운 브라이덜샤워 카드",
    tags: ["#핑크", "#리본", "#샤워"],
    html: imageOnly("tmpl-character-card bridal-pink", "/images/custom/bridal/bridal-01.jpeg")
  },
  {
    id: "birthday-fun",
    category: "birthday",
    name: "테디 생일",
    badge: "생일파티",
    desc: "곰돌이와 풍선이 함께하는 밝고 포근한 생일파티 카드",
    tags: ["#곰돌이", "#풍선", "#파티"],
    html: imageOnly("tmpl-character-card birthday-fun", "/images/custom/birthday/birthday-01.jpeg")
  },
  {
    id: "house-warm",
    category: "housewarming",
    name: "그린 집들이",
    badge: "집들이",
    desc: "새 보금자리를 알리는 따뜻한 그린 집들이 초대장",
    tags: ["#집들이", "#그린", "#따뜻한"],
    html: imageOnly("tmpl-character-card house-warm", "/images/genspark/6XcxVcVH.jpg")
  },
  {
    id: "baby-shower",
    category: "baby",
    name: "블루 스카이",
    badge: "베이비샤워",
    desc: "하늘빛 파란색의 포근한 베이비샤워 초대장",
    tags: ["#베이비", "#블루", "#포근"],
    html: imageOnly("tmpl-character-card baby-shower", "/images/genspark/zIB8bEWC.jpg")
  },
  {
    id: "graduation",
    category: "graduation",
    name: "블루 졸업",
    badge: "졸업파티",
    desc: "네이비 블루의 격조 있는 졸업 파티 초대장",
    tags: ["#졸업", "#네이비", "#격식"],
    html: imageOnly("tmpl-character-card graduation", "/images/genspark/Xdz6nHcL.jpg")
  },
  {
    id: "business",
    category: "business",
    name: "비즈니스 블루",
    badge: "비즈니스",
    desc: "신뢰와 전문성을 담은 비즈니스 행사 초대장",
    tags: ["#비즈니스", "#전문", "#행사"],
    html: imageOnly("tmpl-character-card business", "/images/genspark/xpx0zLPW.jpg")
  }
];

export const templateCategories = [
  { key: "wedding", label: "결혼식", emoji: "💍" },
  { key: "dol", label: "돌잔치", emoji: "🎂" },
  { key: "hwangap", label: "환갑잔치", emoji: "🎊" },
  { key: "bridal", label: "브라이덜샤워", emoji: "👰" },
  { key: "birthday", label: "생일파티", emoji: "🎉" },
  { key: "housewarming", label: "집들이", emoji: "🏠" },
  { key: "baby", label: "베이비샤워", emoji: "👶" },
  { key: "graduation", label: "졸업파티", emoji: "🎓" },
  { key: "business", label: "비즈니스", emoji: "📋" }
] as const;

export function getTemplatesByCategory(category: string) {
  return templates.filter((template) => template.category === category);
}
