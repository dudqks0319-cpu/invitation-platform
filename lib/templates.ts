export type TemplatePreset = {
  id: string;
  category: string;
  name: string;
  badge: string;
  desc: string;
  tags: string[];
  html: string;
};

export const templates: TemplatePreset[] = [
  // ===== WEDDING (5+) =====
  {
    id: 'wedding-classic',
    category: 'wedding',
    name: '클래식 로즈',
    badge: '결혼식',
    desc: '따뜻한 크림 톤의 클래식한 결혼 초대장. 우아한 플로럴 감성.',
    tags: ['#클래식', '#크림톤', '#플로럴'],
    html: `<div class="tmpl-wedding-classic">
      <div class="flower">🌸</div>
      <div class="date">2026. 04. 12</div>
      <div class="names">Kim &amp; Lee</div>
      <div class="and">♡</div>
      <div class="msg">저희 두 사람이 하나가 됩니다<br/>소중한 자리에 함께해 주세요</div>
    </div>`
  },
  {
    id: 'wedding-modern',
    category: 'wedding',
    name: '다크 골드',
    badge: '결혼식',
    desc: '다크 배경에 골드 포인트의 모던하고 고급스러운 스타일.',
    tags: ['#모던', '#다크', '#골드'],
    html: `<div class="tmpl-wedding-modern">
      <div class="gold-line"></div>
      <div class="event">WEDDING INVITATION</div>
      <div class="names">Kim &amp; Park</div>
      <div class="gold-line"></div>
      <div class="date">2026.05.16 SAT PM 12:00</div>
      <div class="venue">그랜드볼룸 4층 크리스탈홀</div>
    </div>`
  },
  {
    id: 'wedding-floral',
    category: 'wedding',
    name: '핑크 플로럴',
    badge: '결혼식',
    desc: '화사한 핑크 플로럴 감성의 로맨틱한 결혼 초대장.',
    tags: ['#로맨틱', '#핑크', '#감성'],
    html: `<div class="tmpl-wedding-floral">
      <div class="sub">WEDDING DAY</div>
      <div class="names">이지수 ♡ 박민준</div>
      <div class="date">2026년 6월 7일 토요일 오후 2시</div>
      <div class="msg">두 사람의 설레는 시작을<br/>함께 축복해 주세요</div>
    </div>`
  },
  {
    id: 'wedding-minimal',
    category: 'wedding',
    name: '미니멀 화이트',
    badge: '결혼식',
    desc: '심플하고 깔끔한 미니멀 스타일. 가독성 최고.',
    tags: ['#미니멀', '#심플', '#화이트'],
    html: `<div class="tmpl-wedding-minimal">
      <div class="en-label">WEDDING INVITATION</div>
      <div class="names">Jung &amp; Choi</div>
      <div class="divider"></div>
      <div class="date">2026. 07. 18</div>
      <div class="venue">서울 더파인 웨딩홀</div>
    </div>`
  },
  {
    id: 'wedding-nature',
    category: 'wedding',
    name: '내추럴 그린',
    badge: '결혼식',
    desc: '초록빛 자연을 담은 청량한 웨딩 초대장.',
    tags: ['#자연', '#그린', '#청량'],
    html: `<div class="tmpl-wedding-nature">
      <div class="leaf">🌿</div>
      <div class="names">Han &amp; Song</div>
      <div class="date">2026년 5월 23일 (토)</div>
      <div class="msg">자연 속에서 시작하는 우리의 사랑<br/>함께해 주시면 감사하겠습니다</div>
    </div>`
  },

  // ===== DOL (5+) =====
  {
    id: 'dol-cute',
    category: 'dol',
    name: '귀요미 옐로',
    badge: '돌잔치',
    desc: '따뜻한 노란빛의 아기자기하고 귀여운 돌잔치 초대장.',
    tags: ['#귀여운', '#옐로우', '#아기자기'],
    html: `<div class="tmpl-dol-cute">
      <div class="baby">👶</div>
      <div class="title">우리 아이 첫 번째 생일</div>
      <div class="name">김하늘</div>
      <div class="date">2026.03.22 (토) 오후 1시</div>
      <div class="msg">소중한 발걸음으로 함께해 주세요</div>
    </div>`
  },
  {
    id: 'dol-pastel',
    category: 'dol',
    name: '파스텔 핑크',
    badge: '돌잔치',
    desc: '부드러운 파스텔 핑크와 라벤더의 공주님 스타일.',
    tags: ['#파스텔', '#핑크', '#공주'],
    html: `<div class="tmpl-dol-pastel">
      <div class="icons">🎀🎂🎀</div>
      <div class="title">첫돌을 맞이했어요</div>
      <div class="name">이 세아</div>
      <div class="subtitle">귀여운 첫 생일잔치에 초대합니다</div>
      <div class="date">2026.04.05 일요일 오후 12시</div>
    </div>`
  },
  {
    id: 'dol-blue',
    category: 'dol',
    name: '블루 스페이스',
    badge: '돌잔치',
    desc: '우주를 여행하는 아기왕자 느낌의 블루 컬러 초대장.',
    tags: ['#블루', '#우주', '#남아'],
    html: `<div class="tmpl-dol-blue">
      <div class="rocket">🚀</div>
      <div class="title">ONE YEAR OLD</div>
      <div class="name">박 도윤</div>
      <div class="date">2026.05.10 (토) 오후 2시</div>
      <div class="msg">도윤이의 첫 번째 생일잔치에<br/>함께해 주세요!</div>
    </div>`
  },
  {
    id: 'dol-nature',
    category: 'dol',
    name: '그린 내추럴',
    badge: '돌잔치',
    desc: '자연 친화적인 그린 계열의 미니멀한 돌잔치 초대장.',
    tags: ['#자연', '#그린', '#미니멀'],
    html: `<div class="tmpl-dol-nature">
      <div class="tree">🌱</div>
      <div class="title">FIRST BIRTHDAY</div>
      <div class="name">최 시우</div>
      <div class="date">2026.06.14 일요일 오후 1시</div>
      <div class="msg">자연처럼 건강하게 자라렴<br/>함께 축하해 주세요</div>
    </div>`
  },
  {
    id: 'dol-gold',
    category: 'dol',
    name: '골드 럭셔리',
    badge: '돌잔치',
    desc: '고급스러운 골드 톤의 프리미엄 돌잔치 초대장.',
    tags: ['#골드', '#럭셔리', '#프리미엄'],
    html: `<div class="tmpl-dol-cute" style="background:linear-gradient(135deg,#FFF8E1,#FFF3CD);">
      <div class="baby" style="font-size:2.5rem">👑</div>
      <div class="title" style="color:#B8860B">첫돌을 축하합니다</div>
      <div class="name" style="color:#8B6914;font-size:1.8rem;font-weight:900">정 예준</div>
      <div class="date" style="color:#DAA520">2026.07.20 (일) 오후 12시</div>
      <div class="msg" style="color:#B8860B">금빛 찬란한 첫 생일에<br/>함께해 주시길 초대합니다</div>
    </div>`
  },

  // ===== HWANGAP (5+) =====
  {
    id: 'hwangap-classic',
    category: 'hwangap',
    name: '황금 환갑',
    badge: '환갑잔치',
    desc: '전통적인 황금빛 크림 톤의 격조 있는 환갑잔치 초대장.',
    tags: ['#전통', '#황금', '#격조'],
    html: `<div class="tmpl-hwangap-classic">
      <div class="crane">🕊️</div>
      <div class="title">환갑을 축하드립니다</div>
      <div class="name">김 철수</div>
      <div class="subtitle">회갑연 초대장</div>
      <div class="date">2026.05.03 일요일 오후 12시</div>
    </div>`
  },
  {
    id: 'hwangap-modern',
    category: 'hwangap',
    name: '모던 브라운',
    badge: '환갑잔치',
    desc: '다크 브라운과 골드의 고급스럽고 모던한 스타일.',
    tags: ['#모던', '#다크', '#브라운'],
    html: `<div class="tmpl-hwangap-modern">
      <div class="emblem">🎖️</div>
      <div class="title">HWAN-GAP CELEBRATION</div>
      <div class="name">이 영자 여사님</div>
      <div class="date">2026.06.21 (일) 오후 12:00</div>
      <div class="msg">여사님의 환갑을 진심으로<br/>축하드립니다</div>
    </div>`
  },
  {
    id: 'hwangap-red',
    category: 'hwangap',
    name: '레드 장수',
    badge: '환갑잔치',
    desc: '건강과 장수를 상징하는 레드 컬러의 환갑잔치 초대장.',
    tags: ['#레드', '#장수', '#전통'],
    html: `<div class="tmpl-hwangap-red">
      <div class="rose">🌹</div>
      <div class="title">환갑 회갑연</div>
      <div class="name">박 순희</div>
      <div class="date">2026.04.26 (일) 오후 12시</div>
      <div class="msg">어머니의 건강과 장수를 기원하며<br/>축하드립니다</div>
    </div>`
  },
  {
    id: 'hwangap-floral',
    category: 'hwangap',
    name: '플로럴 칠순',
    badge: '환갑잔치',
    desc: '꽃으로 가득한 화사한 칠순 기념 초대장.',
    tags: ['#플로럴', '#칠순', '#화사'],
    html: `<div class="tmpl-hwangap-classic" style="background:linear-gradient(135deg,#FFF0F5,#FFE4EE)">
      <div class="crane" style="font-size:2.5rem">🌺</div>
      <div class="title" style="color:#C2185B">칠순을 축하드립니다</div>
      <div class="name" style="color:#880E4F">최 정숙</div>
      <div class="subtitle" style="color:#E91E63">칠순연 초대장</div>
      <div class="date" style="color:#AD1457">2026.09.13 (일) 오후 12시</div>
    </div>`
  },
  {
    id: 'hwangap-hanja',
    category: 'hwangap',
    name: '서예 전통',
    badge: '환갑잔치',
    desc: '한자와 전통 서예 감성을 살린 정통 환갑잔치 초대장.',
    tags: ['#서예', '#전통', '#한자'],
    html: `<div class="tmpl-hwangap-modern" style="background:linear-gradient(135deg,#1A1A2E,#16213E)">
      <div class="emblem">🏮</div>
      <div class="title" style="color:#FFD700;letter-spacing:6px">壽 福</div>
      <div class="name">손 기웅</div>
      <div class="date" style="color:#FFD700">2026.08.02 (일) 오후 12:00</div>
      <div class="msg">건강과 행복이 가득하길 바라며<br/>환갑연에 초대합니다</div>
    </div>`
  },

  // ===== BRIDAL SHOWER (5+) =====
  {
    id: 'bridal-pink',
    category: 'bridal',
    name: '핑크 드림',
    badge: '브라이덜샤워',
    desc: '핑크빛 로맨틱 감성의 브라이덜샤워 파티 초대장.',
    tags: ['#핑크', '#로맨틱', '#파티'],
    html: `<div class="tmpl-bridal-pink">
      <div class="crown">👑</div>
      <div class="subtitle">BRIDAL SHOWER</div>
      <div class="name">Soon-to-be Mrs. Kim</div>
      <div class="date">2026.03.29 SAT 3PM</div>
      <div class="msg">결혼을 앞둔 소중한 친구를<br/>함께 축하해요!</div>
    </div>`
  },
  {
    id: 'bridal-boho',
    category: 'bridal',
    name: '보헤미안',
    badge: '브라이덜샤워',
    desc: '보헤미안 감성의 따뜻한 골드&어스 컬러 초대장.',
    tags: ['#보헤미안', '#어스톤', '#골드'],
    html: `<div class="tmpl-bridal-boho">
      <div class="feather">🪶</div>
      <div class="title">BOHO BRIDAL SHOWER</div>
      <div class="name">Park Ji-yeon</div>
      <div class="date">2026.04.18 SAT 2PM</div>
      <div class="msg">자유로운 영혼의 그녀를<br/>파티로 축하해 주세요</div>
    </div>`
  },
  {
    id: 'bridal-modern',
    category: 'bridal',
    name: '블랙 럭셔리',
    badge: '브라이덜샤워',
    desc: '블랙 배경에 핑크 포인트의 고급스러운 럭셔리 스타일.',
    tags: ['#블랙', '#럭셔리', '#하이엔드'],
    html: `<div class="tmpl-bridal-modern">
      <div class="ring">💍</div>
      <div class="title">LUXURY BRIDAL SHOWER</div>
      <div class="name">Lee Soo-yeon</div>
      <div class="line"></div>
      <div class="date">2026.05.09 SAT 7PM</div>
      <div class="msg">특별한 밤, 함께 빛나요</div>
    </div>`
  },
  {
    id: 'bridal-mint',
    category: 'bridal',
    name: '민트 프레쉬',
    badge: '브라이덜샤워',
    desc: '상큼하고 청량한 민트 컬러의 브라이덜샤워 초대장.',
    tags: ['#민트', '#청량', '#상큼'],
    html: `<div class="tmpl-bridal-pink" style="background:linear-gradient(135deg,#E0F7FA,#B2EBF2)">
      <div class="crown" style="font-size:2.5rem">🌊</div>
      <div class="subtitle" style="color:#00838F">BRIDAL SHOWER</div>
      <div class="name" style="color:#006064;font-style:italic">Choi Min-ju</div>
      <div class="date" style="color:#00ACC1">2026.06.13 SAT 3PM</div>
      <div class="msg" style="color:#0097A7">신선하고 특별한 파티에<br/>초대합니다</div>
    </div>`
  },
  {
    id: 'bridal-floral',
    category: 'bridal',
    name: '플로럴 가든',
    badge: '브라이덜샤워',
    desc: '정원 파티 감성의 화사하고 생기 있는 플로럴 스타일.',
    tags: ['#플로럴', '#가든', '#화사'],
    html: `<div class="tmpl-bridal-pink" style="background:linear-gradient(135deg,#F9FBE7,#F0F4C3)">
      <div class="crown" style="font-size:2.5rem">🌷</div>
      <div class="subtitle" style="color:#558B2F">GARDEN BRIDAL SHOWER</div>
      <div class="name" style="color:#33691E;font-style:italic">Kang Da-eun</div>
      <div class="date" style="color:#7CB342">2026.05.23 SAT 2PM</div>
      <div class="msg" style="color:#689F38">꽃향기 가득한 가든 파티에<br/>초대합니다</div>
    </div>`
  },

  // ===== BIRTHDAY (5+) =====
  {
    id: 'birthday-fun',
    category: 'birthday',
    name: '컬러풀 파티',
    badge: '생일파티',
    desc: '다채로운 색상의 신나는 생일파티 초대장.',
    tags: ['#컬러풀', '#파티', '#신나는'],
    html: `<div class="tmpl-birthday-fun">
      <div class="icons">🎉🎂🎈</div>
      <div class="title">BIRTHDAY PARTY!</div>
      <div class="name">Kim Ji-ho</div>
      <div class="date">2026.04.11 (SAT) 6PM</div>
      <div class="msg">특별한 파티에 초대합니다<br/>함께 신나게 놀아요!</div>
    </div>`
  },
  {
    id: 'birthday-elegant',
    category: 'birthday',
    name: '엘레강스',
    badge: '생일파티',
    desc: '퍼플 계열의 우아하고 고급스러운 성인 생일파티.',
    tags: ['#엘레강스', '#퍼플', '#성인'],
    html: `<div class="tmpl-birthday-elegant">
      <div class="crown">🥂</div>
      <div class="title">BIRTHDAY CELEBRATION</div>
      <div class="name">Lee So-young</div>
      <div class="age">30</div>
      <div class="date">2026.03.15 (SUN) 7PM</div>
    </div>`
  },
  {
    id: 'birthday-kids',
    category: 'birthday',
    name: '키즈 무지개',
    badge: '생일파티',
    desc: '아이들을 위한 알록달록 무지개 테마 생일파티.',
    tags: ['#키즈', '#무지개', '#귀여운'],
    html: `<div class="tmpl-birthday-fun" style="background:linear-gradient(135deg,#FFF9C4,#FFECB3,#FFE0B2)">
      <div class="icons" style="font-size:1.8rem;letter-spacing:4px">🦄🌈⭐</div>
      <div class="title" style="color:#F57F17">생일 파티에 초대해요!</div>
      <div class="name" style="color:#E65100">박 주원 어린이</div>
      <div class="date" style="color:#FF6F00">2026.05.17 (일) 오후 2시</div>
      <div class="msg" style="color:#FF8F00">신나는 파티에서 만나요! 🎊</div>
    </div>`
  },

  // ===== HOUSEWARMING =====
  {
    id: 'house-warm',
    category: 'housewarming',
    name: '그린 집들이',
    badge: '집들이',
    desc: '새 보금자리를 알리는 따뜻한 그린 집들이 초대장.',
    tags: ['#집들이', '#그린', '#따뜻한'],
    html: `<div class="tmpl-house-warm">
      <div class="house">🏡</div>
      <div class="title">집들이에 초대합니다</div>
      <div class="address">서울시 마포구 합정동 123-45</div>
      <div class="date">2026.04.19 (토) 오후 4시</div>
      <div class="msg">새 집에서 함께 따뜻한 시간<br/>보내요!</div>
    </div>`
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
    html: `<div class="tmpl-baby-shower">
      <div class="stars">⭐💫⭐</div>
      <div class="title">BABY SHOWER</div>
      <div class="name">Yoon Ji-hyun의 Baby</div>
      <div class="date">2026.03.08 (SUN) 2PM</div>
      <div class="msg">새 생명의 탄생을<br/>함께 축하해 주세요</div>
    </div>`
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
    html: `<div class="tmpl-graduation">
      <div class="cap">🎓</div>
      <div class="title">GRADUATION PARTY</div>
      <div class="name">Lim Jae-won</div>
      <div class="sub">서울대학교 경영학과</div>
      <div class="date">2026.02.28 (SAT) 7PM</div>
    </div>`
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
    html: `<div class="tmpl-business">
      <div class="icon">📋</div>
      <div class="company">INVITEHUB CONFERENCE 2026</div>
      <div class="title">연간 비즈니스 컨퍼런스</div>
      <div class="date">2026.05.22 (FRI) 10AM</div>
      <div class="venue">코엑스 그랜드볼룸 A홀</div>
    </div>`
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
