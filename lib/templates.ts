import { weddingSoftPastel } from "./template-assets/weddingSoftPastel";
import { weddingWatercolorBloom } from "./template-assets/weddingWatercolorBloom";

export type TemplatePreset = {
  id: string;
  category: string;
  name: string;
  badge: string;
  desc: string;
  tags: string[];
  html: string;
};

function withArtwork(className: string, src: string, content: string) {
  return `<div class="${className} tmpl-with-artwork">
    <div class="tmpl-artwork">
      <img class="tmpl-artwork-image" src="${src}" alt="" loading="lazy" decoding="async" />
    </div>
    <div class="tmpl-copy">${content}</div>
  </div>`;
}

function withStandaloneArtwork(className: string, src: string, content: string) {
  return `<div class="${className} tmpl-standalone-art">
    <img class="tmpl-card-image" src="${src}" alt="" loading="lazy" decoding="async" />
    <div class="tmpl-card-copy">${content}</div>
  </div>`;
}

export const templates: TemplatePreset[] = [
  // ===== WEDDING (5+) =====
  {
    id: 'wedding-classic',
    category: 'wedding',
    name: '플라워 보더',
    badge: '결혼식',
    desc: '꽃잎이 감싸는 클래식 결혼식 템플릿.',
    tags: ['#로즈', '#프레임', '#클래식'],
    html: withStandaloneArtwork('tmpl-wedding-classic', '/images/generated/wedding/wedding-premium-romantic-arch.png', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">Kim &amp; Lee</div>
      <div class="tmpl-copy-date">2026. 04. 12 SAT PM 2:00</div>
      <div class="tmpl-copy-msg">소중한 분들을 초대합니다</div>
    `)
  },
  {
    id: 'wedding-modern',
    category: 'wedding',
    name: '화이트 플라워',
    badge: '결혼식',
    desc: '하얀 꽃과 그린 잎사귀가 둘러주는 결혼식 템플릿.',
    tags: ['#보태니컬', '#그린', '#아치'],
    html: withStandaloneArtwork('tmpl-wedding-modern', '/images/generated/wedding/wedding-premium-flower-garden.png', `
      <div class="tmpl-copy-kicker">WEDDING DAY</div>
      <div class="tmpl-copy-names">Minjun &amp; Sua</div>
      <div class="tmpl-copy-date">2026. 05. 16 SAT PM 12:00</div>
      <div class="tmpl-copy-msg">그랜드볼룸 4층 크리스탈홀</div>
    `)
  },
  {
    id: 'wedding-floral',
    category: 'wedding',
    name: '드레스 클래식',
    badge: '결혼식',
    desc: '턱시도와 웨딩드레스 실루엣을 담은 결혼식 템플릿.',
    tags: ['#미니멀', '#화이트', '#블룸'],
    html: withStandaloneArtwork('tmpl-wedding-floral', '/images/generated/wedding/wedding-premium-the-classic.png', `
      <div class="tmpl-copy-kicker">INVITATION</div>
      <div class="tmpl-copy-names">Jung &amp; Choi</div>
      <div class="tmpl-copy-date">2026. 07. 18 SAT</div>
      <div class="tmpl-copy-msg">서울 더파인 웨딩홀</div>
    `)
  },
  {
    id: 'wedding-minimal',
    category: 'wedding',
    name: '그린 리스',
    badge: '결혼식',
    desc: '초록 리스가 정갈하게 감싸는 결혼식 템플릿.',
    tags: ['#코너', '#플라워', '#소프트'],
    html: withStandaloneArtwork('tmpl-wedding-minimal', '/images/generated/wedding/wedding-premium-wedding-day.png', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">Han &amp; Song</div>
      <div class="tmpl-copy-date">2026. 05. 23 SAT</div>
      <div class="tmpl-copy-msg">함께해 주시면 감사하겠습니다</div>
    `)
  },
  {
    id: 'wedding-nature',
    category: 'wedding',
    name: '골드 아치',
    badge: '결혼식',
    desc: '금빛 라인과 잎사귀가 어우러진 결혼식 템플릿.',
    tags: ['#골드', '#포멀', '#보더'],
    html: withStandaloneArtwork('tmpl-wedding-nature', '/images/generated/wedding/wedding-premium-romantic-arch.png', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">Park &amp; Lee</div>
      <div class="tmpl-copy-date">2026. 09. 14 SUN PM 1:30</div>
      <div class="tmpl-copy-msg">The Fine Hall Grand Room</div>
    `)
  },
  {
    id: 'wedding-rose-gold',
    category: 'wedding',
    name: '채플 스케치',
    badge: '결혼식',
    desc: '채플 라인 드로잉 감성의 결혼식 템플릿.',
    tags: ['#로즈골드', '#보더', '#우아함'],
    html: withStandaloneArtwork('tmpl-wedding-rose-gold', '/images/generated/wedding/wedding-premium-chapel-line.png', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">Min &amp; Hye</div>
      <div class="tmpl-copy-date">2026. 10. 03 SAT PM 3:00</div>
      <div class="tmpl-copy-msg">우리의 시작을 함께 축복해 주세요</div>
    `)
  },
  {
    id: 'wedding-flower-garden',
    category: 'wedding',
    name: '플라워 가든',
    badge: '결혼식',
    desc: '화사한 플로럴 아치가 중심이 되는 세로형 결혼식 템플릿.',
    tags: ['#플로럴', '#아치', '#세로형'],
    html: withStandaloneArtwork('tmpl-wedding-flower-garden', '/images/highres/wedding/flower-garden.svg', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">이준서 &amp; 김은재</div>
      <div class="tmpl-copy-date">2026. 05. 24 SAT PM 2:00</div>
      <div class="tmpl-copy-msg">꽃처럼 환한 날, 함께해 주세요</div>
    `)
  },
  {
    id: 'wedding-minimal-line',
    category: 'wedding',
    name: '미니멀 라인',
    badge: '결혼식',
    desc: '여백과 얇은 보태니컬 라인으로 완성한 웨딩 템플릿.',
    tags: ['#미니멀', '#라인', '#보태니컬'],
    html: withStandaloneArtwork('tmpl-wedding-minimal-line', '/images/highres/wedding/minimal-line.svg', `
      <div class="tmpl-copy-kicker">WE ARE GETTING MARRIED</div>
      <div class="tmpl-copy-names">이준서 &amp; 김은재</div>
      <div class="tmpl-copy-date">2026. 06. 21 SAT PM 2:00</div>
      <div class="tmpl-copy-msg">소중한 걸음으로 축복해 주세요</div>
    `)
  },
  {
    id: 'wedding-ribbon-frame',
    category: 'wedding',
    name: '리본 프레임',
    badge: '결혼식',
    desc: '부드러운 리본 장식과 파스텔 프레임의 웨딩 템플릿.',
    tags: ['#리본', '#파스텔', '#프레임'],
    html: withStandaloneArtwork('tmpl-wedding-ribbon-frame', '/images/highres/wedding/ribbon-frame.svg', `
      <div class="tmpl-copy-kicker">SAVE THE DATE</div>
      <div class="tmpl-copy-names">이준서 &amp; 김은재</div>
      <div class="tmpl-copy-date">2026. 07. 11 SAT PM 1:00</div>
      <div class="tmpl-copy-msg">따뜻한 마음으로 초대합니다</div>
    `)
  },
  {
    id: 'wedding-starry-garden',
    category: 'wedding',
    name: '별빛 가든',
    badge: '결혼식',
    desc: '짙은 밤색 배경에 금빛 플라워가 빛나는 웨딩 템플릿.',
    tags: ['#네이비', '#골드', '#별빛'],
    html: withStandaloneArtwork('tmpl-wedding-starry-garden', '/images/highres/wedding/starry-garden.svg', `
      <div class="tmpl-copy-kicker">WEDDING NIGHT</div>
      <div class="tmpl-copy-names">이준서 &amp; 김은재</div>
      <div class="tmpl-copy-date">2026. 08. 15 SAT PM 5:00</div>
      <div class="tmpl-copy-msg">별빛 아래 시작되는 약속</div>
    `)
  },
  {
    id: 'wedding-soft-pastel',
    category: 'wedding',
    name: '소프트 파스텔',
    badge: '결혼식',
    desc: '부드러운 파스텔 톤과 꽃 장식이 어우러진 웨딩 템플릿.',
    tags: ['#파스텔', '#수채화', '#로맨틱'],
    html: withStandaloneArtwork('tmpl-wedding-soft-pastel', weddingSoftPastel, `
      <div class="tmpl-copy-kicker">WE ARE GETTING MARRIED</div>
      <div class="tmpl-copy-names">이준서 &amp; 김은재</div>
      <div class="tmpl-copy-date">2026. 09. 05 SAT PM 2:00</div>
      <div class="tmpl-copy-msg">은은한 색감으로 전하는 초대</div>
    `)
  },
  {
    id: 'wedding-watercolor-bloom',
    category: 'wedding',
    name: '수채화 블룸',
    badge: '결혼식',
    desc: '수채화 꽃 번짐과 따뜻한 여백이 있는 웨딩 템플릿.',
    tags: ['#수채화', '#블룸', '#내추럴'],
    html: withStandaloneArtwork('tmpl-wedding-watercolor-bloom', weddingWatercolorBloom, `
      <div class="tmpl-copy-kicker">INVITATION</div>
      <div class="tmpl-copy-names">이준서 &amp; 김은재</div>
      <div class="tmpl-copy-date">2026. 10. 10 SAT PM 3:00</div>
      <div class="tmpl-copy-msg">맑은 꽃빛처럼 따뜻한 초대</div>
    `)
  },

  // ===== DOL (5+) =====
  {
    id: 'dol-cute',
    category: 'dol',
    name: '테디 벌룬',
    badge: '돌잔치',
    desc: '곰돌이와 풍선이 반겨주는 돌잔치 템플릿.',
    tags: ['#곰돌이', '#풍선', '#옐로우'],
    html: withStandaloneArtwork('tmpl-dol-cute', '/images/generated/dol/dol-teddy-balloon.png', `
      <div class="tmpl-copy-kicker">FIRST BIRTHDAY</div>
      <div class="tmpl-copy-names">김하늘</div>
      <div class="tmpl-copy-date">2026.03.22 (토) 오후 1시</div>
      <div class="tmpl-copy-msg">소중한 발걸음으로 함께해 주세요</div>
    `)
  },
  {
    id: 'dol-pastel',
    category: 'dol',
    name: '아기 왕관',
    badge: '돌잔치',
    desc: '왕관을 쓴 아기 얼굴이 중심인 돌잔치 템플릿.',
    tags: ['#리본', '#크라운', '#핑크'],
    html: withStandaloneArtwork('tmpl-dol-pastel', '/images/generated/dol/dol-baby-crown-character.png', `
      <div class="tmpl-copy-kicker">첫돌을 맞이했어요</div>
      <div class="tmpl-copy-names">이세아</div>
      <div class="tmpl-copy-date">2026.04.05 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">귀여운 첫 생일잔치에 초대합니다</div>
    `)
  },
  {
    id: 'dol-blue',
    category: 'dol',
    name: '목마 첫돌',
    badge: '돌잔치',
    desc: '목마와 그린 장식이 있는 돌잔치 템플릿.',
    tags: ['#우주', '#블루', '#별'],
    html: withStandaloneArtwork('tmpl-dol-blue', '/images/generated/dol/dol-rocking-horse.png', `
      <div class="tmpl-copy-kicker">ONE YEAR OLD</div>
      <div class="tmpl-copy-names">박도윤</div>
      <div class="tmpl-copy-date">2026.05.10 (토) 오후 2시</div>
      <div class="tmpl-copy-msg">첫 번째 생일잔치에 함께해 주세요</div>
    `)
  },
  {
    id: 'dol-nature',
    category: 'dol',
    name: '체크 리본',
    badge: '돌잔치',
    desc: '파란 체크와 리본으로 꾸민 돌잔치 템플릿.',
    tags: ['#골드', '#크라운', '#프리미엄'],
    html: withStandaloneArtwork('tmpl-dol-nature', '/images/generated/dol/dol-blue-ribbon-check.png', `
      <div class="tmpl-copy-kicker">FIRST BIRTHDAY</div>
      <div class="tmpl-copy-names">정예준</div>
      <div class="tmpl-copy-date">2026.07.20 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">첫돌을 함께 축하해 주세요</div>
    `)
  },
  {
    id: 'dol-gold',
    category: 'dol',
    name: '파스텔 풍선',
    badge: '돌잔치',
    desc: '파스텔 풍선이 부드럽게 떠 있는 돌잔치 템플릿.',
    tags: ['#케이크', '#파티', '#러블리'],
    html: withStandaloneArtwork('tmpl-dol-gold', '/images/generated/dol/dol-pastel-cake-balloons.png', `
      <div class="tmpl-copy-kicker">돌잔치 초대장</div>
      <div class="tmpl-copy-names">우리 아이 첫 생일</div>
      <div class="tmpl-copy-date">2026.08.15 (토) 오후 12시</div>
      <div class="tmpl-copy-msg">기쁜 날 함께해 주세요</div>
    `)
  },

  // ===== HWANGAP (5+) =====
  {
    id: 'hwangap-classic',
    category: 'hwangap',
    name: '플라워 환갑',
    badge: '환갑잔치',
    desc: '꽃 장식이 품격 있게 감싸는 환갑 템플릿.',
    tags: ['#금빛', '#전통', '#품격'],
    html: withStandaloneArtwork('tmpl-hwangap-classic', '/images/generated/hwangap/hwangap-floral-classic.png', `
      <div class="tmpl-copy-kicker">회갑연 초대장</div>
      <div class="tmpl-copy-names">김철수</div>
      <div class="tmpl-copy-date">2026.05.03 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">환갑을 함께 축하해 주세요</div>
    `)
  },
  {
    id: 'hwangap-modern',
    category: 'hwangap',
    name: '네이비 금장',
    badge: '환갑잔치',
    desc: '짙은 남색과 금장 포인트의 환갑 템플릿.',
    tags: ['#문양', '#전통', '#격식'],
    html: withStandaloneArtwork('tmpl-hwangap-modern', '/images/generated/hwangap/hwangap-navy-gold.png', `
      <div class="tmpl-copy-kicker">HWAN-GAP CELEBRATION</div>
      <div class="tmpl-copy-names">이영자 여사님</div>
      <div class="tmpl-copy-date">2026.06.21 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">진심으로 축하드립니다</div>
    `)
  },
  {
    id: 'hwangap-red',
    category: 'hwangap',
    name: '핑크 플로럴',
    badge: '환갑잔치',
    desc: '화사한 분홍 꽃으로 꾸민 환갑 템플릿.',
    tags: ['#레드', '#장수', '#보더'],
    html: withStandaloneArtwork('tmpl-hwangap-red', '/images/generated/hwangap/hwangap-pink-floral.png', `
      <div class="tmpl-copy-kicker">환갑 회갑연</div>
      <div class="tmpl-copy-names">박순희</div>
      <div class="tmpl-copy-date">2026.04.26 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">건강과 장수를 기원하며 초대합니다</div>
    `)
  },
  {
    id: 'hwangap-floral',
    category: 'hwangap',
    name: '그린 전통',
    badge: '환갑잔치',
    desc: '초록 전통 문양을 닮은 환갑 템플릿.',
    tags: ['#플로럴', '#화사', '#품격'],
    html: withStandaloneArtwork('tmpl-hwangap-floral', '/images/generated/hwangap/hwangap-green-traditional.png', `
      <div class="tmpl-copy-kicker">칠순연 초대장</div>
      <div class="tmpl-copy-names">최정숙</div>
      <div class="tmpl-copy-date">2026.09.13 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">기쁜 날 자리를 빛내 주세요</div>
    `)
  },
  {
    id: 'hwangap-hanja',
    category: 'hwangap',
    name: '학 그림',
    badge: '환갑잔치',
    desc: '학 일러스트가 담긴 전통 환갑 템플릿.',
    tags: ['#서예', '#정통', '#한자'],
    html: withStandaloneArtwork('tmpl-hwangap-hanja', '/images/generated/hwangap/hwangap-crane-pine.png', `
      <div class="tmpl-copy-kicker">壽 福</div>
      <div class="tmpl-copy-names">손기웅</div>
      <div class="tmpl-copy-date">2026.08.02 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">건강과 행복이 가득하길 바라며 초대합니다</div>
    `)
  },

  // ===== BRIDAL SHOWER (5+) =====
  {
    id: 'bridal-pink',
    category: 'bridal',
    name: '핑크 드림',
    badge: '브라이덜샤워',
    desc: '핑크 포인트와 리본 장식이 사랑스러운 브라이덜샤워 카드.',
    tags: ['#핑크', '#리본', '#샤워'],
    html: withStandaloneArtwork('tmpl-bridal-pink', '/images/generated/bridal/bridal-pink-ribbon.png', `
      <div class="tmpl-copy-kicker">BRIDAL SHOWER</div>
      <div class="tmpl-copy-names">Soon-to-be Mrs. Kim</div>
      <div class="tmpl-copy-date">2026.03.29 SAT 3PM</div>
      <div class="tmpl-copy-msg">함께 축하해요!</div>
    `)
  },
  {
    id: 'bridal-boho',
    category: 'bridal',
    name: '보헤미안',
    badge: '브라이덜샤워',
    desc: '차분한 톤과 드라이 플라워 느낌이 어우러진 브라이덜샤워 카드.',
    tags: ['#보헤미안', '#어스톤', '#감성'],
    html: withStandaloneArtwork('tmpl-bridal-boho', '/images/generated/bridal/bridal-boho-dried-flower.png', `
      <div class="tmpl-copy-kicker">BRIDAL SHOWER</div>
      <div class="tmpl-copy-names">Park Ji-yeon</div>
      <div class="tmpl-copy-date">2026.04.18 SAT 2PM</div>
      <div class="tmpl-copy-msg">자유로운 감성의 파티에 초대합니다</div>
    `)
  },
  {
    id: 'bridal-modern',
    category: 'bridal',
    name: '블랙 럭셔리',
    badge: '브라이덜샤워',
    desc: '화이트 여백 위에 포인트 장식이 살아 있는 깔끔한 럭셔리 카드.',
    tags: ['#럭셔리', '#화이트', '#하이엔드'],
    html: withStandaloneArtwork('tmpl-bridal-modern', '/images/generated/bridal/bridal-black-luxury.png', `
      <div class="tmpl-copy-kicker">LUXURY BRIDAL SHOWER</div>
      <div class="tmpl-copy-names">Lee Soo-yeon</div>
      <div class="tmpl-copy-date">2026.05.09 SAT 7PM</div>
      <div class="tmpl-copy-msg">특별한 밤, 함께 빛나요</div>
    `)
  },
  {
    id: 'bridal-mint',
    category: 'bridal',
    name: '민트 프레쉬',
    badge: '브라이덜샤워',
    desc: '부드러운 컬러감과 여백이 시원한 민트 무드 브라이덜샤워 카드.',
    tags: ['#민트', '#청량', '#상큼'],
    html: withStandaloneArtwork('tmpl-bridal-mint', '/images/generated/bridal/bridal-mint-fresh.png', `
      <div class="tmpl-copy-kicker">BRIDAL SHOWER</div>
      <div class="tmpl-copy-names">Choi Min-ju</div>
      <div class="tmpl-copy-date">2026.06.13 SAT 3PM</div>
      <div class="tmpl-copy-msg">신선하고 특별한 파티에 초대합니다</div>
    `)
  },

  // ===== BIRTHDAY (5+) =====
  {
    id: 'birthday-fun',
    category: 'birthday',
    name: '풍선 생일',
    badge: '생일파티',
    desc: '하늘색 풍선으로 시작하는 생일 템플릿.',
    tags: ['#바다', '#동물친구', '#파티'],
    html: withStandaloneArtwork('tmpl-birthday-fun', '/images/generated/birthday/birthday-blue-balloons.png', `
      <div class="tmpl-copy-kicker">BABY BIRTHDAY PARTY</div>
      <div class="tmpl-copy-names">우리 아이 첫 번째 생일</div>
      <div class="tmpl-copy-date">2026.03.22 (토) 오후 1시</div>
      <div class="tmpl-copy-msg">신나는 파티에 초대합니다</div>
    `)
  },
  {
    id: 'birthday-elegant',
    category: 'birthday',
    name: '밤하늘 생일',
    badge: '생일파티',
    desc: '달과 별이 반짝이는 생일 템플릿.',
    tags: ['#샤크', '#버블', '#블루'],
    html: withStandaloneArtwork('tmpl-birthday-elegant', '/images/generated/birthday/birthday-moon-stars.png', `
      <div class="tmpl-copy-kicker">BIRTHDAY CELEBRATION</div>
      <div class="tmpl-copy-names">한 해린</div>
      <div class="tmpl-copy-date">2026.05.10 (토) 오후 2시</div>
      <div class="tmpl-copy-msg">바닷속 친구들과 만나요</div>
    `)
  },
  {
    id: 'birthday-kids',
    category: 'birthday',
    name: '스마일 생일',
    badge: '생일파티',
    desc: '노란 스마일이 밝게 웃는 생일 템플릿.',
    tags: ['#정글', '#동물', '#탐험'],
    html: withStandaloneArtwork('tmpl-birthday-kids', '/images/generated/birthday/birthday-smile-confetti.png', `
      <div class="tmpl-copy-kicker">BIRTHDAY PARTY</div>
      <div class="tmpl-copy-names">정글 탐험대 초대</div>
      <div class="tmpl-copy-date">2026.06.14 (일) 오후 1시</div>
      <div class="tmpl-copy-msg">동물 친구들과 함께 축하해요</div>
    `)
  },

  // ===== HOUSEWARMING =====
  {
    id: 'house-warm',
    category: 'housewarming',
    name: '그린 집들이',
    badge: '집들이',
    desc: '새 보금자리를 알리는 따뜻한 그린 집들이 초대장.',
    tags: ['#집들이', '#그린', '#따뜻한'],
    html: withArtwork('tmpl-house-warm', '/images/generated/housewarming/housewarming-green-home.png', `
      <div class="title">집들이에 초대합니다</div>
      <div class="address">서울시 마포구 합정동 123-45</div>
      <div class="date">2026.04.19 (토) 오후 4시</div>
      <div class="msg">새 집에서 함께 따뜻한 시간<br/>보내요!</div>
    `)
  },
  {
    id: 'house-modern',
    category: 'housewarming',
    name: '모던 화이트',
    badge: '집들이',
    desc: '모던하고 깔끔한 화이트 인테리어 감성의 집들이 초대장.',
    tags: ['#모던', '#화이트', '#인테리어'],
    html: withStandaloneArtwork('tmpl-house-modern', '/images/generated/housewarming/housewarming-modern-white.png', `
      <div class="tmpl-copy-kicker">HOUSEWARMING</div>
      <div class="tmpl-copy-names">Kim &amp; Lee의 새집</div>
      <div class="tmpl-copy-date">2026.03.28 (SAT) 5PM</div>
      <div class="tmpl-copy-msg">서울시 강남구 청담동</div>
    `)
  },

  // ===== BABY SHOWER =====
  {
    id: 'baby-shower',
    category: 'baby',
    name: '블루 스카이',
    badge: '베이비샤워',
    desc: '하늘빛 파란색의 포근한 베이비샤워 초대장.',
    tags: ['#베이비', '#블루', '#포근'],
    html: withArtwork('tmpl-baby-shower', '/images/generated/baby/baby-blue-clouds.png', `
      <div class="title">BABY SHOWER</div>
      <div class="name">Yoon Ji-hyun의 Baby</div>
      <div class="date">2026.03.08 (SUN) 2PM</div>
      <div class="msg">새 생명의 탄생을<br/>함께 축하해 주세요</div>
    `)
  },
  {
    id: 'baby-pink',
    category: 'baby',
    name: '핑크 베이비',
    badge: '베이비샤워',
    desc: '핑크빛 공주 테마의 사랑스러운 베이비샤워 초대장.',
    tags: ['#베이비', '#핑크', '#공주'],
    html: withStandaloneArtwork('tmpl-baby-pink', '/images/generated/baby/baby-pink-princess.png', `
      <div class="tmpl-copy-kicker">BABY SHOWER</div>
      <div class="tmpl-copy-names">Oh Sung-hyun's Baby Girl</div>
      <div class="tmpl-copy-date">2026.04.26 (SUN) 2PM</div>
      <div class="tmpl-copy-msg">작은 공주의 탄생을 함께 축하해 주세요</div>
    `)
  },

  // ===== GRADUATION =====
  {
    id: 'graduation',
    category: 'graduation',
    name: '블루 졸업',
    badge: '졸업파티',
    desc: '네이비 블루의 격조 있는 졸업 파티 초대장.',
    tags: ['#졸업', '#네이비', '#격식'],
    html: withArtwork('tmpl-graduation', '/images/generated/graduation/graduation-navy-cap.png', `
      <div class="title">GRADUATION PARTY</div>
      <div class="name">Lim Jae-won</div>
      <div class="sub">서울대학교 경영학과</div>
      <div class="date">2026.02.28 (SAT) 7PM</div>
    `)
  },
  {
    id: 'graduation-warm',
    category: 'graduation',
    name: '골든 졸업',
    badge: '졸업파티',
    desc: '황금빛의 따뜻하고 화사한 졸업 파티 초대장.',
    tags: ['#졸업', '#골드', '#화사'],
    html: withStandaloneArtwork('tmpl-graduation-warm', '/images/generated/graduation/graduation-golden-cap.png', `
      <div class="tmpl-copy-kicker">GRADUATION PARTY</div>
      <div class="tmpl-copy-names">Shin Da-sol</div>
      <div class="tmpl-copy-date">2026.02.28 (SAT) 6PM</div>
      <div class="tmpl-copy-msg">졸업 파티에 초대합니다</div>
    `)
  },

  // ===== BUSINESS =====
  {
    id: 'business',
    category: 'business',
    name: '비즈니스 블루',
    badge: '비즈니스',
    desc: '신뢰와 전문성을 담은 비즈니스 행사 초대장.',
    tags: ['#비즈니스', '#전문', '#행사'],
    html: withArtwork('tmpl-business', '/images/generated/business/business-blue-conference.png', `
      <div class="company">INVITEHUB CONFERENCE 2026</div>
      <div class="title">연간 비즈니스 컨퍼런스</div>
      <div class="date">2026.05.22 (FRI) 10AM</div>
      <div class="venue">코엑스 그랜드볼룸 A홀</div>
    `)
  },
  {
    id: 'business-dark',
    category: 'business',
    name: '다크 프리미엄',
    badge: '비즈니스',
    desc: '블랙 배경의 프리미엄 비즈니스 행사 초대장.',
    tags: ['#다크', '#프리미엄', '#비즈니스'],
    html: withStandaloneArtwork('tmpl-business-dark', '/images/generated/business/business-dark-gala.png', `
      <div class="tmpl-copy-kicker">PREMIUM GALA DINNER</div>
      <div class="tmpl-copy-names">InviteHub Awards 2026</div>
      <div class="tmpl-copy-date">2026.12.12 (SAT) 7PM</div>
      <div class="tmpl-copy-msg">최고의 밤에 함께해 주세요</div>
    `)
  },
  {
    id: 'dol-eucalyptus',
    category: 'dol',
    name: '열기구 첫돌',
    badge: '돌잔치',
    desc: '열기구와 아기자기한 장식의 돌잔치 템플릿.',
    tags: ['#유칼립투스', '#케이크', '#내추럴'],
    html: withStandaloneArtwork('tmpl-dol-eucalyptus', '/images/generated/dol/dol-rocking-horse.png', `
      <div class="tmpl-copy-kicker">첫 돌</div>
      <div class="tmpl-copy-names">이서준</div>
      <div class="tmpl-copy-date">2025.06.21 SAT PM 1:00</div>
      <div class="tmpl-copy-msg">그랜드컨벤션</div>
    `)
  },
  {
    id: 'dol-star-cake',
    category: 'dol',
    name: '골드 스타 케이크',
    badge: '돌잔치',
    desc: '별 장식과 골드 포인트가 가볍게 반짝이는 화사한 돌잔치 카드.',
    tags: ['#골드', '#별', '#화사함'],
    html: withStandaloneArtwork('tmpl-dol-star-cake', '/images/generated/dol/dol-pastel-cake-balloons.png', `
      <div class="tmpl-copy-kicker">첫 돌</div>
      <div class="tmpl-copy-names">이서준</div>
      <div class="tmpl-copy-date">2025.06.21 SAT PM 1:00</div>
      <div class="tmpl-copy-msg">함께 축하해 주세요</div>
    `)
  },
  {
    id: 'dol-blue-balloon',
    category: 'dol',
    name: '블루 벌룬 케이크',
    badge: '돌잔치',
    desc: '하늘색 풍선과 케이크가 어우러진 산뜻한 블루 무드 돌잔치 카드.',
    tags: ['#블루', '#풍선', '#산뜻함'],
    html: withStandaloneArtwork('tmpl-dol-blue-balloon', '/images/generated/dol/dol-blue-ribbon-check.png', `
      <div class="tmpl-copy-kicker">첫 돌</div>
      <div class="tmpl-copy-names">이서준</div>
      <div class="tmpl-copy-date">2025.06.21 SAT PM 1:00</div>
      <div class="tmpl-copy-msg">우리집</div>
    `)
  },
  {
    id: 'dol-pink-first',
    category: 'dol',
    name: '핑크 퍼스트 케이크',
    badge: '돌잔치',
    desc: '핑크 촛불과 파스텔 도트가 사랑스럽게 어우러진 첫 돌 초대장.',
    tags: ['#핑크', '#퍼스트', '#파스텔'],
    html: withStandaloneArtwork('tmpl-dol-pink-first', '/images/generated/dol/dol-baby-crown-character.png', `
      <div class="tmpl-copy-kicker">1st Birthday</div>
      <div class="tmpl-copy-names">이서준</div>
      <div class="tmpl-copy-date">2025.06.21 SAT PM 1:00</div>
      <div class="tmpl-copy-msg">첫 생일을 축하해 주세요</div>
    `)
  },
  {
    id: 'hwangap-branch',
    category: 'hwangap',
    name: '세로 회갑연',
    badge: '환갑잔치',
    desc: '세로 서체와 가지 장식의 회갑연 템플릿.',
    tags: ['#미니멀', '#가지', '#정갈함'],
    html: withStandaloneArtwork('tmpl-hwangap-branch', '/images/generated/hwangap/hwangap-floral-classic.png', `
      <div class="tmpl-copy-kicker">회갑연</div>
      <div class="tmpl-copy-names">초대합니다</div>
      <div class="tmpl-copy-date">2025.07.13 SAT PM 12:00</div>
      <div class="tmpl-copy-msg">호텔연회장</div>
    `)
  },
  {
    id: 'birthday-ocean-shark',
    category: 'birthday',
    name: '케이크 생일',
    badge: '생일파티',
    desc: '핑크 케이크와 촛불이 있는 생일 템플릿.',
    tags: ['#상어', '#바다', '#청량'],
    html: withStandaloneArtwork('tmpl-birthday-ocean-shark', '/images/generated/birthday/birthday-blue-balloons.png', `
      <div class="tmpl-copy-kicker">Happy Birthday</div>
      <div class="tmpl-copy-names">지우야</div>
      <div class="tmpl-copy-date">2025.06.30 PM 5:00</div>
      <div class="tmpl-copy-msg">생일축하해!</div>
    `)
  },
  {
    id: 'birthday-unicorn',
    category: 'birthday',
    name: '컨페티 생일',
    badge: '생일파티',
    desc: '알록달록 컨페티로 꾸민 생일 템플릿.',
    tags: ['#유니콘', '#무지개', '#파스텔'],
    html: withStandaloneArtwork('tmpl-birthday-unicorn', '/images/generated/birthday/birthday-smile-confetti.png', `
      <div class="tmpl-copy-kicker">HAPPY BIRTHDAY</div>
      <div class="tmpl-copy-names">지우야</div>
      <div class="tmpl-copy-date">2025.06.30 PM 5:00</div>
      <div class="tmpl-copy-msg">사랑해!</div>
    `)
  },
  {
    id: 'birthday-winter-penguin',
    category: 'birthday',
    name: '곰돌이 생일',
    badge: '생일파티',
    desc: '곰돌이와 따뜻한 파티 무드의 생일 템플릿.',
    tags: ['#펭귄', '#겨울', '#스노우'],
    html: withStandaloneArtwork('tmpl-birthday-winter-penguin', '/images/generated/birthday/birthday-bear-party.png', `
      <div class="tmpl-copy-kicker">Happy Birthday</div>
      <div class="tmpl-copy-names">지우야</div>
      <div class="tmpl-copy-date">2025.06.30 PM 5:00</div>
      <div class="tmpl-copy-msg">생일축하해!</div>
    `)
  },
  {
    id: 'birthday-city-bus',
    category: 'birthday',
    name: '시티 버스',
    badge: '생일파티',
    desc: '도시 풍경과 귀여운 버스가 달리는 경쾌한 생일파티 카드.',
    tags: ['#버스', '#도시', '#활기'],
    html: withStandaloneArtwork('tmpl-birthday-city-bus', '/images/generated/birthday/birthday-blue-balloons.png', `
      <div class="tmpl-copy-kicker">HAPPY BIRTHDAY</div>
      <div class="tmpl-copy-names">지우야</div>
      <div class="tmpl-copy-date">2025.06.30 PM 5:00</div>
      <div class="tmpl-copy-msg">우리집</div>
    `)
  },
  {
    id: 'birthday-hero-star',
    category: 'birthday',
    name: '히어로 스타',
    badge: '생일파티',
    desc: '별 포인트와 히어로 망토가 눈에 들어오는 씩씩한 생일파티 카드.',
    tags: ['#히어로', '#별', '#레드블루'],
    html: withStandaloneArtwork('tmpl-birthday-hero-star', '/images/generated/birthday/birthday-smile-confetti.png', `
      <div class="tmpl-copy-kicker">Happy Birthday</div>
      <div class="tmpl-copy-names">지우야</div>
      <div class="tmpl-copy-date">2025.06.30 PM 5:00</div>
      <div class="tmpl-copy-msg">사랑해!</div>
    `)
  },
  {
    id: 'birthday-safari-jungle',
    category: 'birthday',
    name: '사파리 정글',
    badge: '생일파티',
    desc: '사파리 동물 친구들과 잎사귀 프레임이 가득한 정글 생일 초대장.',
    tags: ['#사파리', '#정글', '#동물'],
    html: withStandaloneArtwork('tmpl-birthday-safari-jungle', '/images/generated/birthday/birthday-safari-jungle.png', `
      <div class="tmpl-copy-kicker">HAPPY BIRTHDAY</div>
      <div class="tmpl-copy-names">지우야</div>
      <div class="tmpl-copy-date">2025.06.30 PM 5:00</div>
      <div class="tmpl-copy-msg">초대합니다</div>
    `)
  },
  {
    id: 'anniversary-tulip',
    category: 'anniversary',
    name: '커플 기념일',
    badge: '기념일',
    desc: '두 사람의 모습을 담은 기념일 템플릿.',
    tags: ['#튤립', '#기념일', '#감성'],
    html: withStandaloneArtwork('tmpl-anniversary-tulip', '/images/generated/anniversary/anniversary-tulip.png', `
      <div class="tmpl-copy-kicker">Always with you</div>
      <div class="tmpl-copy-names">우리의 기념일</div>
      <div class="tmpl-copy-date">2025.05.20 TUE</div>
      <div class="tmpl-copy-msg">사랑하는 우리에게</div>
    `)
  },
  {
    id: 'anniversary-photo',
    category: 'anniversary',
    name: '폴라로이드',
    badge: '기념일',
    desc: '작은 사진과 추억을 담는 기념일 템플릿.',
    tags: ['#사진', '#폴라로이드', '#추억'],
    html: withStandaloneArtwork('tmpl-anniversary-photo', '/images/generated/anniversary/anniversary-polaroid-stilllife.png', `
      <div class="tmpl-copy-kicker">Always with you</div>
      <div class="tmpl-copy-names">우리의 기념일</div>
      <div class="tmpl-copy-date">2025.05.20 TUE</div>
      <div class="tmpl-copy-msg">함께한 날들 모두 소중해</div>
    `)
  },
  {
    id: 'anniversary-heart',
    category: 'anniversary',
    name: '러브 하트',
    badge: '기념일',
    desc: '분홍 하트와 러브 레터 느낌의 기념일 템플릿.',
    tags: ['#하트', '#핑크', '#러브'],
    html: withStandaloneArtwork('tmpl-anniversary-heart', '/images/generated/anniversary/anniversary-heart-letter.png', `
      <div class="tmpl-copy-kicker">Love you</div>
      <div class="tmpl-copy-names">우리의 기념일</div>
      <div class="tmpl-copy-date">2025.05.20 TUE</div>
      <div class="tmpl-copy-msg">사랑하는 우리에게</div>
    `)
  },
  {
    id: 'anniversary-night',
    category: 'anniversary',
    name: '별빛 1000일',
    badge: '기념일',
    desc: '밤하늘 아래 오래 남는 기념일 템플릿.',
    tags: ['#밤하늘', '#1000일', '#로맨틱'],
    html: withStandaloneArtwork('tmpl-anniversary-night', '/images/generated/anniversary/anniversary-starry-night.png', `
      <div class="tmpl-copy-kicker">우리의</div>
      <div class="tmpl-copy-names">1000일</div>
      <div class="tmpl-copy-date">2025.05.20 TUE</div>
      <div class="tmpl-copy-msg">사랑하는 우리에게</div>
    `)
  },
  {
    id: 'anniversary-branch',
    category: 'anniversary',
    name: '보태니컬 기념일',
    badge: '기념일',
    desc: '마른 가지와 여백으로 꾸민 기념일 템플릿.',
    tags: ['#가지', '#크림', '#차분함'],
    html: withStandaloneArtwork('tmpl-anniversary-branch', '/images/generated/anniversary/anniversary-polaroid-stilllife.png', `
      <div class="tmpl-copy-kicker">우리의</div>
      <div class="tmpl-copy-names">기념일</div>
      <div class="tmpl-copy-date">2025.05.20 TUE</div>
      <div class="tmpl-copy-msg">사랑하는 우리에게</div>
    `)
  },
  {
    id: 'anniversary-paris',
    category: 'anniversary',
    name: '파리 기념일',
    badge: '기념일',
    desc: '에펠탑 실루엣이 있는 기념일 템플릿.',
    tags: ['#파리', '#여행', '#빈티지'],
    html: withStandaloneArtwork('tmpl-anniversary-paris', '/images/generated/anniversary/anniversary-paris-silhouette.png', `
      <div class="tmpl-copy-kicker">우리의</div>
      <div class="tmpl-copy-names">기념일</div>
      <div class="tmpl-copy-date">2025.05.20 TUE</div>
      <div class="tmpl-copy-msg">사랑하는 우리에게</div>
    `)
  },
  {
    id: 'other-moving',
    category: 'other',
    name: '이사왔어요',
    badge: '기타',
    desc: '새 보금자리 소식을 전하는 초대장.',
    tags: ['#이사', '#집들이', '#소식'],
    html: withStandaloneArtwork('tmpl-other-moving', '/images/generated/other/other-moving-home.png', `
      <div class="tmpl-copy-kicker">이사왔어요</div>
      <div class="tmpl-copy-names">새로운 보금자리로 놀러오세요</div>
      <div class="tmpl-copy-date">2025.06.15 SUN PM 2:00</div>
      <div class="tmpl-copy-msg">우리집</div>
    `)
  },
  {
    id: 'other-graduation',
    category: 'other',
    name: '졸업 축하',
    badge: '기타',
    desc: '졸업과 새로운 시작을 축하하는 초대장.',
    tags: ['#졸업', '#축하', '#시작'],
    html: withStandaloneArtwork('tmpl-other-graduation', '/images/generated/other/other-graduation-cap.png', `
      <div class="tmpl-copy-kicker">졸업을</div>
      <div class="tmpl-copy-names">축하합니다</div>
      <div class="tmpl-copy-date">2025.02.14 FRI PM 2:00</div>
      <div class="tmpl-copy-msg">OO대학교 대강당</div>
    `)
  },
  {
    id: 'other-baby-shower',
    category: 'other',
    name: '베이비샤워',
    badge: '기타',
    desc: '새 생명을 기다리는 따뜻한 초대장.',
    tags: ['#베이비샤워', '#아기', '#축하'],
    html: withStandaloneArtwork('tmpl-other-baby-shower', '/images/generated/other/other-baby-shower.png', `
      <div class="tmpl-copy-kicker">Baby Shower</div>
      <div class="tmpl-copy-names">초대합니다</div>
      <div class="tmpl-copy-date">2025.06.10 TUE PM 2:00</div>
      <div class="tmpl-copy-msg">카페 파미</div>
    `)
  },
  {
    id: 'other-retirement',
    category: 'other',
    name: '퇴임식',
    badge: '기타',
    desc: '감사와 존경을 전하는 퇴임식 초대장.',
    tags: ['#퇴임식', '#감사', '#꽃다발'],
    html: withStandaloneArtwork('tmpl-other-retirement', '/images/generated/other/other-retirement-bouquet.png', `
      <div class="tmpl-copy-kicker">퇴임식</div>
      <div class="tmpl-copy-names">초대합니다</div>
      <div class="tmpl-copy-date">2025.08.24 SAT PM 5:00</div>
      <div class="tmpl-copy-msg">호텔연회장</div>
    `)
  },
  {
    id: 'other-teacher',
    category: 'other',
    name: '선생님 감사',
    badge: '기타',
    desc: '감사의 마음을 꽃 한 송이에 담은 카드.',
    tags: ['#감사', '#선생님', '#카네이션'],
    html: withStandaloneArtwork('tmpl-other-teacher', '/images/generated/other/other-retirement-bouquet.png', `
      <div class="tmpl-copy-kicker">선생님</div>
      <div class="tmpl-copy-names">감사합니다</div>
      <div class="tmpl-copy-date">2025.05.15 THU</div>
      <div class="tmpl-copy-msg">감사의 마음을 전합니다</div>
    `)
  },
  {
    id: 'other-worship',
    category: 'other',
    name: '예배 초대',
    badge: '기타',
    desc: '예배와 모임을 정갈하게 안내하는 초대장.',
    tags: ['#예배', '#초대', '#모임'],
    html: withStandaloneArtwork('tmpl-other-worship', '/images/generated/other/other-worship-candle.png', `
      <div class="tmpl-copy-kicker">예배에</div>
      <div class="tmpl-copy-names">초대합니다</div>
      <div class="tmpl-copy-date">2025.06.01 SUN AM 11:00</div>
      <div class="tmpl-copy-msg">사랑교회 본당</div>
    `)
  }
];

export const templateCategories = [
  { key: "wedding", label: "결혼식", emoji: "💍" },
  { key: "dol", label: "돌잔치", emoji: "🎂" },
  { key: "birthday", label: "생일", emoji: "🎁" },
  { key: "anniversary", label: "기념일", emoji: "♡" },
  { key: "hwangap", label: "환갑잔치", emoji: "🎊" },
  { key: "other", label: "기타 다양한", emoji: "☆" },
  { key: "bridal", label: "브라이덜샤워", emoji: "👰" },
  { key: "housewarming", label: "집들이", emoji: "🏠" },
  { key: "baby", label: "베이비샤워", emoji: "👶" },
  { key: "graduation", label: "졸업파티", emoji: "🎓" },
  { key: "business", label: "비즈니스", emoji: "📋" }
] as const;

export function getTemplatesByCategory(category: string) {
  return templates.filter((template) => template.category === category);
}
