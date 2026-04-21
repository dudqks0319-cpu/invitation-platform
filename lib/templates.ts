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
    name: '로즈 프레임',
    badge: '결혼식',
    desc: '로즈 가득한 보더 프레임 위에 정갈하게 올리는 클래식 웨딩 카드.',
    tags: ['#로즈', '#프레임', '#클래식'],
    html: withStandaloneArtwork('tmpl-wedding-classic', '/images/custom/wedding/wedding-01.jpeg', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">Kim &amp; Lee</div>
      <div class="tmpl-copy-date">2026. 04. 12 SAT PM 2:00</div>
      <div class="tmpl-copy-msg">소중한 분들을 초대합니다</div>
    `)
  },
  {
    id: 'wedding-modern',
    category: 'wedding',
    name: '유칼립투스 아치',
    badge: '결혼식',
    desc: '은은한 보태니컬 아치가 둘러주는 산뜻하고 차분한 웨딩 카드.',
    tags: ['#보태니컬', '#그린', '#아치'],
    html: withStandaloneArtwork('tmpl-wedding-modern', '/images/custom/wedding/wedding-02.jpeg', `
      <div class="tmpl-copy-kicker">WEDDING DAY</div>
      <div class="tmpl-copy-names">Minjun &amp; Sua</div>
      <div class="tmpl-copy-date">2026. 05. 16 SAT PM 12:00</div>
      <div class="tmpl-copy-msg">그랜드볼룸 4층 크리스탈홀</div>
    `)
  },
  {
    id: 'wedding-floral',
    category: 'wedding',
    name: '미니멀 블룸',
    badge: '결혼식',
    desc: '여백이 넓은 미니멀 카드에 작은 꽃다발을 더한 단정한 초대장.',
    tags: ['#미니멀', '#화이트', '#블룸'],
    html: withStandaloneArtwork('tmpl-wedding-floral', '/images/custom/wedding/wedding-03.jpeg', `
      <div class="tmpl-copy-kicker">INVITATION</div>
      <div class="tmpl-copy-names">Jung &amp; Choi</div>
      <div class="tmpl-copy-date">2026. 07. 18 SAT</div>
      <div class="tmpl-copy-msg">서울 더파인 웨딩홀</div>
    `)
  },
  {
    id: 'wedding-minimal',
    category: 'wedding',
    name: '코너 블룸',
    badge: '결혼식',
    desc: '좌상단과 우하단 코너 플라워가 공간을 남겨주는 부드러운 웨딩 카드.',
    tags: ['#코너', '#플라워', '#소프트'],
    html: withStandaloneArtwork('tmpl-wedding-minimal', '/images/custom/wedding/wedding-04.jpeg', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">Han &amp; Song</div>
      <div class="tmpl-copy-date">2026. 05. 23 SAT</div>
      <div class="tmpl-copy-msg">함께해 주시면 감사하겠습니다</div>
    `)
  },
  {
    id: 'wedding-nature',
    category: 'wedding',
    name: '골드 플로럴 보더',
    badge: '결혼식',
    desc: '섬세한 골드 라인과 플라워 코너가 어우러진 포멀 웨딩 초대장.',
    tags: ['#골드', '#포멀', '#보더'],
    html: withStandaloneArtwork('tmpl-wedding-nature', '/images/custom/wedding/wedding-05.jpeg', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">Park &amp; Lee</div>
      <div class="tmpl-copy-date">2026. 09. 14 SUN PM 1:30</div>
      <div class="tmpl-copy-msg">The Fine Hall Grand Room</div>
    `)
  },
  {
    id: 'wedding-rose-gold',
    category: 'wedding',
    name: '로즈 골드 보더',
    badge: '결혼식',
    desc: '로즈 포인트와 골드 라인이 어우러진 화사한 웨딩 보더 카드.',
    tags: ['#로즈골드', '#보더', '#우아함'],
    html: withStandaloneArtwork('tmpl-wedding-rose-gold', '/images/custom/wedding/wedding-06.jpeg', `
      <div class="tmpl-copy-kicker">WEDDING INVITATION</div>
      <div class="tmpl-copy-names">Min &amp; Hye</div>
      <div class="tmpl-copy-date">2026. 10. 03 SAT PM 3:00</div>
      <div class="tmpl-copy-msg">우리의 시작을 함께 축복해 주세요</div>
    `)
  },

  // ===== DOL (5+) =====
  {
    id: 'dol-cute',
    category: 'dol',
    name: '테디 벌룬',
    badge: '돌잔치',
    desc: '곰돌이와 풍선이 반겨주는 따뜻한 노란빛 돌잔치 카드.',
    tags: ['#곰돌이', '#풍선', '#옐로우'],
    html: withStandaloneArtwork('tmpl-dol-cute', '/images/custom/dol/dol-card-01.jpeg', `
      <div class="tmpl-copy-kicker">FIRST BIRTHDAY</div>
      <div class="tmpl-copy-names">김하늘</div>
      <div class="tmpl-copy-date">2026.03.22 (토) 오후 1시</div>
      <div class="tmpl-copy-msg">소중한 발걸음으로 함께해 주세요</div>
    `)
  },
  {
    id: 'dol-pastel',
    category: 'dol',
    name: '리본 크라운',
    badge: '돌잔치',
    desc: '핑크와 라벤더 리본, 왕관 장식이 돋보이는 사랑스러운 돌잔치 카드.',
    tags: ['#리본', '#크라운', '#핑크'],
    html: withStandaloneArtwork('tmpl-dol-pastel', '/images/custom/dol/dol-card-02.jpeg', `
      <div class="tmpl-copy-kicker">첫돌을 맞이했어요</div>
      <div class="tmpl-copy-names">이세아</div>
      <div class="tmpl-copy-date">2026.04.05 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">귀여운 첫 생일잔치에 초대합니다</div>
    `)
  },
  {
    id: 'dol-blue',
    category: 'dol',
    name: '우주 로켓',
    badge: '돌잔치',
    desc: '달과 로켓, 별 장식이 가득한 블루 우주 테마 돌잔치 카드.',
    tags: ['#우주', '#블루', '#별'],
    html: withStandaloneArtwork('tmpl-dol-blue', '/images/custom/dol/dol-card-03.jpeg', `
      <div class="tmpl-copy-kicker">ONE YEAR OLD</div>
      <div class="tmpl-copy-names">박도윤</div>
      <div class="tmpl-copy-date">2026.05.10 (토) 오후 2시</div>
      <div class="tmpl-copy-msg">첫 번째 생일잔치에 함께해 주세요</div>
    `)
  },
  {
    id: 'dol-nature',
    category: 'dol',
    name: '골드 크라운',
    badge: '돌잔치',
    desc: '실크 골드와 왕관 포인트로 고급스럽게 완성한 프리미엄 돌잔치 카드.',
    tags: ['#골드', '#크라운', '#프리미엄'],
    html: withStandaloneArtwork('tmpl-dol-nature', '/images/custom/dol/dol-card-04.jpeg', `
      <div class="tmpl-copy-kicker">FIRST BIRTHDAY</div>
      <div class="tmpl-copy-names">정예준</div>
      <div class="tmpl-copy-date">2026.07.20 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">첫돌을 함께 축하해 주세요</div>
    `)
  },
  {
    id: 'dol-gold',
    category: 'dol',
    name: '케이크 파티',
    badge: '돌잔치',
    desc: '케이크와 데코 장식이 중심이 되는 밝고 경쾌한 돌잔치 카드.',
    tags: ['#케이크', '#파티', '#러블리'],
    html: withStandaloneArtwork('tmpl-dol-gold', '/images/custom/dol/dol-cake-01.jpeg', `
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
    name: '은은한 금빛',
    badge: '환갑잔치',
    desc: '차분한 금빛 여백과 전통 무드가 살아 있는 환갑 초대장.',
    tags: ['#금빛', '#전통', '#품격'],
    html: withStandaloneArtwork('tmpl-hwangap-classic', '/images/custom/hwangap/hwangap-01.jpeg', `
      <div class="tmpl-copy-kicker">회갑연 초대장</div>
      <div class="tmpl-copy-names">김철수</div>
      <div class="tmpl-copy-date">2026.05.03 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">환갑을 함께 축하해 주세요</div>
    `)
  },
  {
    id: 'hwangap-modern',
    category: 'hwangap',
    name: '전통 문양',
    badge: '환갑잔치',
    desc: '전통 문양과 여백으로 격식을 살린 정갈한 환갑 카드.',
    tags: ['#문양', '#전통', '#격식'],
    html: withStandaloneArtwork('tmpl-hwangap-modern', '/images/custom/hwangap/hwangap-02.jpeg', `
      <div class="tmpl-copy-kicker">HWAN-GAP CELEBRATION</div>
      <div class="tmpl-copy-names">이영자 여사님</div>
      <div class="tmpl-copy-date">2026.06.21 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">진심으로 축하드립니다</div>
    `)
  },
  {
    id: 'hwangap-red',
    category: 'hwangap',
    name: '레드 포인트',
    badge: '환갑잔치',
    desc: '강렬한 레드 포인트와 전통 보더로 장수의 의미를 살린 카드.',
    tags: ['#레드', '#장수', '#보더'],
    html: withStandaloneArtwork('tmpl-hwangap-red', '/images/custom/hwangap/hwangap-03.jpeg', `
      <div class="tmpl-copy-kicker">환갑 회갑연</div>
      <div class="tmpl-copy-names">박순희</div>
      <div class="tmpl-copy-date">2026.04.26 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">건강과 장수를 기원하며 초대합니다</div>
    `)
  },
  {
    id: 'hwangap-floral',
    category: 'hwangap',
    name: '플로럴 격조',
    badge: '환갑잔치',
    desc: '플로럴 장식과 금빛 보더가 어우러진 화사한 환갑 카드.',
    tags: ['#플로럴', '#화사', '#품격'],
    html: withStandaloneArtwork('tmpl-hwangap-floral', '/images/custom/hwangap/hwangap-04.jpeg', `
      <div class="tmpl-copy-kicker">칠순연 초대장</div>
      <div class="tmpl-copy-names">최정숙</div>
      <div class="tmpl-copy-date">2026.09.13 (일) 오후 12시</div>
      <div class="tmpl-copy-msg">기쁜 날 자리를 빛내 주세요</div>
    `)
  },
  {
    id: 'hwangap-hanja',
    category: 'hwangap',
    name: '서예 정통',
    badge: '환갑잔치',
    desc: '서예 감성과 깊은 컬러 톤으로 정통미를 강조한 환갑 카드.',
    tags: ['#서예', '#정통', '#한자'],
    html: withStandaloneArtwork('tmpl-hwangap-hanja', '/images/custom/hwangap/hwangap-05.jpeg', `
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
    html: withStandaloneArtwork('tmpl-bridal-pink', '/images/custom/bridal/bridal-01.jpeg', `
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
    html: withStandaloneArtwork('tmpl-bridal-boho', '/images/custom/bridal/bridal-02.jpeg', `
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
    html: withStandaloneArtwork('tmpl-bridal-modern', '/images/custom/bridal/bridal-03.jpeg', `
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
    html: withStandaloneArtwork('tmpl-bridal-mint', '/images/custom/bridal/bridal-04.jpeg', `
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
    name: '언더더씨 파티',
    badge: '생일파티',
    desc: '바다 친구들과 함께하는 알록달록 아기 생일파티 카드.',
    tags: ['#바다', '#동물친구', '#파티'],
    html: withStandaloneArtwork('tmpl-birthday-fun', '/images/custom/birthday/birthday-01.jpeg', `
      <div class="tmpl-copy-kicker">BABY BIRTHDAY PARTY</div>
      <div class="tmpl-copy-names">우리 아이 첫 번째 생일</div>
      <div class="tmpl-copy-date">2026.03.22 (토) 오후 1시</div>
      <div class="tmpl-copy-msg">신나는 파티에 초대합니다</div>
    `)
  },
  {
    id: 'birthday-elegant',
    category: 'birthday',
    name: '샤크 버블',
    badge: '생일파티',
    desc: '상어 가족과 바닷속 버블이 가득한 경쾌한 생일파티 카드.',
    tags: ['#샤크', '#버블', '#블루'],
    html: withStandaloneArtwork('tmpl-birthday-elegant', '/images/custom/birthday/birthday-02.jpeg', `
      <div class="tmpl-copy-kicker">BIRTHDAY CELEBRATION</div>
      <div class="tmpl-copy-names">한 해린</div>
      <div class="tmpl-copy-date">2026.05.10 (토) 오후 2시</div>
      <div class="tmpl-copy-msg">바닷속 친구들과 만나요</div>
    `)
  },
  {
    id: 'birthday-kids',
    category: 'birthday',
    name: '정글 프렌즈',
    badge: '생일파티',
    desc: '정글 동물 친구들과 함께하는 탐험 테마 생일파티 카드.',
    tags: ['#정글', '#동물', '#탐험'],
    html: withStandaloneArtwork('tmpl-birthday-kids', '/images/custom/birthday/birthday-03.jpeg', `
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
    html: withArtwork('tmpl-house-warm', '/images/genspark/6XcxVcVH.jpg', `
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
    html: `<div class="tmpl-business" style="border-top-color:#455A64;background:linear-gradient(180deg,#FAFAFA,#F5F5F5)">
      <div class="icon">🏠</div>
      <div class="company" style="color:#455A64">HOUSEWARMING PARTY</div>
      <div class="title" style="color:#263238">Kim & Lee의 새집</div>
      <div class="date" style="color:#546E7A">2026.03.28 (SAT) 5PM</div>
      <div class="venue" style="color:#607D8B">서울시 강남구 청담동</div>
    </div>`
  },

  // ===== BABY SHOWER =====
  {
    id: 'baby-shower',
    category: 'baby',
    name: '블루 스카이',
    badge: '베이비샤워',
    desc: '하늘빛 파란색의 포근한 베이비샤워 초대장.',
    tags: ['#베이비', '#블루', '#포근'],
    html: withArtwork('tmpl-baby-shower', '/images/genspark/zIB8bEWC.jpg', `
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
    html: `<div class="tmpl-bridal-pink" style="background:linear-gradient(135deg,#FFF3F7,#FFE8F0)">
      <div class="crown" style="font-size:2.5rem">👶</div>
      <div class="subtitle" style="color:#C2185B">BABY SHOWER</div>
      <div class="name" style="color:#880E4F">Oh Sung-hyun's Baby Girl</div>
      <div class="date" style="color:#E91E63">2026.04.26 (SUN) 2PM</div>
      <div class="msg" style="color:#C2185B">작은 공주의 탄생을<br/>함께 축하해 주세요</div>
    </div>`
  },

  // ===== GRADUATION =====
  {
    id: 'graduation',
    category: 'graduation',
    name: '블루 졸업',
    badge: '졸업파티',
    desc: '네이비 블루의 격조 있는 졸업 파티 초대장.',
    tags: ['#졸업', '#네이비', '#격식'],
    html: withArtwork('tmpl-graduation', '/images/genspark/Xdz6nHcL.jpg', `
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
    html: `<div class="tmpl-hwangap-classic" style="background:linear-gradient(135deg,#FFFDE7,#FFF9C4)">
      <div class="crane" style="font-size:2.5rem">🎓</div>
      <div class="title" style="color:#F57F17">졸업을 축하해요!</div>
      <div class="name" style="color:#E65100">Shin Da-sol</div>
      <div class="subtitle" style="color:#FF8F00">졸업 파티에 초대합니다</div>
      <div class="date" style="color:#FFA000">2026.02.28 (SAT) 6PM</div>
    </div>`
  },

  // ===== BUSINESS =====
  {
    id: 'business',
    category: 'business',
    name: '비즈니스 블루',
    badge: '비즈니스',
    desc: '신뢰와 전문성을 담은 비즈니스 행사 초대장.',
    tags: ['#비즈니스', '#전문', '#행사'],
    html: withArtwork('tmpl-business', '/images/genspark/xpx0zLPW.jpg', `
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
    html: `<div class="tmpl-hwangap-modern" style="background:linear-gradient(135deg,#0D0D0D,#1A1A1A)">
      <div class="emblem">🏆</div>
      <div class="title" style="color:#C9935A">PREMIUM GALA DINNER</div>
      <div class="name" style="color:#F5DEB3;font-size:1.2rem">InviteHub Awards 2026</div>
      <div class="date" style="color:#C9935A">2026.12.12 (SAT) 7PM</div>
      <div class="msg">최고의 밤에 함께해 주세요</div>
    </div>`
  }
];

export const templateCategories = [
  { key: "all", label: "전체", emoji: "✨" },
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
