#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_ROOT = path.resolve(__dirname, "../assets/template-previews/generated");
const WIDTH = 900;
const HEIGHT = 1440;
const CARD_RADIUS = 56;

const templateSpecs = [
  { id: "wedding-classic", category: "wedding", title: "로즈 프레임", subtitle: "결혼식에 초대합니다", accent: "rose", motif: "floral-corners" },
  { id: "wedding-modern", category: "wedding", title: "유칼립투스 아치", subtitle: "소중한 날에 함께해 주세요", accent: "sage", motif: "arch-botanical" },
  { id: "wedding-floral", category: "wedding", title: "미니멀 블룸", subtitle: "두 사람의 시작을 알립니다", accent: "peach", motif: "mini-bouquet" },
  { id: "wedding-minimal", category: "wedding", title: "코너 블룸", subtitle: "따뜻한 축복을 기다립니다", accent: "cream", motif: "corner-bloom" },
  { id: "wedding-nature", category: "wedding", title: "골드 플로럴 보더", subtitle: "정중히 모십니다", accent: "gold", motif: "gold-border" },
  { id: "wedding-rose-gold", category: "wedding", title: "로즈 골드 보더", subtitle: "우리의 예식에 초대합니다", accent: "rose-gold", motif: "ribbon-frame" },
  { id: "dol-cute", category: "dol", title: "테디 벌룬", subtitle: "첫 생일에 초대합니다", accent: "butter", motif: "bear-balloons" },
  { id: "dol-pastel", category: "dol", title: "리본 크라운", subtitle: "첫 생일에 초대합니다", accent: "lavender", motif: "crown-ribbon" },
  { id: "dol-blue", category: "dol", title: "우주 로켓", subtitle: "첫 생일에 초대합니다", accent: "sky", motif: "moon-stars" },
  { id: "dol-nature", category: "dol", title: "골드 크라운", subtitle: "첫 생일에 초대합니다", accent: "champagne", motif: "premium-crown" },
  { id: "dol-gold", category: "dol", title: "케이크 파티", subtitle: "첫 생일에 초대합니다", accent: "apricot", motif: "cake-party" },
  { id: "hwangap-classic", category: "hwangap", title: "은은한 금빛", subtitle: "환갑연에 초대합니다", accent: "wine", motif: "knot-crest" },
  { id: "hwangap-modern", category: "hwangap", title: "전통 문양", subtitle: "환갑연에 초대합니다", accent: "jade", motif: "heritage-pattern" },
  { id: "hwangap-red", category: "hwangap", title: "레드 포인트", subtitle: "환갑연에 초대합니다", accent: "ruby", motif: "seal-band" },
  { id: "hwangap-floral", category: "hwangap", title: "플로럴 격조", subtitle: "환갑연에 초대합니다", accent: "orchid", motif: "orchid-border" },
  { id: "hwangap-hanja", category: "hwangap", title: "서예 정통", subtitle: "환갑연에 초대합니다", accent: "ink", motif: "calligraphy-scroll" },
  { id: "bridal-pink", category: "bridal", title: "핑크 드림", subtitle: "Bridal Shower", accent: "blush", motif: "bow-garden" },
  { id: "bridal-boho", category: "bridal", title: "보헤미안", subtitle: "Celebrate the bride", accent: "sand", motif: "boho-dried" },
  { id: "bridal-modern", category: "bridal", title: "블랙 럭셔리", subtitle: "Elegant bridal night", accent: "black", motif: "black-ribbon" },
  { id: "bridal-mint", category: "bridal", title: "민트 프레쉬", subtitle: "Fresh party for the bride", accent: "mint", motif: "mint-ribbon" },
  { id: "birthday-fun", category: "birthday", title: "테디 생일", subtitle: "생일파티에 초대합니다", accent: "ocean", motif: "birthday-teddy" },
  { id: "birthday-elegant", category: "birthday", title: "밤하늘 생일", subtitle: "생일파티에 초대합니다", accent: "midnight", motif: "birthday-night" },
  { id: "birthday-kids", category: "birthday", title: "케이크 파티", subtitle: "생일파티에 초대합니다", accent: "jungle", motif: "birthday-cake" },
  { id: "house-warm", category: "housewarming", title: "그린 집들이", subtitle: "집들이에 초대합니다", accent: "olive", motif: "home-plants" },
  { id: "house-modern", category: "housewarming", title: "모던 화이트", subtitle: "새 공간으로 초대합니다", accent: "stone", motif: "home-interior" },
  { id: "baby-shower", category: "baby", title: "블루 스카이", subtitle: "베이비샤워에 초대합니다", accent: "powder-blue", motif: "cloud-bear" },
  { id: "baby-pink", category: "baby", title: "핑크 베이비", subtitle: "베이비샤워에 초대합니다", accent: "powder-pink", motif: "star-mobile" },
  { id: "graduation", category: "graduation", title: "블루 졸업", subtitle: "졸업을 축하하는 자리에 초대합니다", accent: "navy", motif: "cap-laurel" },
  { id: "graduation-warm", category: "graduation", title: "골든 졸업", subtitle: "졸업을 축하하는 자리에 초대합니다", accent: "golden", motif: "medal-stage" },
  { id: "business", category: "business", title: "비즈니스 블루", subtitle: "Business Invitation", accent: "cobalt", motif: "conference-grid" },
  { id: "business-dark", category: "business", title: "다크 프리미엄", subtitle: "Executive Awards Night", accent: "midnight", motif: "award-spotlight" }
];

const categoryCopy = {
  wedding: { label: "WEDDING INVITATION", line1: "이준서 · 김은재", line2: "2026.09.20 SUN 12:30", line3: "라비에벨 가든홀" },
  dol: { label: "FIRST BIRTHDAY", line1: "서우의 첫 번째 생일", line2: "2026.11.14 SAT 11:00", line3: "루나 파티하우스" },
  hwangap: { label: "CELEBRATION", line1: "김정자 여사 환갑연", line2: "2026.10.03 SAT 17:00", line3: "청담 한옥연회장" },
  bridal: { label: "BRIDAL SHOWER", line1: "민지의 브라이덜샤워", line2: "2026.08.08 SAT 14:00", line3: "루프탑 플라워 라운지" },
  birthday: { label: "BIRTHDAY PARTY", line1: "신나는 생일파티", line2: "2026.07.18 SAT 15:00", line3: "키즈 플레이 가든" },
  housewarming: { label: "HOUSEWARMING", line1: "새 집에 놀러오세요", line2: "2026.06.28 SUN 13:00", line3: "성수동 테라스 홈" },
  baby: { label: "BABY SHOWER", line1: "우리 아기를 기다리며", line2: "2026.07.04 SAT 12:00", line3: "클라우드 브런치룸" },
  graduation: { label: "GRADUATION", line1: "졸업을 축하합니다", line2: "2027.02.20 SAT 16:00", line3: "센트럴 컨벤션 홀" },
  business: { label: "INVITATION", line1: "2026 Future Summit", line2: "2026.09.03 THU 18:30", line3: "서울 컨퍼런스 센터" }
};

const palette = {
  rose: ["#fff8f6", "#f8efe8", "#efc1c1", "#7f5a5a", "#d89595"],
  sage: ["#f7faf6", "#ecf2ec", "#a5b8a3", "#536152", "#d8e5d6"],
  peach: ["#fff9f4", "#fff0e5", "#f7c9b1", "#6e5d54", "#f4e2d4"],
  cream: ["#fffaf4", "#f6efe5", "#dbc8b1", "#67584f", "#f0e1d3"],
  gold: ["#fffaf3", "#f7ecda", "#c9a66b", "#665643", "#e5d2ae"],
  "rose-gold": ["#fff9f7", "#f7ebe6", "#cf9a8f", "#6e544f", "#edd2c9"],
  butter: ["#fffdf2", "#fff5cb", "#f2cd6d", "#705d2c", "#fff0a2"],
  lavender: ["#fffafd", "#f2ecff", "#cdb6f8", "#6e5f85", "#f9d6e7"],
  sky: ["#f5fbff", "#ddecff", "#89bfff", "#365b87", "#fff3b0"],
  champagne: ["#fffaf5", "#f5ebda", "#d6b471", "#6b5738", "#f9d8c9"],
  apricot: ["#fff9f3", "#ffe5cf", "#ffb06b", "#7d5631", "#ffe8ad"],
  wine: ["#fbf7f4", "#f2e8e3", "#8b4254", "#4d2934", "#d5b387"],
  jade: ["#f7f8f5", "#edf1ea", "#6b8c75", "#3f4c45", "#c9b283"],
  ruby: ["#fbf4f3", "#f6e8e7", "#a73f48", "#4e2024", "#d7b783"],
  orchid: ["#fbf8f4", "#f4ecdf", "#c8b28d", "#5a473d", "#8a6d72"],
  ink: ["#f8f4ee", "#efe7dc", "#1f1d20", "#4f4542", "#baa175"],
  blush: ["#fff9fb", "#fdeff4", "#f6c1cf", "#7c5d6a", "#ffd8df"],
  sand: ["#fcf9f4", "#f1e6d7", "#c69f7b", "#6a5648", "#d8b89d"],
  black: ["#121214", "#202225", "#f5f0ea", "#e3c79b", "#ffffff"],
  mint: ["#f6fffb", "#ddf7ef", "#88d8c0", "#49655d", "#ffd5df"],
  ocean: ["#effaff", "#d8f0ff", "#61b9e6", "#215777", "#ffca67"],
  bubble: ["#f7fdff", "#e8f7ff", "#73c7ef", "#245c79", "#b4ecff"],
  jungle: ["#f8fff6", "#dff0d7", "#7fc36f", "#395a33", "#ffc75a"],
  olive: ["#fbfaf5", "#eef3e5", "#8da37a", "#55624c", "#d7c3a1"],
  stone: ["#fcfcfb", "#f1efea", "#c5c0b8", "#5e5b56", "#d9d8d4"],
  "powder-blue": ["#f6fbff", "#e5f1ff", "#9ec7ff", "#47648a", "#fff1bf"],
  "powder-pink": ["#fff9fd", "#fdebf5", "#f3bfd7", "#7d5d6e", "#ffe7f1"],
  navy: ["#f8f9fc", "#edf1f8", "#203863", "#10213c", "#d8b15e"],
  golden: ["#fffaf4", "#f7ecd9", "#d5a84e", "#59452a", "#efe2c0"],
  cobalt: ["#f3f7ff", "#dde8ff", "#2b62d9", "#163465", "#87a8ff"],
  midnight: ["#0f1320", "#1b2235", "#d8dbe7", "#8ea0d3", "#d9b870"]
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const expanded = clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean;
  const [r, g, b] = [expanded.slice(0, 2), expanded.slice(2, 4), expanded.slice(4, 6)].map((chunk) =>
    Number.parseInt(chunk, 16)
  );
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function curvePath(points) {
  return points.map(([cmd, ...rest]) => `${cmd} ${rest.join(" ")}`).join(" ");
}

function floralCorner(x, y, scale, colors) {
  const petal = colors[2];
  const center = colors[3];
  const leaf = colors[1];
  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <path d="M -86 42 C -46 -22 10 -58 84 -76" fill="none" stroke="${rgba(center, 0.24)}" stroke-width="5" stroke-linecap="round" />
      <path d="M -66 64 C -28 8 28 -26 94 -36" fill="none" stroke="${rgba(center, 0.18)}" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="-62" cy="22" rx="34" ry="11" transform="rotate(-46 -62 22)" fill="${leaf}" opacity="0.78" />
      <ellipse cx="-34" cy="-18" rx="32" ry="10" transform="rotate(-42 -34 -18)" fill="${leaf}" opacity="0.82" />
      <ellipse cx="38" cy="-56" rx="30" ry="10" transform="rotate(-18 38 -56)" fill="${leaf}" opacity="0.72" />
      <ellipse cx="70" cy="-18" rx="28" ry="10" transform="rotate(26 70 -18)" fill="${leaf}" opacity="0.66" />
      <ellipse cx="28" cy="46" rx="28" ry="10" transform="rotate(38 28 46)" fill="${leaf}" opacity="0.72" />
      <circle cx="0" cy="0" r="28" fill="${petal}" opacity="0.24" />
      <circle cx="-22" cy="-10" r="28" fill="${petal}" opacity="0.5" />
      <circle cx="18" cy="-16" r="24" fill="${petal}" opacity="0.42" />
      <circle cx="-10" cy="20" r="26" fill="${petal}" opacity="0.38" />
      <circle cx="18" cy="20" r="24" fill="${petal}" opacity="0.46" />
      <circle cx="0" cy="0" r="11" fill="${center}" opacity="0.72" />
      <g transform="translate(72 -78) scale(0.64)">
        <circle cx="-18" cy="-8" r="18" fill="${petal}" opacity="0.36" />
        <circle cx="12" cy="-12" r="16" fill="${petal}" opacity="0.32" />
        <circle cx="-4" cy="16" r="17" fill="${petal}" opacity="0.34" />
        <circle cx="0" cy="0" r="7" fill="${center}" opacity="0.58" />
      </g>
      <g transform="translate(-76 54) scale(0.52)">
        <circle cx="-18" cy="-8" r="18" fill="${petal}" opacity="0.3" />
        <circle cx="12" cy="-12" r="16" fill="${petal}" opacity="0.28" />
        <circle cx="-4" cy="16" r="17" fill="${petal}" opacity="0.28" />
        <circle cx="0" cy="0" r="7" fill="${center}" opacity="0.48" />
      </g>
    </g>
  `;
}

function balloon(x, y, color, scale = 1) {
  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cx="0" cy="0" rx="28" ry="34" fill="${color}" />
      <path d="M -8 30 Q 0 44 8 30" fill="${color}" />
      <path d="M 0 34 C -6 56 14 70 6 96" fill="none" stroke="${rgba(color, 0.65)}" stroke-width="3" stroke-linecap="round" />
    </g>
  `;
}

function star(x, y, size, color, opacity = 1) {
  const d = curvePath([
    ["M", x, y - size],
    ["L", x + size * 0.28, y - size * 0.28],
    ["L", x + size, y],
    ["L", x + size * 0.28, y + size * 0.28],
    ["L", x, y + size],
    ["L", x - size * 0.28, y + size * 0.28],
    ["L", x - size, y],
    ["L", x - size * 0.28, y - size * 0.28],
    ["Z"]
  ]);
  return `<path d="${d}" fill="${color}" opacity="${opacity}" />`;
}

function sparkles(colors, count = 28) {
  const items = [];
  for (let index = 0; index < count; index += 1) {
    const x = 80 + ((index * 109) % (WIDTH - 140));
    const y = 90 + ((index * 173) % (HEIGHT - 160));
    const r = 2 + (index % 4);
    const opacity = 0.08 + ((index % 5) * 0.03);
    items.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${colors[2]}" opacity="${opacity}" />`);
  }
  return items.join("\n");
}

function bow(x, y, color, dark) {
  return `
    <g transform="translate(${x} ${y})">
      <ellipse cx="-26" cy="0" rx="34" ry="18" fill="${rgba(color, 0.75)}" transform="rotate(-14)" />
      <ellipse cx="26" cy="0" rx="34" ry="18" fill="${rgba(color, 0.75)}" transform="rotate(14)" />
      <rect x="-14" y="-18" width="28" height="36" rx="12" fill="${dark}" />
      <path d="M -4 16 C -14 42 -30 56 -18 82" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round" />
      <path d="M 4 16 C 14 42 30 56 18 82" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round" />
    </g>
  `;
}

function drawMotif(spec, colors) {
  switch (spec.motif) {
    case "floral-corners":
      return `
        ${floralCorner(130, 144, 1.18, colors)}
        ${floralCorner(WIDTH - 142, HEIGHT - 158, 1.12, colors)}
        <path d="M 126 236 C 212 364 198 570 352 632" fill="none" stroke="${rgba(colors[2], 0.22)}" stroke-width="5" stroke-dasharray="2 18" stroke-linecap="round" />
        <path d="M ${WIDTH - 154} ${HEIGHT - 262} C ${WIDTH - 246} ${HEIGHT - 392} ${WIDTH - 226} ${HEIGHT - 594} ${WIDTH - 388} ${HEIGHT - 664}" fill="none" stroke="${rgba(colors[2], 0.22)}" stroke-width="5" stroke-dasharray="2 18" stroke-linecap="round" />
      `;
    case "arch-botanical":
      return `
        <path d="M 178 308 C 178 162 284 84 450 84 C 616 84 722 162 722 308 L 722 398 L 178 398 Z" fill="${rgba(colors[1], 0.85)}" />
        <path d="M 222 308 C 222 190 306 124 450 124 C 594 124 678 190 678 308 L 678 398 L 222 398 Z" fill="${rgba("#ffffff", 0.92)}" />
        ${floralCorner(248, 276, 0.76, colors)}
        ${floralCorner(654, 276, 0.76, colors)}
        <path d="M 258 308 C 196 450 170 636 190 844" fill="none" stroke="${rgba(colors[2], 0.35)}" stroke-width="4" stroke-linecap="round" />
        <path d="M 642 308 C 704 450 730 636 710 844" fill="none" stroke="${rgba(colors[2], 0.35)}" stroke-width="4" stroke-linecap="round" />
      `;
    case "mini-bouquet":
      return `
        <g transform="translate(450 278)">
          ${floralCorner(0, 0, 0.9, colors)}
          <path d="M -8 42 C -22 122 -34 214 -8 266" fill="none" stroke="${rgba(colors[3], 0.42)}" stroke-width="4" stroke-linecap="round" />
          <path d="M 8 44 C 16 128 26 202 6 260" fill="none" stroke="${rgba(colors[3], 0.42)}" stroke-width="4" stroke-linecap="round" />
        </g>
      `;
    case "corner-bloom":
      return `
        ${floralCorner(120, 136, 1.08, colors)}
        ${floralCorner(WIDTH - 118, HEIGHT - 138, 1.08, colors)}
        <path d="M 116 222 C 250 300 332 354 414 420" fill="none" stroke="${rgba(colors[2], 0.18)}" stroke-width="6" stroke-linecap="round" />
        <path d="M ${WIDTH - 116} ${HEIGHT - 222} C ${WIDTH - 250} ${HEIGHT - 300} ${WIDTH - 332} ${HEIGHT - 354} ${WIDTH - 414} ${HEIGHT - 420}" fill="none" stroke="${rgba(colors[2], 0.18)}" stroke-width="6" stroke-linecap="round" />
      `;
    case "gold-border":
      return `
        <rect x="86" y="86" width="${WIDTH - 172}" height="${HEIGHT - 172}" rx="48" fill="none" stroke="${rgba(colors[2], 0.8)}" stroke-width="4" />
        <rect x="112" y="112" width="${WIDTH - 224}" height="${HEIGHT - 224}" rx="38" fill="none" stroke="${rgba(colors[2], 0.28)}" stroke-width="2" />
        ${floralCorner(148, 170, 0.78, colors)}
        ${floralCorner(WIDTH - 148, 170, 0.78, colors)}
        ${floralCorner(148, HEIGHT - 170, 0.78, colors)}
        ${floralCorner(WIDTH - 148, HEIGHT - 170, 0.78, colors)}
      `;
    case "ribbon-frame":
      return `
        <rect x="96" y="126" width="${WIDTH - 192}" height="${HEIGHT - 252}" rx="42" fill="none" stroke="${rgba(colors[2], 0.55)}" stroke-width="3" stroke-dasharray="0 14" stroke-linecap="round" />
        ${bow(450, 142, colors[2], colors[3])}
        ${floralCorner(174, HEIGHT - 188, 0.82, colors)}
        ${floralCorner(WIDTH - 174, HEIGHT - 188, 0.82, colors)}
      `;
    case "bear-balloons":
      return `
        ${balloon(260, 192, "#ffd87c", 1.08)}
        ${balloon(372, 156, "#ffb5ba", 0.92)}
        ${balloon(510, 190, "#9cd4ff", 0.98)}
        <g transform="translate(450 292)">
          <circle cx="0" cy="0" r="74" fill="#c89a62" />
          <circle cx="-68" cy="-62" r="30" fill="#c89a62" />
          <circle cx="68" cy="-62" r="30" fill="#c89a62" />
          <circle cx="-68" cy="-62" r="14" fill="#f4dfc7" />
          <circle cx="68" cy="-62" r="14" fill="#f4dfc7" />
          <circle cx="-30" cy="-6" r="8" fill="#3c2c1c" />
          <circle cx="30" cy="-6" r="8" fill="#3c2c1c" />
          <ellipse cx="0" cy="22" rx="24" ry="18" fill="#f4dfc7" />
          <ellipse cx="0" cy="12" rx="8" ry="6" fill="#3c2c1c" />
          <path d="M -10 28 Q 0 38 10 28" fill="none" stroke="#3c2c1c" stroke-width="4" stroke-linecap="round" />
        </g>
        ${sparkles(colors, 20)}
      `;
    case "birthday-teddy":
      return `
        ${balloon(238, 184, "#ffb5ba", 0.95)}
        ${balloon(344, 146, "#ffd87c", 1.05)}
        ${balloon(640, 170, "#9cd4ff", 1)}
        <path d="M 0 1088 C 118 1032 220 1038 338 1090 C 450 1138 546 1136 670 1088 C 774 1048 838 1052 900 1078 L 900 1440 L 0 1440 Z" fill="${rgba(colors[2], 0.22)}" />
        <g transform="translate(450 1060)">
          <ellipse cx="0" cy="116" rx="92" ry="76" fill="#c89a62" />
          <circle cx="0" cy="0" r="82" fill="#c89a62" />
          <circle cx="-72" cy="-62" r="34" fill="#c89a62" />
          <circle cx="72" cy="-62" r="34" fill="#c89a62" />
          <circle cx="-72" cy="-62" r="16" fill="#f5dfc7" />
          <circle cx="72" cy="-62" r="16" fill="#f5dfc7" />
          <circle cx="-30" cy="-12" r="8" fill="#3c2c1c" />
          <circle cx="30" cy="-12" r="8" fill="#3c2c1c" />
          <ellipse cx="0" cy="20" rx="26" ry="18" fill="#f5dfc7" />
          <ellipse cx="0" cy="10" rx="8" ry="6" fill="#3c2c1c" />
          <path d="M -12 28 Q 0 40 12 28" fill="none" stroke="#3c2c1c" stroke-width="4" stroke-linecap="round" />
          <rect x="-32" y="-104" width="64" height="48" rx="14" fill="#fff0a8" />
          <path d="M -30 -104 C -12 -138 12 -138 30 -104" fill="none" stroke="#ffb45c" stroke-width="7" stroke-linecap="round" />
        </g>
        ${sparkles(colors, 24)}
      `;
    case "birthday-night":
      return `
        <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="${CARD_RADIUS}" fill="#15203b" opacity="0.9" />
        <radialGradient id="nightGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(450 242) rotate(90) scale(420 360)">
          <stop offset="0%" stop-color="${rgba("#fff2a8", 0.34)}" />
          <stop offset="100%" stop-color="${rgba("#fff2a8", 0)}" />
        </radialGradient>
        <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="${CARD_RADIUS}" fill="url(#nightGlow)" />
        <path d="M 548 158 C 496 180 468 230 476 286 C 486 352 544 396 612 376 C 556 354 524 310 524 254 C 524 212 536 182 548 158 Z" fill="#fff1a7" opacity="0.92" />
        ${star(224, 220, 18, "#fff1a7", 0.94)}
        ${star(332, 320, 12, "#fff1a7", 0.78)}
        ${star(686, 284, 16, "#fff1a7", 0.82)}
        ${star(742, 432, 12, "#fff1a7", 0.72)}
        ${Array.from({ length: 44 }, (_, index) => {
          const x = 92 + ((index * 97) % (WIDTH - 184));
          const y = 92 + ((index * 131) % (HEIGHT - 184));
          const r = 2 + (index % 3);
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff8c9" opacity="${0.22 + (index % 4) * 0.08}" />`;
        }).join("\n")}
        <path d="M 0 1050 C 136 984 252 996 372 1060 C 506 1130 624 1124 770 1040 C 830 1008 870 1008 900 1020 L 900 1440 L 0 1440 Z" fill="${rgba("#070b17", 0.36)}" />
        <path d="M 334 1128 C 382 1066 424 1040 450 1040 C 476 1040 518 1066 566 1128" fill="none" stroke="${rgba("#fff8c9", 0.28)}" stroke-width="5" stroke-linecap="round" />
      `;
    case "birthday-cake":
      return `
        ${balloon(238, 176, "#ffd87c", 0.98)}
        ${balloon(636, 186, "#ffb5ba", 0.98)}
        <g transform="translate(450 1074)">
          <rect x="-132" y="98" width="264" height="54" rx="24" fill="#ffe3ad" />
          <rect x="-104" y="32" width="208" height="90" rx="28" fill="#ffd0dc" />
          <rect x="-70" y="-38" width="140" height="88" rx="24" fill="#fff0ba" />
          <path d="M -86 46 C -58 72 -34 38 -6 58 C 22 78 46 42 86 52" fill="none" stroke="#fff9fb" stroke-width="11" stroke-linecap="round" />
          <path d="M -54 -24 L -54 -86" stroke="#8b6b39" stroke-width="6" stroke-linecap="round" />
          <path d="M 0 -24 L 0 -102" stroke="#8b6b39" stroke-width="6" stroke-linecap="round" />
          <path d="M 54 -24 L 54 -84" stroke="#8b6b39" stroke-width="6" stroke-linecap="round" />
          <ellipse cx="-54" cy="-96" rx="12" ry="18" fill="#ff9d6d" />
          <ellipse cx="0" cy="-112" rx="12" ry="18" fill="#ff9d6d" />
          <ellipse cx="54" cy="-94" rx="12" ry="18" fill="#ff9d6d" />
        </g>
        ${sparkles(colors, 26)}
      `;
    case "crown-ribbon":
      return `
        <g transform="translate(450 236)">
          <path d="M -92 20 L -56 -52 L -8 0 L 24 -74 L 68 0 L 110 -52 L 138 20 Z" fill="${colors[2]}" />
          <circle cx="-58" cy="-22" r="10" fill="#fff6e6" />
          <circle cx="24" cy="-44" r="12" fill="#fff6e6" />
          <circle cx="104" cy="-22" r="10" fill="#fff6e6" />
        </g>
        ${bow(450, 368, colors[4], colors[3])}
        ${sparkles(colors, 24)}
      `;
    case "moon-stars":
      return `
        <circle cx="450" cy="244" r="108" fill="${rgba(colors[2], 0.25)}" />
        <path d="M 470 160 C 434 172 412 208 416 250 C 420 304 464 342 520 330 C 478 314 454 278 454 238 C 454 206 466 182 490 160 Z" fill="${colors[4]}" />
        ${star(278, 186, 22, "#fff3af", 0.95)}
        ${star(604, 206, 16, "#fff3af", 0.95)}
        ${star(336, 310, 12, "#fff3af", 0.8)}
        ${star(562, 322, 14, "#fff3af", 0.8)}
        <path d="M 380 396 C 408 356 456 330 512 330 C 544 330 566 338 590 350" fill="none" stroke="${rgba(colors[2], 0.26)}" stroke-width="4" stroke-linecap="round" />
        <path d="M 414 428 L 452 372 L 510 392 L 534 338 L 588 348 L 550 404 L 490 392 Z" fill="${rgba("#ffffff", 0.9)}" />
      `;
    case "premium-crown":
      return `
        <rect x="112" y="112" width="${WIDTH - 224}" height="${HEIGHT - 224}" rx="52" fill="none" stroke="${rgba(colors[2], 0.7)}" stroke-width="3" />
        <g transform="translate(450 228)">
          <path d="M -104 32 L -62 -36 L -6 18 L 30 -60 L 80 18 L 134 -36 L 176 32" fill="none" stroke="${colors[2]}" stroke-width="18" stroke-linejoin="round" />
          <circle cx="-62" cy="-36" r="9" fill="#fff2c3" />
          <circle cx="30" cy="-60" r="11" fill="#fff2c3" />
          <circle cx="134" cy="-36" r="9" fill="#fff2c3" />
        </g>
        <path d="M 170 1012 C 264 920 354 880 450 880 C 548 880 638 920 730 1012" fill="none" stroke="${rgba(colors[2], 0.22)}" stroke-width="4" />
      `;
    case "cake-party":
      return `
        <g transform="translate(450 290)">
          <rect x="-122" y="36" width="244" height="46" rx="20" fill="#ffe7b8" />
          <rect x="-92" y="-18" width="184" height="76" rx="28" fill="#ffd7e3" />
          <rect x="-64" y="-78" width="128" height="76" rx="24" fill="#fff1c1" />
          <path d="M -82 -8 C -60 14 -40 -10 -14 8 C 6 22 24 0 46 8 C 66 14 74 2 88 -2" fill="none" stroke="#fff7fb" stroke-width="10" stroke-linecap="round" />
          <path d="M -56 -64 L -56 -110" stroke="#8b6b39" stroke-width="6" stroke-linecap="round" />
          <path d="M 0 -64 L 0 -122" stroke="#8b6b39" stroke-width="6" stroke-linecap="round" />
          <path d="M 56 -64 L 56 -108" stroke="#8b6b39" stroke-width="6" stroke-linecap="round" />
          <ellipse cx="-56" cy="-118" rx="12" ry="18" fill="#ff9d6d" />
          <ellipse cx="0" cy="-130" rx="12" ry="18" fill="#ff9d6d" />
          <ellipse cx="56" cy="-116" rx="12" ry="18" fill="#ff9d6d" />
        </g>
        ${sparkles(colors, 18)}
      `;
    case "knot-crest":
      return `
        <g transform="translate(450 246)">
          <circle cx="0" cy="0" r="84" fill="none" stroke="${rgba(colors[2], 0.44)}" stroke-width="5" />
          <path d="M -56 -10 C -10 -74 46 -74 92 -10 C 46 54 -10 54 -56 -10 Z" fill="none" stroke="${colors[2]}" stroke-width="10" stroke-linejoin="round" />
          <path d="M -92 10 C -46 74 10 74 56 10 C 10 -54 -46 -54 -92 10 Z" fill="none" stroke="${colors[2]}" stroke-width="10" stroke-linejoin="round" />
        </g>
        <path d="M 228 366 H 672" stroke="${rgba(colors[2], 0.28)}" stroke-width="3" />
        <path d="M 228 1034 H 672" stroke="${rgba(colors[2], 0.28)}" stroke-width="3" />
      `;
    case "heritage-pattern":
      return `
        <rect x="114" y="132" width="${WIDTH - 228}" height="${HEIGHT - 264}" rx="46" fill="none" stroke="${rgba(colors[2], 0.35)}" stroke-width="2" />
        ${Array.from({ length: 8 }, (_, index) => {
          const y = 190 + index * 130;
          return `<path d="M 144 ${y} C 172 ${y - 42} 216 ${y - 42} 244 ${y} C 216 ${y + 42} 172 ${y + 42} 144 ${y} Z" fill="none" stroke="${rgba(colors[2], 0.24)}" stroke-width="3" />`;
        }).join("\n")}
        ${Array.from({ length: 8 }, (_, index) => {
          const y = 190 + index * 130;
          return `<path d="M ${WIDTH - 144} ${y} C ${WIDTH - 172} ${y - 42} ${WIDTH - 216} ${y - 42} ${WIDTH - 244} ${y} C ${WIDTH - 216} ${y + 42} ${WIDTH - 172} ${y + 42} ${WIDTH - 144} ${y} Z" fill="none" stroke="${rgba(colors[2], 0.24)}" stroke-width="3" />`;
        }).join("\n")}
      `;
    case "seal-band":
      return `
        <rect x="0" y="0" width="${WIDTH}" height="164" fill="${rgba(colors[2], 0.16)}" />
        <rect x="0" y="${HEIGHT - 188}" width="${WIDTH}" height="188" fill="${rgba(colors[2], 0.14)}" />
        <circle cx="450" cy="312" r="76" fill="${colors[2]}" opacity="0.94" />
        <text x="450" y="336" text-anchor="middle" font-size="66" fill="#fff7ef" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-weight="700">壽</text>
      `;
    case "orchid-border":
      return `
        <rect x="92" y="92" width="${WIDTH - 184}" height="${HEIGHT - 184}" rx="48" fill="none" stroke="${rgba(colors[2], 0.38)}" stroke-width="3" />
        ${floralCorner(146, 206, 0.72, colors)}
        ${floralCorner(WIDTH - 146, 206, 0.72, colors)}
        <path d="M 196 ${HEIGHT - 264} C 244 ${HEIGHT - 390} 326 ${HEIGHT - 506} 412 ${HEIGHT - 546}" fill="none" stroke="${rgba(colors[2], 0.2)}" stroke-width="4" />
        <path d="M ${WIDTH - 196} ${HEIGHT - 264} C ${WIDTH - 244} ${HEIGHT - 390} ${WIDTH - 326} ${HEIGHT - 506} ${WIDTH - 412} ${HEIGHT - 546}" fill="none" stroke="${rgba(colors[2], 0.2)}" stroke-width="4" />
      `;
    case "calligraphy-scroll":
      return `
        <rect x="174" y="138" width="${WIDTH - 348}" height="${HEIGHT - 276}" rx="26" fill="${rgba("#ffffff", 0.66)}" stroke="${rgba(colors[2], 0.24)}" stroke-width="2" />
        <path d="M 196 176 C 244 196 286 176 324 152" fill="none" stroke="${rgba(colors[2], 0.34)}" stroke-width="3" />
        <path d="M 576 152 C 620 176 662 196 704 176" fill="none" stroke="${rgba(colors[2], 0.34)}" stroke-width="3" />
        <text x="450" y="300" text-anchor="middle" font-size="122" fill="${rgba(colors[3], 0.9)}" font-family="Nanum Myeongjo, Noto Serif CJK KR, serif">壽宴</text>
      `;
    case "bow-garden":
      return `
        ${bow(450, 168, colors[2], colors[3])}
        ${floralCorner(186, 306, 0.82, colors)}
        ${floralCorner(WIDTH - 186, 306, 0.82, colors)}
        ${sparkles(colors, 20)}
      `;
    case "boho-dried":
      return `
        <path d="M 214 232 C 274 288 322 360 352 426" fill="none" stroke="${rgba(colors[2], 0.5)}" stroke-width="4" stroke-linecap="round" />
        <path d="M 268 246 C 306 298 334 352 352 414" fill="none" stroke="${rgba(colors[2], 0.34)}" stroke-width="4" stroke-linecap="round" />
        <path d="M 290 264 C 318 300 338 338 350 390" fill="none" stroke="${rgba(colors[2], 0.3)}" stroke-width="4" stroke-linecap="round" />
        <path d="M ${WIDTH - 214} 232 C ${WIDTH - 274} 288 ${WIDTH - 322} 360 ${WIDTH - 352} 426" fill="none" stroke="${rgba(colors[2], 0.5)}" stroke-width="4" stroke-linecap="round" />
        <path d="M ${WIDTH - 268} 246 C ${WIDTH - 306} 298 ${WIDTH - 334} 352 ${WIDTH - 352} 414" fill="none" stroke="${rgba(colors[2], 0.34)}" stroke-width="4" stroke-linecap="round" />
        <path d="M ${WIDTH - 290} 264 C ${WIDTH - 318} 300 ${WIDTH - 338} 338 ${WIDTH - 350} 390" fill="none" stroke="${rgba(colors[2], 0.3)}" stroke-width="4" stroke-linecap="round" />
        <circle cx="450" cy="242" r="102" fill="${rgba(colors[1], 0.52)}" />
      `;
    case "black-ribbon":
      return `
        <rect x="92" y="92" width="${WIDTH - 184}" height="${HEIGHT - 184}" rx="50" fill="none" stroke="${rgba(colors[3], 0.72)}" stroke-width="2" />
        ${bow(450, 154, colors[3], "#ffffff")}
        <path d="M 140 116 H ${WIDTH - 140}" stroke="${rgba(colors[3], 0.55)}" stroke-width="2" />
      `;
    case "mint-ribbon":
      return `
        ${bow(450, 162, colors[2], colors[3])}
        <rect x="116" y="130" width="${WIDTH - 232}" height="${HEIGHT - 260}" rx="44" fill="none" stroke="${rgba(colors[2], 0.32)}" stroke-width="3" />
        ${floralCorner(166, HEIGHT - 198, 0.74, colors)}
        ${floralCorner(WIDTH - 166, HEIGHT - 198, 0.74, colors)}
      `;
    case "ocean-party":
      return `
        <path d="M 0 998 C 120 942 206 944 318 996 C 428 1048 530 1044 646 988 C 744 940 822 938 900 972 L 900 1440 L 0 1440 Z" fill="${rgba(colors[2], 0.48)}" />
        <path d="M 0 1086 C 120 1030 226 1038 340 1088 C 452 1136 542 1136 670 1086 C 774 1044 838 1048 900 1074 L 900 1440 L 0 1440 Z" fill="${rgba(colors[3], 0.3)}" />
        <circle cx="246" cy="290" r="68" fill="#ffb55c" opacity="0.9" />
        <circle cx="450" cy="242" r="54" fill="#7ad4ef" />
        <path d="M 396 242 C 426 208 474 208 504 242 C 474 276 426 276 396 242 Z" fill="#7ad4ef" />
        <circle cx="438" cy="230" r="6" fill="#173d56" />
        <circle cx="462" cy="230" r="6" fill="#173d56" />
        <path d="M 440 250 Q 450 258 460 250" fill="none" stroke="#173d56" stroke-width="4" stroke-linecap="round" />
        ${star(648, 268, 18, "#fff3c0", 0.92)}
        ${sparkles(colors, 18)}
      `;
    case "shark-bubble":
      return `
        <path d="M 126 1028 C 284 890 470 862 646 948 C 736 992 812 1072 900 1184 L 900 1440 L 0 1440 L 0 1148 C 44 1090 88 1054 126 1028 Z" fill="${rgba(colors[2], 0.4)}" />
        <path d="M 274 300 C 332 222 444 192 564 236 C 608 252 650 280 700 322 C 650 330 630 346 594 384 C 564 418 530 440 492 454 C 388 490 288 440 246 370 Z" fill="${rgba(colors[2], 0.95)}" />
        <circle cx="570" cy="312" r="8" fill="#173d56" />
        <path d="M 564 340 Q 594 354 628 340" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
        ${Array.from({ length: 16 }, (_, index) => {
          const x = 156 + index * 42;
          const y = 180 + ((index * 31) % 360);
          const r = 8 + (index % 3) * 5;
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="${rgba("#ffffff", 0.36)}" stroke="${rgba("#ffffff", 0.66)}" stroke-width="2" />`;
        }).join("\n")}
      `;
    case "jungle-party":
      return `
        <path d="M 0 0 H ${WIDTH} V 180 H 0 Z" fill="${rgba(colors[2], 0.14)}" />
        <ellipse cx="160" cy="222" rx="70" ry="118" fill="${rgba(colors[2], 0.24)}" transform="rotate(-12 160 222)" />
        <ellipse cx="${WIDTH - 160}" cy="238" rx="70" ry="118" fill="${rgba(colors[2], 0.24)}" transform="rotate(12 ${WIDTH - 160} 238)" />
        <g transform="translate(298 322)">
          <circle cx="0" cy="0" r="50" fill="#f4b96d" />
          <circle cx="-18" cy="-12" r="6" fill="#24361c" />
          <circle cx="18" cy="-12" r="6" fill="#24361c" />
          <path d="M -18 18 Q 0 34 18 18" fill="none" stroke="#24361c" stroke-width="4" stroke-linecap="round" />
          <ellipse cx="-38" cy="-48" rx="18" ry="24" fill="#f4b96d" />
          <ellipse cx="38" cy="-48" rx="18" ry="24" fill="#f4b96d" />
        </g>
        <g transform="translate(600 334)">
          <circle cx="0" cy="0" r="46" fill="#d98e52" />
          <circle cx="-16" cy="-8" r="6" fill="#24361c" />
          <circle cx="16" cy="-8" r="6" fill="#24361c" />
          <path d="M -18 14 Q 0 32 18 14" fill="none" stroke="#24361c" stroke-width="4" stroke-linecap="round" />
          <ellipse cx="-42" cy="-28" rx="14" ry="20" fill="#d98e52" />
          <ellipse cx="42" cy="-28" rx="14" ry="20" fill="#d98e52" />
        </g>
        <path d="M 194 392 C 240 352 272 346 328 360" fill="none" stroke="${rgba(colors[2], 0.26)}" stroke-width="4" />
      `;
    case "home-plants":
      return `
        <path d="M 228 362 L 450 202 L 672 362 V 626 H 228 Z" fill="${rgba(colors[1], 0.9)}" />
        <rect x="286" y="362" width="328" height="320" rx="24" fill="${rgba("#ffffff", 0.88)}" />
        <rect x="382" y="492" width="136" height="190" rx="18" fill="${rgba(colors[2], 0.36)}" />
        <ellipse cx="246" cy="860" rx="54" ry="38" fill="${rgba(colors[2], 0.3)}" />
        <path d="M 230 822 C 212 766 228 708 256 656 C 282 728 278 784 246 840" fill="${rgba(colors[2], 0.72)}" />
        <ellipse cx="654" cy="860" rx="54" ry="38" fill="${rgba(colors[2], 0.3)}" />
        <path d="M 674 822 C 692 766 676 708 648 656 C 622 728 626 784 658 840" fill="${rgba(colors[2], 0.72)}" />
      `;
    case "home-interior":
      return `
        <rect x="192" y="246" width="516" height="592" rx="42" fill="${rgba("#ffffff", 0.94)}" />
        <rect x="248" y="322" width="166" height="154" rx="22" fill="${rgba(colors[2], 0.18)}" />
        <rect x="468" y="322" width="180" height="220" rx="22" fill="${rgba(colors[2], 0.26)}" />
        <rect x="260" y="584" width="388" height="144" rx="28" fill="${rgba(colors[2], 0.12)}" />
        <line x1="332" y1="246" x2="332" y2="162" stroke="${rgba(colors[2], 0.5)}" stroke-width="4" />
        <circle cx="332" cy="148" r="28" fill="${rgba(colors[2], 0.22)}" />
      `;
    case "cloud-bear":
      return `
        <g transform="translate(450 228)">
          <circle cx="-88" cy="20" r="46" fill="#ffffff" opacity="0.94" />
          <circle cx="-26" cy="-8" r="58" fill="#ffffff" opacity="0.94" />
          <circle cx="54" cy="12" r="48" fill="#ffffff" opacity="0.94" />
          <circle cx="118" cy="28" r="34" fill="#ffffff" opacity="0.94" />
        </g>
        <g transform="translate(450 398)">
          <circle cx="0" cy="0" r="68" fill="#d9c1a6" />
          <circle cx="-54" cy="-54" r="26" fill="#d9c1a6" />
          <circle cx="54" cy="-54" r="26" fill="#d9c1a6" />
          <circle cx="-18" cy="-4" r="7" fill="#4a3b33" />
          <circle cx="18" cy="-4" r="7" fill="#4a3b33" />
          <ellipse cx="0" cy="18" rx="18" ry="14" fill="#f6e6d8" />
          <path d="M -10 24 Q 0 34 10 24" fill="none" stroke="#4a3b33" stroke-width="4" stroke-linecap="round" />
        </g>
        ${star(274, 160, 14, "#fff4b6", 0.92)}
        ${star(648, 168, 16, "#fff4b6", 0.92)}
      `;
    case "star-mobile":
      return `
        <path d="M 450 162 L 450 256" stroke="${rgba(colors[2], 0.58)}" stroke-width="5" stroke-linecap="round" />
        <path d="M 380 204 L 380 282" stroke="${rgba(colors[2], 0.42)}" stroke-width="4" stroke-linecap="round" />
        <path d="M 520 204 L 520 282" stroke="${rgba(colors[2], 0.42)}" stroke-width="4" stroke-linecap="round" />
        ${star(450, 286, 24, colors[2], 0.88)}
        ${star(380, 312, 18, colors[4], 0.88)}
        ${star(520, 316, 18, colors[4], 0.88)}
        <circle cx="450" cy="404" r="58" fill="${rgba("#ffffff", 0.8)}" />
        <ellipse cx="426" cy="404" rx="24" ry="32" fill="${rgba(colors[2], 0.18)}" />
        <ellipse cx="474" cy="404" rx="24" ry="32" fill="${rgba(colors[2], 0.18)}" />
      `;
    case "cap-laurel":
      return `
        <path d="M 450 172 L 616 240 L 450 308 L 284 240 Z" fill="${colors[2]}" />
        <path d="M 580 258 V 344" stroke="${colors[2]}" stroke-width="8" stroke-linecap="round" />
        <circle cx="580" cy="360" r="14" fill="${colors[4]}" />
        ${Array.from({ length: 8 }, (_, index) => {
          const angle = -80 + index * 12;
          return `<ellipse cx="${282 + index * 18}" cy="${412 - Math.abs(4 - index) * 8}" rx="18" ry="8" transform="rotate(${angle} ${282 + index * 18} ${412 - Math.abs(4 - index) * 8})" fill="${rgba(colors[4], 0.85)}" />`;
        }).join("\n")}
        ${Array.from({ length: 8 }, (_, index) => {
          const angle = 80 - index * 12;
          return `<ellipse cx="${618 - index * 18}" cy="${412 - Math.abs(4 - index) * 8}" rx="18" ry="8" transform="rotate(${angle} ${618 - index * 18} ${412 - Math.abs(4 - index) * 8})" fill="${rgba(colors[4], 0.85)}" />`;
        }).join("\n")}
      `;
    case "medal-stage":
      return `
        <circle cx="450" cy="242" r="84" fill="${rgba(colors[2], 0.18)}" />
        <circle cx="450" cy="242" r="54" fill="${colors[2]}" />
        <text x="450" y="262" text-anchor="middle" font-size="42" fill="#fffdf7" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-weight="700">2027</text>
        <path d="M 228 1040 H 672" stroke="${rgba(colors[2], 0.18)}" stroke-width="18" stroke-linecap="round" />
        <rect x="298" y="928" width="104" height="112" rx="16" fill="${rgba(colors[2], 0.32)}" />
        <rect x="420" y="874" width="118" height="166" rx="16" fill="${rgba(colors[2], 0.52)}" />
        <rect x="556" y="956" width="72" height="84" rx="16" fill="${rgba(colors[2], 0.22)}" />
      `;
    case "conference-grid":
      return `
        <rect x="108" y="124" width="${WIDTH - 216}" height="${HEIGHT - 248}" rx="46" fill="none" stroke="${rgba(colors[2], 0.22)}" stroke-width="2" />
        ${Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 3 }, (_, col) => {
            const x = 172 + col * 184;
            const y = 252 + row * 136;
            return `<rect x="${x}" y="${y}" width="136" height="92" rx="22" fill="${rgba(colors[2], 0.1 + ((row + col) % 3) * 0.07)}" />`;
          }).join("\n")
        ).join("\n")}
        <circle cx="682" cy="250" r="34" fill="${rgba(colors[2], 0.26)}" />
      `;
    case "award-spotlight":
      return `
        <path d="M 260 0 L 380 0 L 502 620 H 158 Z" fill="${rgba(colors[4], 0.14)}" />
        <path d="M 520 0 L 640 0 L 742 620 H 398 Z" fill="${rgba(colors[4], 0.09)}" />
        <g transform="translate(450 300)">
          <circle cx="0" cy="0" r="74" fill="${rgba(colors[4], 0.14)}" stroke="${rgba(colors[4], 0.55)}" stroke-width="2" />
          <path d="M 0 -80 L 22 -26 L 80 -20 L 34 14 L 50 72 L 0 40 L -50 72 L -34 14 L -80 -20 L -22 -26 Z" fill="${rgba(colors[4], 0.88)}" />
        </g>
        <path d="M 210 1024 H 690" stroke="${rgba(colors[4], 0.18)}" stroke-width="3" />
      `;
    default:
      return "";
  }
}

function mainInvitationLines(spec) {
  switch (spec.category) {
    case "wedding":
      return ["이준서", "&", "김은재"];
    case "dol":
      return ["첫 돌", "이서준"];
    case "hwangap":
      return spec.motif === "calligraphy-scroll" ? ["환갑연에", "초대합니다"] : ["환갑을", "축하드립니다"];
    case "bridal":
      return ["Bridal Shower", "민지"];
    case "birthday":
      return ["Happy", "Birthday"];
    case "housewarming":
      return ["집들이에", "초대합니다"];
    case "baby":
      return ["Baby", "Shower"];
    case "graduation":
      return ["졸업을", "축하합니다"];
    case "business":
      return spec.accent === "midnight" ? ["Awards", "Night"] : ["Future", "Summit"];
    default:
      return [spec.subtitle];
  }
}

function invitationKicker(spec, copy) {
  if (spec.category === "wedding") return "We are getting married";
  if (spec.category === "dol") return "우리 아이의 첫 번째 생일";
  if (spec.category === "hwangap") return "소중한 분을 위한 자리";
  if (spec.category === "birthday") return "생일파티에 초대합니다";
  return copy.label;
}

function centeredText(spec, copy, colors, isDark) {
  const lines = mainInvitationLines(spec);
  const body = isDark ? "#f8f3ea" : "#3b3029";
  const secondary = isDark ? rgba("#ffffff", 0.72) : rgba(colors[3], 0.72);
  const accent = isDark ? colors[4] : colors[2];
  const lineGap = lines.length > 2 ? 86 : 98;
  const startY = lines.length > 2 ? 532 : 562;
  const mainSvg = lines
    .map((line, index) => {
      const isAmpersand = line === "&";
      const isEnglish = /^[A-Za-z\s]+$/.test(line);
      const fontSize = isAmpersand ? 42 : isEnglish ? 62 : line.length >= 5 ? 58 : 72;
      const fill = isAmpersand ? rgba(accent, 0.92) : body;
      const family = isEnglish ? "Georgia, Times New Roman, serif" : "Nanum Myeongjo, Noto Serif CJK KR, serif";
      return `<text x="450" y="${startY + index * lineGap}" text-anchor="middle" fill="${fill}" font-size="${fontSize}" font-family="${family}" font-weight="${isAmpersand ? 400 : 700}">${esc(line)}</text>`;
    })
    .join("\n");
  const detailsY = startY + lines.length * lineGap + 74;
  const note =
    spec.category === "birthday"
      ? ""
      : spec.category === "wedding"
      ? "귀한 발걸음으로 두 사람의 시작을 축복해 주세요"
      : spec.category === "business"
        ? "초청받은 분들을 위한 프라이빗 세션입니다"
        : "따뜻한 마음으로 함께해 주세요";
  const noteSvg = note
    ? `<text x="450" y="1092" text-anchor="middle" fill="${secondary}" font-size="25" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-weight="500">${esc(note)}</text>`
    : "";

  return `
    <text x="450" y="408" text-anchor="middle" fill="${secondary}" font-size="25" font-family="Georgia, Times New Roman, serif" font-style="italic">${esc(invitationKicker(spec, copy))}</text>
    <text x="450" y="464" text-anchor="middle" fill="${rgba(accent, isDark ? 0.88 : 0.82)}" font-size="27" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-weight="700">${esc(spec.title)}</text>
    ${mainSvg}
    <path d="M 318 ${detailsY - 22} H 582" stroke="${rgba(accent, isDark ? 0.42 : 0.34)}" stroke-width="3" stroke-linecap="round" />
    <text x="450" y="${detailsY + 42}" text-anchor="middle" fill="${body}" font-size="28" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-weight="700">${esc(copy.line2)}</text>
    <text x="450" y="${detailsY + 92}" text-anchor="middle" fill="${secondary}" font-size="27" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-weight="600">${esc(copy.line3)}</text>
    ${noteSvg}
  `;
}

function ornamentalFrame(colors, isDark) {
  const stroke = isDark ? rgba(colors[4], 0.42) : rgba(colors[2], 0.42);
  const fineStroke = isDark ? rgba(colors[4], 0.22) : rgba(colors[2], 0.22);

  return `
    <rect x="66" y="66" width="${WIDTH - 132}" height="${HEIGHT - 132}" rx="54" fill="none" stroke="${stroke}" stroke-width="3" />
    <rect x="96" y="96" width="${WIDTH - 192}" height="${HEIGHT - 192}" rx="42" fill="none" stroke="${fineStroke}" stroke-width="2" />
    <path d="M 350 224 C 390 198 510 198 550 224" fill="none" stroke="${fineStroke}" stroke-width="3" stroke-linecap="round" />
    <path d="M 350 ${HEIGHT - 224} C 390 ${HEIGHT - 198} 510 ${HEIGHT - 198} 550 ${HEIGHT - 224}" fill="none" stroke="${fineStroke}" stroke-width="3" stroke-linecap="round" />
  `;
}

function createSvg(spec) {
  const colors = palette[spec.accent];
  const copy = categoryCopy[spec.category];
  const isDark = spec.accent === "black" || spec.accent === "midnight";
  const paper = isDark ? rgba("#000000", 0.16) : rgba("#ffffff", 0.3);

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="${WIDTH}" y2="${HEIGHT}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="58%" stop-color="${colors[1]}" />
          <stop offset="100%" stop-color="${isDark ? colors[1] : "#ffffff"}" />
        </linearGradient>
        <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 220) rotate(90) scale(320 260)">
          <stop offset="0%" stop-color="${rgba(colors[4], 0.35)}" />
          <stop offset="100%" stop-color="${rgba(colors[4], 0)}" />
        </radialGradient>
        <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${WIDTH - 180} ${HEIGHT - 220}) rotate(90) scale(360 280)">
          <stop offset="0%" stop-color="${rgba(colors[2], isDark ? 0.2 : 0.16)}" />
          <stop offset="100%" stop-color="${rgba(colors[2], 0)}" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="${CARD_RADIUS}" fill="url(#bg)" />
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="${CARD_RADIUS}" fill="url(#glowA)" />
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="${CARD_RADIUS}" fill="url(#glowB)" />
      ${sparkles(colors, 12)}
      ${ornamentalFrame(colors, isDark)}
      ${drawMotif(spec, colors)}
      <path d="M 224 354 C 314 302 578 304 682 360 C 762 404 760 846 684 940 C 594 1016 312 1014 222 940 C 144 846 146 404 224 354 Z" fill="${paper}" />
      ${centeredText(spec, copy, colors, isDark)}
    </svg>
  `;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function renderPreview(spec) {
  const outputDir = path.join(OUTPUT_ROOT, spec.category);
  await ensureDir(outputDir);
  const outputFile = path.join(outputDir, `${spec.id}.jpg`);
  const svg = createSvg(spec);

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(outputFile);

  return outputFile;
}

async function main() {
  await ensureDir(OUTPUT_ROOT);
  const files = [];

  for (const spec of templateSpecs) {
    const file = await renderPreview(spec);
    files.push(file);
  }

  console.log(`Generated ${files.length} template previews into ${OUTPUT_ROOT}`);
  for (const file of files) {
    console.log(path.relative(path.resolve(__dirname, ".."), file));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
