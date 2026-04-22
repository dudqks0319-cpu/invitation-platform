import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDir = join(process.cwd(), "public/images/reference");
const mobileDir = join(process.cwd(), "apps/mobile/assets/template-previews/reference");
mkdirSync(publicDir, { recursive: true });
mkdirSync(mobileDir, { recursive: true });

const cards = [
  ["wedding-classic", "wedding-floral-corner"],
  ["wedding-modern", "wedding-white-arch"],
  ["wedding-floral", "wedding-dress"],
  ["wedding-minimal", "wedding-green-wreath"],
  ["wedding-nature", "wedding-gold-arch"],
  ["wedding-rose-gold", "wedding-church"],
  ["dol-cute", "dol-teddy"],
  ["dol-pastel", "dol-baby-crown"],
  ["dol-blue", "dol-rocking-horse"],
  ["dol-nature", "dol-gingham-bow"],
  ["dol-gold", "dol-balloons"],
  ["dol-eucalyptus", "dol-hot-air"],
  ["birthday-fun", "birthday-balloons"],
  ["birthday-elegant", "birthday-night"],
  ["birthday-kids", "birthday-smiley"],
  ["birthday-ocean-shark", "birthday-cake"],
  ["birthday-unicorn", "birthday-confetti"],
  ["birthday-winter-penguin", "birthday-teddy"],
  ["hwangap-classic", "hwangap-floral"],
  ["hwangap-modern", "hwangap-navy"],
  ["hwangap-red", "hwangap-pink-floral"],
  ["hwangap-floral", "hwangap-green"],
  ["hwangap-hanja", "hwangap-crane"],
  ["hwangap-branch", "hwangap-calligraphy"],
  ["anniversary-tulip", "anniversary-couple"],
  ["anniversary-photo", "anniversary-polaroid"],
  ["anniversary-heart", "anniversary-heart"],
  ["anniversary-night", "anniversary-night"],
  ["anniversary-branch", "anniversary-botanical"],
  ["anniversary-paris", "anniversary-paris"],
  ["other-moving", "other-moving"],
  ["other-graduation", "other-graduation"],
  ["other-baby-shower", "other-baby"],
  ["other-retirement", "other-retirement"],
  ["other-teacher", "other-teacher"],
  ["other-worship", "other-worship"]
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;"
  })[char]);
}

function paper(bg = "#fffaf2") {
  return `
    <rect width="560" height="840" rx="18" fill="${bg}"/>
    <g opacity=".22">
      ${Array.from({ length: 70 }, (_, index) => {
        const x = (index * 89) % 560;
        const y = (index * 137) % 840;
        return `<circle cx="${x}" cy="${y}" r="${1 + (index % 3)}" fill="#d7c8b5"/>`;
      }).join("")}
    </g>`;
}

function leaf(x, y, r = 0, s = 1, color = "#8d9878") {
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
    <path d="M0 0 C24 -18 54 -18 80 0 C52 20 24 22 0 0Z" fill="${color}" opacity=".72"/>
    <path d="M0 0 C28 -2 54 -2 80 0" stroke="#66745e" stroke-width="2" fill="none" opacity=".5"/>
  </g>`;
}

function flower(x, y, s = 1, color = "#ead2c7", center = "#c6a46e") {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-20" r="26" fill="${color}"/>
    <circle cx="19" cy="-7" r="25" fill="${color}"/>
    <circle cx="12" cy="16" r="26" fill="${color}"/>
    <circle cx="-14" cy="15" r="25" fill="${color}"/>
    <circle cx="-20" cy="-8" r="26" fill="${color}"/>
    <circle cx="0" cy="0" r="13" fill="${center}"/>
  </g>`;
}

function floralCorner(color = "#ead2c7") {
  return `
    ${leaf(24, 96, -58, .78)}
    ${leaf(58, 42, 18, .55)}
    ${flower(74, 98, .7, color)}
    ${flower(42, 166, .48, "#f1e1d7")}
    ${leaf(485, 688, 122, .82)}
    ${leaf(450, 770, -154, .58)}
    ${flower(480, 724, .72, color)}
    ${flower(528, 636, .46, "#f1e1d7")}`;
}

function wreath(color = "#8d9878", flowerColor = "#ead2c7") {
  return `<g transform="translate(280 318)">
    <circle cx="0" cy="0" r="166" fill="none" stroke="#c6a46e" stroke-width="4" opacity=".54"/>
    ${Array.from({ length: 28 }, (_, i) => {
      const a = (i * 360 / 28) - 90;
      const rad = a * Math.PI / 180;
      const x = Math.cos(rad) * 166;
      const y = Math.sin(rad) * 166;
      return leaf(x, y, a + 45, .28, color);
    }).join("")}
    ${flower(-118, -112, .5, flowerColor)}
    ${flower(-148, 68, .42, "#f2e0d8")}
    ${flower(124, 110, .46, flowerColor)}
  </g>`;
}

function textBlock(lines = ["초대합니다"], y = 300, color = "#302b26") {
  return `<g text-anchor="middle" fill="${color}" font-family="Georgia, 'Times New Roman', serif">
    ${lines.map((line, index) => `<text x="280" y="${y + index * 54}" font-size="${index === 0 ? 46 : 34}" letter-spacing="3">${esc(line)}</text>`).join("")}
  </g>`;
}

function teddy(x = 280, y = 570, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="-48" cy="-48" r="34" fill="#d8b27d"/>
    <circle cx="48" cy="-48" r="34" fill="#d8b27d"/>
    <circle cx="0" cy="0" r="86" fill="#d6a96f"/>
    <ellipse cx="0" cy="28" rx="44" ry="34" fill="#f3dfbf"/>
    <circle cx="-28" cy="-16" r="7" fill="#3b2f28"/>
    <circle cx="28" cy="-16" r="7" fill="#3b2f28"/>
    <ellipse cx="0" cy="8" rx="13" ry="9" fill="#3b2f28"/>
    <path d="M-12 22 Q0 34 12 22" stroke="#3b2f28" stroke-width="4" fill="none"/>
  </g>`;
}

function balloons() {
  return `<g>
    <ellipse cx="140" cy="132" rx="58" ry="72" fill="#b8dbe8"/>
    <ellipse cx="230" cy="118" rx="54" ry="68" fill="#f1d3bd"/>
    <ellipse cx="326" cy="128" rx="56" ry="70" fill="#d6e3d5"/>
    <ellipse cx="418" cy="116" rx="54" ry="68" fill="#efc1ca"/>
    <g stroke="#d1a980" stroke-width="2" opacity=".65">
      <path d="M140 204 C160 300 200 370 230 470"/>
      <path d="M230 186 C240 280 250 370 254 470"/>
      <path d="M326 198 C310 300 292 390 274 470"/>
      <path d="M418 184 C390 310 336 390 286 470"/>
    </g>
  </g>`;
}

function polaroid() {
  return `<g transform="translate(190 190) rotate(3)">
    <rect x="0" y="0" width="190" height="238" fill="#fff" filter="url(#shadow)"/>
    <rect x="18" y="18" width="154" height="140" fill="#cfc8bd"/>
    <circle cx="78" cy="82" r="34" fill="#5f5449"/>
    <circle cx="114" cy="76" r="34" fill="#786d60"/>
    <path d="M38 138 C72 90 122 100 156 138" fill="#efe4d4"/>
  </g>`;
}

function svg(kind) {
  let body = "";
  let bg = "#fffaf2";
  switch (kind) {
    case "wedding-floral-corner":
      body = floralCorner("#e9cfc2") + textBlock(["이준서", "&", "김은재"], 300);
      break;
    case "wedding-white-arch":
      body = wreath("#8d9878", "#f2ede2") + textBlock(["이준서", "&", "김은재"], 304);
      break;
    case "wedding-dress":
      body = `<g transform="translate(140 98)">
        <path d="M102 0 L198 0 L220 142 L80 142Z" fill="#202020"/>
        <path d="M152 16 L128 62 L176 62Z" fill="#fff"/>
        <path d="M272 0 C390 56 412 216 340 376 C270 314 238 148 272 0Z" fill="#fbfaf7" stroke="#d9d2c7" stroke-width="4"/>
        <path d="M292 28 L368 370" stroke="#e4ded5" stroke-width="3"/>
      </g>` + textBlock(["이준서", "&", "김은재"], 366);
      break;
    case "wedding-green-wreath":
      body = wreath("#879a78", "#f2ede2") + textBlock(["이준서", "&", "김은재"], 306);
      break;
    case "wedding-gold-arch":
      body = `<circle cx="280" cy="304" r="158" fill="none" stroke="#d2aa72" stroke-width="4"/>${floralCorner("#ecd3be")}` + textBlock(["We are", "getting married"], 256);
      break;
    case "wedding-church":
      bg = "#f7f6f1";
      body = `<g stroke="#9b9b91" fill="none" stroke-width="5" opacity=".8" transform="translate(112 118)">
        <path d="M170 0 L306 100 L306 390 L34 390 L34 100Z"/>
        <path d="M170 0 L170 -70 M138 -38 L202 -38"/>
        <path d="M116 390 L116 232 C116 190 224 190 224 232 L224 390"/>
        <path d="M66 146 C110 104 232 104 276 146"/>
      </g>` + textBlock(["이준서", "&", "김은재"], 360);
      break;
    case "dol-teddy":
      bg = "#fff5df";
      body = `<path d="M70 70 H490 V710 H70Z" fill="none" stroke="#e4c79a" stroke-width="3" stroke-dasharray="12 12"/>${teddy(280, 520, .9)}${balloons()}`;
      break;
    case "dol-baby-crown":
      body = `<circle cx="280" cy="278" r="118" fill="#f3d7c7"/><path d="M210 156 L238 102 L280 152 L322 102 L350 156Z" fill="#d2aa72"/><circle cx="242" cy="268" r="10"/><circle cx="318" cy="268" r="10"/><path d="M245 318 Q280 348 315 318" stroke="#3b2f28" stroke-width="6" fill="none"/><rect x="172" y="404" width="216" height="54" rx="8" fill="#c9a066"/>${textBlock(["첫 돌", "이서준"], 510)}`;
      break;
    case "dol-rocking-horse":
      body = `${wreath("#8d9878", "#f4e5d7")}<g transform="translate(188 512)" fill="#cfa86f"><path d="M50 70 Q86 8 152 34 Q202 54 194 118 L136 118 L124 84 L82 84 L72 118 L22 118Z"/><circle cx="166" cy="24" r="28"/><path d="M8 134 Q106 184 220 134" stroke="#cfa86f" stroke-width="16" fill="none"/></g>`;
      break;
    case "dol-gingham-bow":
      bg = "#f7fbff";
      body = `<defs><pattern id="check" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#f7fbff"/><rect width="24" height="48" fill="#cce1f4" opacity=".72"/><rect width="48" height="24" fill="#cce1f4" opacity=".72"/></pattern></defs><rect width="560" height="840" fill="url(#check)"/><rect x="160" y="162" width="240" height="356" rx="10" fill="#fffdf9"/><path d="M160 170 C90 110 76 250 160 226Z" fill="#e8eef8"/><path d="M400 170 C470 110 484 250 400 226Z" fill="#e8eef8"/><circle cx="280" cy="200" r="32" fill="#d3ddec"/>${textBlock(["첫 돌", "이서준"], 326)}`;
      break;
    case "dol-balloons":
      bg = "#f3f8f7";
      body = balloons() + teddy(280, 570, .58);
      break;
    case "dol-hot-air":
      bg = "#fff3e8";
      body = `<ellipse cx="280" cy="236" rx="120" ry="150" fill="#f2d4b9"/><path d="M160 236 C202 126 358 126 400 236" fill="#f6ead7"/><path d="M210 360 L350 360 L326 430 L234 430Z" fill="#c6a46e"/><path d="M198 344 L236 430 M362 344 L324 430" stroke="#8d6a4d" stroke-width="5"/>${teddy(280, 548, .52)}`;
      break;
    case "birthday-balloons":
      bg = "#eef9fb";
      body = balloons() + textBlock(["Happy", "Birthday"], 300, "#37404a");
      break;
    case "birthday-night":
      bg = "#172436";
      body = `<rect width="560" height="840" fill="#172436"/>${Array.from({ length: 70 }, (_, i) => `<circle cx="${(i * 47) % 560}" cy="${(i * 83) % 480}" r="${1 + i % 3}" fill="#e9c76f" opacity=".85"/>`).join("")}<path d="M392 100 A78 78 0 1 0 392 256 A58 58 0 1 1 392 100Z" fill="#f2d36d"/>${textBlock(["Happy", "Birthday"], 280, "#fff6d8")}`;
      break;
    case "birthday-smiley":
      bg = "#fff2a8";
      body = `<circle cx="280" cy="360" r="104" fill="#f6d24b"/><circle cx="244" cy="330" r="12"/><circle cx="316" cy="330" r="12"/><path d="M222 382 Q280 446 338 382" stroke="#2b2824" stroke-width="10" fill="none"/>${textBlock(["Happy Birthday"], 188)}`;
      break;
    case "birthday-cake":
      bg = "#fff1f3";
      body = `<rect x="156" y="426" width="248" height="132" rx="20" fill="#f0a7b8"/><rect x="180" y="368" width="200" height="86" rx="18" fill="#f8c4cc"/><g stroke="#d89b5e" stroke-width="8"><path d="M226 350 V296"/><path d="M280 350 V286"/><path d="M334 350 V296"/></g><g fill="#f7d66d"><ellipse cx="226" cy="286" rx="13" ry="22"/><ellipse cx="280" cy="276" rx="13" ry="22"/><ellipse cx="334" cy="286" rx="13" ry="22"/></g>${textBlock(["Happy Birthday"], 214)}`;
      break;
    case "birthday-confetti":
      body = `${Array.from({ length: 44 }, (_, i) => `<rect x="${(i * 57) % 540}" y="${70 + (i * 91) % 520}" width="10" height="24" rx="4" fill="${["#f0a7b8", "#b7d7e8", "#f5d06a", "#c8dfbe"][i % 4]}" transform="rotate(${i * 23} ${(i * 57) % 540} ${70 + (i * 91) % 520})"/>`).join("")}${textBlock(["HAPPY", "BIRTHDAY"], 296)}`;
      break;
    case "birthday-teddy":
      bg = "#eaf4fb";
      body = textBlock(["Happy Birthday"], 178) + teddy(280, 520, .82);
      break;
    case "hwangap-floral":
      body = floralCorner("#eed9bf") + textBlock(["환갑을", "축하드립니다"], 328);
      break;
    case "hwangap-navy":
      bg = "#122236";
      body = `<rect width="560" height="840" fill="#122236"/>${wreath("#c6a46e", "#c6a46e")}${textBlock(["祝", "환갑을", "축하드립니다"], 222, "#f5d58a")}`;
      break;
    case "hwangap-pink-floral":
      body = floralCorner("#ecc7ba") + textBlock(["환갑을", "축하드립니다"], 328);
      break;
    case "hwangap-green":
      bg = "#31584e";
      body = `<rect width="560" height="840" fill="#31584e"/><circle cx="280" cy="300" r="160" fill="none" stroke="#91b29b" stroke-width="5"/>${textBlock(["환갑을", "축하드립니다"], 322, "#f7ead2")}`;
      break;
    case "hwangap-crane":
      bg = "#f4ead8";
      body = `<path d="M160 310 C260 190 318 294 410 212" stroke="#2e2d29" stroke-width="8" fill="none"/><path d="M258 252 C204 208 150 214 112 264 C170 258 208 278 258 252Z" fill="#f8f8f2" stroke="#2e2d29" stroke-width="4"/><path d="M318 252 C380 210 432 218 472 270 C408 260 370 280 318 252Z" fill="#f8f8f2" stroke="#2e2d29" stroke-width="4"/>${textBlock(["환갑을", "축하드립니다"], 434)}`;
      break;
    case "hwangap-calligraphy":
      body = `<text x="280" y="280" text-anchor="middle" font-size="82" font-family="Georgia, serif" writing-mode="tb" fill="#2b2824">회갑연</text>${floralCorner("#ead8c2")}`;
      break;
    case "anniversary-couple":
      bg = "#f4efe5";
      body = `<g transform="translate(188 270)"><circle cx="50" cy="38" r="32" fill="#3a3832"/><path d="M18 194 C26 86 76 86 92 194Z" fill="#5c6d5f"/><circle cx="158" cy="38" r="32" fill="#3a3832"/><path d="M120 194 C130 86 182 86 194 194Z" fill="#dac2b3"/><path d="M76 116 C112 146 138 142 168 112" stroke="#d7aaa2" stroke-width="10" fill="none"/></g>${textBlock(["우리의", "기념일"], 522)}`;
      break;
    case "anniversary-polaroid":
      body = polaroid() + textBlock(["우리의", "기념일"], 526);
      break;
    case "anniversary-heart":
      bg = "#ffe8eb";
      body = `<path d="M280 360 C170 276 206 164 280 220 C354 164 390 276 280 360Z" fill="#e76f82"/>${textBlock(["Love", "you"], 458, "#c65b72")}`;
      break;
    case "anniversary-night":
      bg = "#14223a";
      body = `<rect width="560" height="840" fill="#14223a"/><circle cx="332" cy="124" r="8" fill="#fff"/><circle cx="300" cy="530" r="38" fill="#1b1b1b"/><circle cx="352" cy="530" r="38" fill="#1b1b1b"/><path d="M180 600 Q280 548 380 600" stroke="#111" stroke-width="18" fill="none"/>${textBlock(["우리의", "1000일"], 268, "#f5f0e6")}`;
      break;
    case "anniversary-botanical":
      body = floralCorner("#e9dac3") + textBlock(["우리의", "기념일"], 318);
      break;
    case "anniversary-paris":
      body = `<path d="M280 142 L356 600 H204Z" fill="none" stroke="#8f8275" stroke-width="8"/><path d="M232 330 H328 M212 450 H348 M184 604 H376" stroke="#8f8275" stroke-width="8"/><path d="M248 220 H312" stroke="#8f8275" stroke-width="8"/>${textBlock(["우리의", "기념일"], 650)}`;
      break;
    case "other-moving":
      body = floralCorner("#d8ead5") + textBlock(["이사", "왔어요"], 326);
      break;
    case "other-graduation":
      body = `<path d="M280 190 L430 260 L280 330 L130 260Z" fill="#253044"/><rect x="244" y="320" width="72" height="56" fill="#253044"/><path d="M430 260 V350" stroke="#c6a46e" stroke-width="6"/>${textBlock(["졸업을", "축하합니다"], 480)}`;
      break;
    case "other-baby":
      body = `${wreath("#8d9878", "#f2ede2")}<g transform="translate(170 510) scale(.48)">${teddy(0, 0, 1)}</g><g transform="translate(386 510) scale(.48)">${teddy(0, 0, 1)}</g>${textBlock(["Baby", "Shower"], 292, "#5d7682")}`;
      break;
    case "other-retirement":
      body = `<g transform="translate(230 260)"><path d="M60 360 C40 220 60 80 72 0" stroke="#70835f" stroke-width="10"/><path d="M70 90 C0 70 -60 120 -52 184 C20 170 62 138 70 90Z" fill="#8d9878"/><path d="M72 20 C142 -10 206 42 188 118 C122 112 82 78 72 20Z" fill="#8d9878"/></g>${flower(280, 470, 1.2, "#e7b2a8")}${textBlock(["퇴임식", "초대합니다"], 642)}`;
      break;
    case "other-teacher":
      bg = "#fde7e8";
      body = `<g transform="translate(280 360)">${flower(0, 0, 1.45, "#e58a8d", "#c64e55")}<path d="M0 30 C-24 130 -42 212 -56 314" stroke="#70835f" stroke-width="10"/></g>${textBlock(["선생님", "감사합니다"], 640)}`;
      break;
    case "other-worship":
      bg = "#eeeeea";
      body = `<path d="M280 160 V560 M190 272 H370" stroke="#7b746e" stroke-width="24" stroke-linecap="round"/><path d="M120 690 C230 600 330 600 440 690" fill="#f8f8f3"/>${floralCorner("#f2ede2")}${textBlock(["예배에", "초대합니다"], 620)}`;
      break;
    default:
      body = wreath() + textBlock(["초대장"], 320);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="840" viewBox="0 0 560 840">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#6b5540" flood-opacity=".16"/>
      </filter>
    </defs>
    ${paper(bg)}
    ${body}
  </svg>`;
}

for (const [id, kind] of cards) {
  const svgPath = join(publicDir, `${id}.svg`);
  const pngPath = join(publicDir, `${id}.png`);
  const mobilePngPath = join(mobileDir, `${id}.png`);
  writeFileSync(svgPath, svg(kind));
  execFileSync("sips", ["-s", "format", "png", svgPath, "--out", pngPath], { stdio: "ignore" });
  execFileSync("sips", ["-s", "format", "png", svgPath, "--out", mobilePngPath], { stdio: "ignore" });
}

console.log(`Generated ${cards.length} reference template assets.`);
