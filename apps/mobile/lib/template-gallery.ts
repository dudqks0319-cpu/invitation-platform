export type MobileTemplateCategory = {
  key: string;
  label: string;
  emoji: string;
};

export type MobileTemplateGalleryItem = {
  id: string;
  category: string;
  name: string;
  badge: string;
  desc: string;
  tags: string[];
  previewPath?: string;
  sampleTextOverlay?: boolean;
};

export type HomeTemplateSection = {
  key: string;
  title: string;
  subtitle: string;
  categoryKeys: string[];
};

export const mobileTemplateCategories: MobileTemplateCategory[] = [
  { key: "wedding", label: "결혼식", emoji: "💍" },
  { key: "dol", label: "돌잔치", emoji: "🎂" },
  { key: "hwangap", label: "환갑잔치", emoji: "🎊" },
  { key: "bridal", label: "브라이덜샤워", emoji: "👰" },
  { key: "birthday", label: "생일파티", emoji: "🎉" },
  { key: "housewarming", label: "집들이", emoji: "🏠" },
  { key: "baby", label: "베이비샤워", emoji: "👶" },
  { key: "graduation", label: "졸업파티", emoji: "🎓" },
  { key: "business", label: "비즈니스", emoji: "📋" }
];

const latestGeneratedTemplateGroups = [
  {
    category: "wedding",
    badge: "결혼식",
    start: 25,
    names: ["들꽃 아치", "청실홍실 새", "살구 튤립 정원", "자작나무 약속", "동백의 계절", "라벤더 산책", "달빛 목련", "시트러스 블룸", "분홍 코스모스", "푸른 리본 비둘기"],
    desc: "꽃과 자연 모티프를 밝은 여백에 담은 세로형 모바일 청첩장.",
    tags: ["#애니", "#웨딩", "#여백"]
  },
  {
    category: "dol",
    badge: "돌잔치",
    start: 16,
    names: ["달토끼 첫별", "풍선 든 호랑이", "별이불 곰", "숲속 아기 사슴", "복숭아 오리", "구름 여우", "장구 치는 강아지", "선물 든 다람쥐", "무지개 양", "꽃모자 고양이"],
    desc: "사랑스러운 동물 캐릭터와 넓은 문구 공간을 갖춘 돌잔치 초대장.",
    tags: ["#캐릭터", "#돌잔치", "#파스텔"]
  },
  {
    category: "birthday",
    badge: "생일파티",
    start: 5,
    names: ["북극곰 케이크", "펭귄 콘페티", "풍선 강아지", "선물 고양이", "컵케이크 토끼", "공룡 파티", "촛불 병아리", "바람개비 여우", "무지개 양", "별고래 축하"],
    desc: "밝은 파티 소품과 캐릭터를 각기 다르게 구성한 생일 초대장.",
    tags: ["#생일", "#파티", "#캐릭터"]
  },
  {
    category: "baby",
    badge: "베이비샤워",
    start: 5,
    names: ["달토끼 모빌", "구름 양 모빌", "백조 요람", "별 코끼리", "풍선 곰", "꽃사슴", "잠든 여우달", "구름 고래", "목마 토끼", "무지개 오리"],
    desc: "포근한 모빌과 아기 동물 모티프를 담은 베이비샤워 초대장.",
    tags: ["#베이비", "#모빌", "#포근함"]
  },
  {
    category: "housewarming",
    badge: "집들이",
    start: 10,
    names: ["빨간 지붕 화분집", "열쇠와 올리브", "차 한 잔의 집", "포근한 소파", "정원 대문", "상자 위 새싹", "저녁의 스탠드", "아침 창문", "작은 주방 선반", "우리 동네 집들"],
    desc: "새집의 따뜻한 장면과 생활 소품을 담은 감성 집들이 초대장.",
    tags: ["#집들이", "#홈", "#따뜻함"]
  },
  {
    category: "hwangap",
    badge: "환갑잔치",
    start: 8,
    names: ["학과 붉은 모란", "장수 복숭아", "매화와 까치", "소나무 아침해", "연꽃 학정원", "동백 병풍", "산수 십장생", "대나무 부채", "국화 매듭", "감나무 새"],
    desc: "현대적으로 다듬은 민화와 수묵 모티프를 담은 품격 있는 환갑 초대장.",
    tags: ["#환갑", "#전통", "#민화"]
  }
] as const;

export const latestGeneratedInvitationTemplates: MobileTemplateGalleryItem[] = latestGeneratedTemplateGroups.flatMap(
  (group) =>
    group.names.map((name, index) => ({
      id: `${group.category}-barunson-anime-${String(group.start + index).padStart(2, "0")}`,
      category: group.category,
      name,
      badge: group.badge,
      desc: group.desc,
      tags: [...group.tags],
      sampleTextOverlay: true
    }))
);

const barunsonCategoryAnimeTemplates: MobileTemplateGalleryItem[] = [
  { id: "wedding-barunson-anime-01", category: "wedding", name: "플로럴 세레모니 01", badge: "결혼식", desc: "애니메이션 일러스트와 넓은 여백을 살린 세로형 모바일 청첩장.", tags: ["#애니", "#청첩장", "#세로형"], sampleTextOverlay: true },
  { id: "wedding-barunson-anime-02", category: "wedding", name: "플로럴 세레모니 02", badge: "결혼식", desc: "밝은 플라워 무드와 카드형 여백이 어울리는 모바일 웨딩 초대장.", tags: ["#플라워", "#웨딩", "#여백"], sampleTextOverlay: true },
  { id: "wedding-barunson-anime-03", category: "wedding", name: "플로럴 세레모니 03", badge: "결혼식", desc: "신랑 신부 정보와 일정을 또렷하게 얹기 좋은 애니 청첩장.", tags: ["#정보형", "#웨딩", "#애니"], sampleTextOverlay: true },
  { id: "wedding-barunson-anime-04", category: "wedding", name: "플로럴 세레모니 04", badge: "결혼식", desc: "햇살 가득한 실내 웨딩 장면과 플로럴 여백을 살린 모바일 청첩장.", tags: ["#플로럴", "#실내웨딩", "#애니"], sampleTextOverlay: true },
  { id: "wedding-barunson-anime-09", category: "wedding", name: "웨딩 포토 컨셉 01", badge: "결혼식", desc: "푸른 바다와 화이트 플라워를 담은 밝고 로맨틱한 웨딩 포토 컨셉.", tags: ["#웨딩포토", "#오션", "#플라워"], sampleTextOverlay: true },
  { id: "wedding-barunson-anime-10", category: "wedding", name: "웨딩 포토 컨셉 02", badge: "결혼식", desc: "노을빛 도심 배경과 플라워 장식이 어우러진 웨딩 포토 컨셉.", tags: ["#웨딩포토", "#선셋", "#시티"], sampleTextOverlay: true },
  { id: "dol-barunson-anime-01", category: "dol", name: "첫돌 파티 01", badge: "돌잔치", desc: "포근한 색감과 축하 장식으로 첫돌 분위기를 살린 모바일 초대장.", tags: ["#첫돌", "#축하", "#파스텔"], sampleTextOverlay: true },
  { id: "dol-barunson-anime-02", category: "dol", name: "첫돌 파티 02", badge: "돌잔치", desc: "아이 중심의 귀여운 장면과 여백이 균형 잡힌 돌잔치 카드.", tags: ["#돌잔치", "#아기", "#카드형"], sampleTextOverlay: true },
  { id: "dol-barunson-anime-03", category: "dol", name: "첫돌 파티 03", badge: "돌잔치", desc: "가족 초대 문구를 올리기 좋은 애니 일러스트 돌잔치 템플릿.", tags: ["#가족", "#초대", "#애니"], sampleTextOverlay: true },
  { id: "housewarming-barunson-anime-01", category: "housewarming", name: "햇살 집들이 01", badge: "집들이", desc: "새 집의 따뜻한 분위기와 초대 문구를 함께 담는 집들이 카드.", tags: ["#집들이", "#햇살", "#홈"], sampleTextOverlay: true },
  { id: "housewarming-barunson-anime-02", category: "housewarming", name: "햇살 집들이 02", badge: "집들이", desc: "인테리어 무드와 넓은 문구 영역이 있는 세로형 집들이 초대장.", tags: ["#인테리어", "#집들이", "#여백"], sampleTextOverlay: true },
  { id: "housewarming-barunson-anime-03", category: "housewarming", name: "햇살 집들이 03", badge: "집들이", desc: "편안한 홈파티 감성을 애니 일러스트로 정리한 집들이 템플릿.", tags: ["#홈파티", "#편안함", "#애니"], sampleTextOverlay: true },
  { id: "hwangap-barunson-anime-01", category: "hwangap", name: "전통 축하 01", badge: "환갑잔치", desc: "전통 장식과 차분한 여백으로 격식을 살린 환갑잔치 초대장.", tags: ["#환갑", "#전통", "#격식"], sampleTextOverlay: true },
  { id: "hwangap-barunson-anime-02", category: "hwangap", name: "전통 축하 02", badge: "환갑잔치", desc: "가족 모임 안내와 축하 문구를 품격 있게 담는 애니 환갑 카드.", tags: ["#가족", "#축하", "#품격"], sampleTextOverlay: true },
  { id: "hwangap-barunson-anime-03", category: "hwangap", name: "전통 축하 03", badge: "환갑잔치", desc: "따뜻한 축하 무드와 전통 색감을 결합한 환갑잔치 템플릿.", tags: ["#전통색", "#환갑", "#초대장"], sampleTextOverlay: true },
  { id: "bridal-barunson-anime-01", category: "bridal", name: "브라이덜 블룸 01", badge: "브라이덜샤워", desc: "친구들과 나누기 좋은 화사한 플라워 무드의 브라이덜샤워 카드.", tags: ["#브라이덜", "#플라워", "#파티"], sampleTextOverlay: true },
  { id: "bridal-barunson-anime-02", category: "bridal", name: "브라이덜 블룸 02", badge: "브라이덜샤워", desc: "부드러운 리본과 여백이 돋보이는 애니 브라이덜샤워 초대장.", tags: ["#리본", "#샤워", "#애니"], sampleTextOverlay: true },
  { id: "bridal-barunson-anime-03", category: "bridal", name: "브라이덜 블룸 03", badge: "브라이덜샤워", desc: "파티 일정과 장소를 깔끔하게 얹는 세로형 브라이덜 템플릿.", tags: ["#파티", "#일정", "#세로형"], sampleTextOverlay: true },
  { id: "birthday-barunson-anime-01", category: "birthday", name: "생일 파티 01", badge: "생일파티", desc: "풍선과 케이크 무드가 밝게 살아 있는 모바일 생일 초대장.", tags: ["#생일", "#케이크", "#풍선"], sampleTextOverlay: true },
  { id: "birthday-barunson-anime-02", category: "birthday", name: "생일 파티 02", badge: "생일파티", desc: "파티 안내 문구와 날짜를 올리기 좋은 애니 생일 카드.", tags: ["#파티", "#초대", "#애니"], sampleTextOverlay: true },
  { id: "birthday-barunson-anime-03", category: "birthday", name: "생일 파티 03", badge: "생일파티", desc: "밝은 축하 장면과 모바일 카드 여백을 갖춘 생일파티 템플릿.", tags: ["#축하", "#모바일", "#카드"], sampleTextOverlay: true },
  { id: "baby-barunson-anime-01", category: "baby", name: "베이비 클라우드 01", badge: "베이비샤워", desc: "구름과 파스텔 장식이 포근한 베이비샤워 초대장.", tags: ["#베이비", "#구름", "#파스텔"], sampleTextOverlay: true },
  { id: "baby-barunson-anime-02", category: "baby", name: "베이비 클라우드 02", badge: "베이비샤워", desc: "부드러운 축하 문구를 담기 좋은 애니 베이비샤워 카드.", tags: ["#샤워", "#축하", "#애니"], sampleTextOverlay: true },
  { id: "baby-barunson-anime-03", category: "baby", name: "베이비 클라우드 03", badge: "베이비샤워", desc: "아기 소식과 파티 정보를 단정하게 배치하는 세로형 템플릿.", tags: ["#아기", "#파티", "#세로형"], sampleTextOverlay: true },
  { id: "graduation-barunson-anime-01", category: "graduation", name: "졸업 세리머니 01", badge: "졸업파티", desc: "졸업식과 축하 모임을 격식 있게 알리는 애니 초대장.", tags: ["#졸업", "#세리머니", "#격식"], sampleTextOverlay: true },
  { id: "graduation-barunson-anime-02", category: "graduation", name: "졸업 세리머니 02", badge: "졸업파티", desc: "네이비와 골드 무드로 단정하게 구성한 졸업파티 카드.", tags: ["#네이비", "#골드", "#졸업"], sampleTextOverlay: true },
  { id: "graduation-barunson-anime-03", category: "graduation", name: "졸업 세리머니 03", badge: "졸업파티", desc: "축하 메시지와 행사 정보를 함께 담기 좋은 졸업 템플릿.", tags: ["#축하", "#행사", "#졸업"], sampleTextOverlay: true },
  { id: "business-barunson-anime-01", category: "business", name: "컨퍼런스 라이트 01", badge: "비즈니스", desc: "행사 일정과 장소 정보를 전문적으로 정리하는 비즈니스 초대장.", tags: ["#비즈니스", "#컨퍼런스", "#전문"], sampleTextOverlay: true },
  { id: "business-barunson-anime-02", category: "business", name: "컨퍼런스 라이트 02", badge: "비즈니스", desc: "세미나, 오픈식, 네트워킹 행사에 맞춘 애니 비즈니스 카드.", tags: ["#세미나", "#네트워킹", "#행사"], sampleTextOverlay: true },
  { id: "business-barunson-anime-03", category: "business", name: "컨퍼런스 라이트 03", badge: "비즈니스", desc: "브랜드 행사 안내를 깔끔하게 담을 수 있는 세로형 초대장.", tags: ["#브랜드", "#행사안내", "#세로형"], sampleTextOverlay: true }
];

export const mobileTemplateGallery: MobileTemplateGalleryItem[] = [
  ...latestGeneratedInvitationTemplates,
  { id: "wedding-classic", category: "wedding", name: "로즈 프레임", badge: "결혼식", desc: "로즈 가득한 보더 프레임 위에 정갈하게 올리는 클래식 웨딩 카드.", tags: ["#로즈", "#프레임", "#클래식"], previewPath: "/images/custom/wedding/wedding-01.jpeg" },
  { id: "wedding-modern", category: "wedding", name: "유칼립투스 아치", badge: "결혼식", desc: "은은한 보태니컬 아치가 둘러주는 산뜻하고 차분한 웨딩 카드.", tags: ["#보태니컬", "#그린", "#아치"], previewPath: "/images/custom/wedding/wedding-02.jpeg" },
  { id: "wedding-floral", category: "wedding", name: "미니멀 블룸", badge: "결혼식", desc: "여백이 넓은 미니멀 카드에 작은 꽃다발을 더한 단정한 초대장.", tags: ["#미니멀", "#화이트", "#블룸"], previewPath: "/images/custom/wedding/wedding-03.jpeg" },
  { id: "wedding-minimal", category: "wedding", name: "코너 블룸", badge: "결혼식", desc: "좌상단과 우하단 코너 플라워가 공간을 남겨주는 부드러운 웨딩 카드.", tags: ["#코너", "#플라워", "#소프트"], previewPath: "/images/custom/wedding/wedding-04.jpeg" },
  { id: "wedding-nature", category: "wedding", name: "골드 플로럴 보더", badge: "결혼식", desc: "섬세한 골드 라인과 플라워 코너가 어우러진 포멀 웨딩 초대장.", tags: ["#골드", "#포멀", "#보더"], previewPath: "/images/custom/wedding/wedding-05.jpeg" },
  { id: "wedding-rose-gold", category: "wedding", name: "로즈 골드 보더", badge: "결혼식", desc: "로즈 포인트와 골드 라인이 어우러진 화사한 웨딩 보더 카드.", tags: ["#로즈골드", "#보더", "#우아함"], previewPath: "/images/custom/wedding/wedding-06.jpeg" },
  { id: "wedding-photo-minimal", category: "wedding", name: "아이보리 가든", badge: "결혼식", desc: "아이보리 종이 질감과 보태니컬 프레임이 은은한 웨딩 카드.", tags: ["#아이보리", "#가든", "#여백"], previewPath: "/images/custom/wedding/wedding-07.png" },
  { id: "wedding-blush-petal", category: "wedding", name: "플라워 테라스", badge: "결혼식", desc: "꽃 장식과 야외 테라스 풍경이 어우러진 화사한 웨딩 카드.", tags: ["#테라스", "#플라워", "#야외"], previewPath: "/images/custom/wedding/wedding-08.png" },
  { id: "wedding-traditional-knot", category: "wedding", name: "스카이 가든", badge: "결혼식", desc: "맑은 하늘과 화이트 플라워 아치가 열려 있는 야외 웨딩 카드.", tags: ["#스카이", "#가든", "#플라워"], previewPath: "/images/custom/wedding/wedding-09.png", sampleTextOverlay: true },
  { id: "wedding-envelope-photo", category: "wedding", name: "채플 가든", badge: "결혼식", desc: "화이트 채플과 풍성한 정원 플라워가 차분한 웨딩 카드.", tags: ["#채플", "#정원", "#화이트"], previewPath: "/images/custom/wedding/wedding-10.png", sampleTextOverlay: true },
  { id: "wedding-gold-botanical", category: "wedding", name: "베일 아치", badge: "결혼식", desc: "아이보리 커튼과 플라워 아치가 고급스럽게 감싸는 웨딩 카드.", tags: ["#아치", "#베일", "#플라워"], previewPath: "/images/custom/wedding/wedding-11.png", sampleTextOverlay: true },
  { id: "wedding-illustration-curtain", category: "wedding", name: "스카이 채플", badge: "결혼식", desc: "푸른 하늘과 하얀 커튼, 플라워 장식이 시원한 웨딩 카드.", tags: ["#스카이", "#커튼", "#채플"], previewPath: "/images/custom/wedding/wedding-12.png", sampleTextOverlay: true },
  { id: "wedding-botanical-vertical", category: "wedding", name: "화이트 아치", badge: "결혼식", desc: "화이트 아치와 보태니컬 플라워가 차분하게 둘러주는 웨딩 카드.", tags: ["#화이트", "#아치", "#보태니컬"], previewPath: "/images/custom/wedding/wedding-13.png", sampleTextOverlay: true },
  { id: "wedding-photo-overlay", category: "wedding", name: "섀도우 아치", badge: "결혼식", desc: "빛과 그림자가 드리운 아치 공간으로 고급스러운 여백을 살린 웨딩 카드.", tags: ["#아치", "#섀도우", "#프리미엄"], previewPath: "/images/custom/wedding/wedding-14.png", sampleTextOverlay: true },
  { id: "wedding-photo-hero", category: "wedding", name: "로즈 아치", badge: "결혼식", desc: "은은한 골드 아치와 장미 플라워가 우아하게 감싸는 웨딩 카드.", tags: ["#로즈", "#아치", "#골드"], previewPath: "/images/custom/wedding/wedding-15.png", sampleTextOverlay: true },
  { id: "wedding-green-arch", category: "wedding", name: "폴라로이드 카드", badge: "결혼식", desc: "폴라로이드 프레임 안에 초대 문구를 넣기 좋은 미니멀 웨딩 카드.", tags: ["#폴라로이드", "#미니멀", "#프레임"], previewPath: "/images/custom/wedding/wedding-16.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-01", category: "wedding", name: "애니 가든 01", badge: "결혼식", desc: "애니메이션 감성 배경에 초대 문구를 얹기 좋은 세로형 웨딩 카드.", tags: ["#애니", "#세로형", "#텍스트공간"], previewPath: "/images/custom/wedding/wedding-17.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-02", category: "wedding", name: "애니 가든 02", badge: "결혼식", desc: "부드러운 애니메이션 무드와 넓은 여백을 살린 모바일 청첩장.", tags: ["#애니", "#모바일", "#여백"], previewPath: "/images/custom/wedding/wedding-18.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-03", category: "wedding", name: "애니 가든 03", badge: "결혼식", desc: "신랑 신부 정보와 날짜를 또렷하게 올리기 좋은 애니 웨딩 카드.", tags: ["#애니", "#웨딩", "#정보형"], previewPath: "/images/custom/wedding/wedding-19.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-04", category: "wedding", name: "애니 가든 04", badge: "결혼식", desc: "긴 모바일 초대장 화면에 맞춘 감성 애니메이션 배경 카드.", tags: ["#애니", "#청첩장", "#롱폼"], previewPath: "/images/custom/wedding/wedding-20.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-05", category: "wedding", name: "애니 가든 05", badge: "결혼식", desc: "밝은 색감과 텍스트 공간을 갖춘 모바일 웨딩 초대장.", tags: ["#애니", "#밝은톤", "#텍스트"], previewPath: "/images/custom/wedding/wedding-21.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-06", category: "wedding", name: "애니 가든 06", badge: "결혼식", desc: "초대 문구와 장소 정보를 자연스럽게 얹는 애니 스타일 카드.", tags: ["#애니", "#장소", "#초대문구"], previewPath: "/images/custom/wedding/wedding-22.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-07", category: "wedding", name: "애니 가든 07", badge: "결혼식", desc: "모바일 화면에서 길게 감상하기 좋은 애니 감성 웨딩 카드.", tags: ["#애니", "#모바일", "#감성"], previewPath: "/images/custom/wedding/wedding-23.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-08", category: "wedding", name: "애니 가든 08", badge: "결혼식", desc: "사진 없이도 분위기를 살릴 수 있는 애니메이션 청첩장 배경.", tags: ["#애니", "#사진없음", "#배경"], previewPath: "/images/custom/wedding/wedding-24.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-09", category: "wedding", name: "애니 가든 09", badge: "결혼식", desc: "문구와 일정 정보를 중심에 배치하기 좋은 부드러운 웨딩 카드.", tags: ["#애니", "#일정", "#부드러운"], previewPath: "/images/custom/wedding/wedding-25.png", sampleTextOverlay: true },
  { id: "wedding-anime-textspace-10", category: "wedding", name: "애니 가든 10", badge: "결혼식", desc: "초대장 본문을 올려 완성하기 좋은 세로형 애니 웨딩 템플릿.", tags: ["#애니", "#본문", "#세로형"], previewPath: "/images/custom/wedding/wedding-26.png", sampleTextOverlay: true },
  { id: "dol-cute", category: "dol", name: "테디 벌룬", badge: "돌잔치", desc: "곰돌이와 풍선이 반겨주는 따뜻한 노란빛 돌잔치 카드.", tags: ["#곰돌이", "#풍선", "#옐로우"], previewPath: "/images/custom/dol/dol-card-01.jpeg" },
  { id: "dol-pastel", category: "dol", name: "리본 크라운", badge: "돌잔치", desc: "핑크와 라벤더 리본, 왕관 장식이 돋보이는 사랑스러운 돌잔치 카드.", tags: ["#리본", "#크라운", "#핑크"], previewPath: "/images/custom/dol/dol-card-02.jpeg" },
  { id: "dol-blue", category: "dol", name: "우주 로켓", badge: "돌잔치", desc: "달과 로켓, 별 장식이 가득한 블루 우주 테마 돌잔치 카드.", tags: ["#우주", "#블루", "#별"], previewPath: "/images/custom/dol/dol-card-03.jpeg" },
  { id: "dol-nature", category: "dol", name: "골드 크라운", badge: "돌잔치", desc: "실크 골드와 왕관 포인트로 고급스럽게 완성한 프리미엄 돌잔치 카드.", tags: ["#골드", "#크라운", "#프리미엄"], previewPath: "/images/custom/dol/dol-card-04.jpeg" },
  { id: "dol-gold", category: "dol", name: "케이크 파티", badge: "돌잔치", desc: "케이크와 데코 장식이 중심이 되는 밝고 경쾌한 돌잔치 카드.", tags: ["#케이크", "#파티", "#러블리"], previewPath: "/images/custom/dol/dol-cake-01.jpeg" },
  { id: "hwangap-classic", category: "hwangap", name: "은은한 금빛", badge: "환갑잔치", desc: "차분한 금빛 여백과 전통 무드가 살아 있는 환갑 초대장.", tags: ["#금빛", "#전통", "#품격"], previewPath: "/images/custom/hwangap/hwangap-01.jpeg" },
  { id: "hwangap-modern", category: "hwangap", name: "전통 문양", badge: "환갑잔치", desc: "전통 문양과 여백으로 격식을 살린 정갈한 환갑 카드.", tags: ["#문양", "#전통", "#격식"], previewPath: "/images/custom/hwangap/hwangap-02.jpeg" },
  { id: "hwangap-red", category: "hwangap", name: "레드 포인트", badge: "환갑잔치", desc: "강렬한 레드 포인트와 전통 보더로 장수의 의미를 살린 카드.", tags: ["#레드", "#장수", "#보더"], previewPath: "/images/custom/hwangap/hwangap-03.jpeg" },
  { id: "hwangap-floral", category: "hwangap", name: "플로럴 격조", badge: "환갑잔치", desc: "플로럴 장식과 금빛 보더가 어우러진 화사한 환갑 카드.", tags: ["#플로럴", "#화사", "#품격"], previewPath: "/images/custom/hwangap/hwangap-04.jpeg" },
  { id: "hwangap-hanja", category: "hwangap", name: "서예 정통", badge: "환갑잔치", desc: "서예 감성과 깊은 컬러 톤으로 정통미를 강조한 환갑 카드.", tags: ["#서예", "#정통", "#한자"], previewPath: "/images/custom/hwangap/hwangap-05.jpeg" },
  { id: "bridal-pink", category: "bridal", name: "핑크 드림", badge: "브라이덜샤워", desc: "핑크 포인트와 리본 장식이 사랑스러운 브라이덜샤워 카드.", tags: ["#핑크", "#리본", "#샤워"], previewPath: "/images/custom/bridal/bridal-01.jpeg" },
  { id: "bridal-boho", category: "bridal", name: "보헤미안", badge: "브라이덜샤워", desc: "차분한 톤과 드라이 플라워 느낌이 어우러진 브라이덜샤워 카드.", tags: ["#보헤미안", "#어스톤", "#감성"], previewPath: "/images/custom/bridal/bridal-02.jpeg" },
  { id: "bridal-modern", category: "bridal", name: "블랙 럭셔리", badge: "브라이덜샤워", desc: "화이트 여백 위에 포인트 장식이 살아 있는 깔끔한 럭셔리 카드.", tags: ["#럭셔리", "#화이트", "#하이엔드"], previewPath: "/images/custom/bridal/bridal-03.jpeg" },
  { id: "bridal-mint", category: "bridal", name: "민트 프레쉬", badge: "브라이덜샤워", desc: "부드러운 컬러감과 여백이 시원한 민트 무드 브라이덜샤워 카드.", tags: ["#민트", "#청량", "#상큼"], previewPath: "/images/custom/bridal/bridal-04.jpeg" },
  { id: "birthday-fun", category: "birthday", name: "테디 생일", badge: "생일파티", desc: "곰돌이와 풍선이 함께하는 밝고 포근한 생일파티 카드.", tags: ["#곰돌이", "#풍선", "#파티"], previewPath: "/images/custom/birthday/birthday-01.jpeg" },
  { id: "birthday-elegant", category: "birthday", name: "밤하늘 생일", badge: "생일파티", desc: "달과 별빛이 들어간 차분한 밤하늘 생일파티 카드.", tags: ["#밤하늘", "#별", "#블루"], previewPath: "/images/custom/birthday/birthday-02.jpeg" },
  { id: "birthday-kids", category: "birthday", name: "케이크 파티", badge: "생일파티", desc: "케이크와 파스텔 풍선으로 완성한 귀여운 생일파티 카드.", tags: ["#케이크", "#풍선", "#러블리"], previewPath: "/images/custom/birthday/birthday-03.jpeg" },
  { id: "house-warm", category: "housewarming", name: "그린 집들이", badge: "집들이", desc: "새 보금자리를 알리는 따뜻한 그린 집들이 초대장.", tags: ["#집들이", "#그린", "#따뜻한"], previewPath: "/images/genspark/6XcxVcVH.jpg" },
  { id: "house-modern", category: "housewarming", name: "모던 화이트", badge: "집들이", desc: "모던하고 깔끔한 화이트 인테리어 감성의 집들이 초대장.", tags: ["#모던", "#화이트", "#인테리어"] },
  { id: "baby-shower", category: "baby", name: "블루 스카이", badge: "베이비샤워", desc: "하늘빛 파란색의 포근한 베이비샤워 초대장.", tags: ["#베이비", "#블루", "#포근"], previewPath: "/images/genspark/zIB8bEWC.jpg" },
  { id: "baby-pink", category: "baby", name: "핑크 베이비", badge: "베이비샤워", desc: "핑크빛 공주 테마의 사랑스러운 베이비샤워 초대장.", tags: ["#베이비", "#핑크", "#공주"] },
  { id: "graduation", category: "graduation", name: "블루 졸업", badge: "졸업파티", desc: "네이비 블루의 격조 있는 졸업 파티 초대장.", tags: ["#졸업", "#네이비", "#격식"], previewPath: "/images/genspark/Xdz6nHcL.jpg" },
  { id: "graduation-warm", category: "graduation", name: "골든 졸업", badge: "졸업파티", desc: "황금빛의 따뜻하고 화사한 졸업 파티 초대장.", tags: ["#졸업", "#골드", "#화사"] },
  { id: "business", category: "business", name: "비즈니스 블루", badge: "비즈니스", desc: "신뢰와 전문성을 담은 비즈니스 행사 초대장.", tags: ["#비즈니스", "#전문", "#행사"], previewPath: "/images/genspark/xpx0zLPW.jpg" },
  { id: "business-dark", category: "business", name: "다크 프리미엄", badge: "비즈니스", desc: "블랙 배경의 프리미엄 비즈니스 행사 초대장.", tags: ["#다크", "#프리미엄", "#비즈니스"] },
  { id: "wedding-anime-2026", category: "wedding", name: "애니 플로럴 아치", badge: "결혼식", desc: "프리미엄 종이 질감과 플로럴 아치를 애니 감성으로 풀어낸 청첩장.", tags: ["#애니", "#플로럴", "#여백"], sampleTextOverlay: true },
  { id: "dol-anime-2026", category: "dol", name: "문라이트 돌잔치", badge: "돌잔치", desc: "달과 별, 파스텔 풍선이 가장자리를 감싸는 애니 돌잔치 카드.", tags: ["#애니", "#달", "#파스텔"], sampleTextOverlay: true },
  { id: "hwangap-anime-2026", category: "hwangap", name: "화조 격조", badge: "환갑잔치", desc: "모란과 금빛 전통 보더로 품격 있게 정리한 애니 환갑 초대장.", tags: ["#애니", "#전통", "#모란"], sampleTextOverlay: true },
  { id: "bridal-anime-2026", category: "bridal", name: "블러쉬 리본", badge: "브라이덜샤워", desc: "리본과 화이트 플라워가 부드럽게 둘러주는 애니 브라이덜샤워 카드.", tags: ["#애니", "#리본", "#블러쉬"], sampleTextOverlay: true },
  { id: "birthday-anime-2026", category: "birthday", name: "파스텔 파티", badge: "생일파티", desc: "풍선과 케이크, 파스텔 장식으로 밝게 완성한 애니 생일파티 카드.", tags: ["#애니", "#파티", "#케이크"], sampleTextOverlay: true },
  { id: "housewarming-anime-2026", category: "housewarming", name: "햇살 집들이", badge: "집들이", desc: "창가 햇살과 식물 포인트가 따뜻하게 남는 애니 집들이 초대장.", tags: ["#애니", "#햇살", "#집들이"], sampleTextOverlay: true },
  { id: "baby-anime-2026", category: "baby", name: "클라우드 베이비", badge: "베이비샤워", desc: "구름과 리본, 작은 별빛을 여백 위에 얹은 애니 베이비샤워 카드.", tags: ["#애니", "#구름", "#리본"], sampleTextOverlay: true },
  { id: "graduation-anime-2026", category: "graduation", name: "골드 졸업식", badge: "졸업파티", desc: "네이비 리본과 금빛 보더로 단정하게 만든 애니 졸업파티 초대장.", tags: ["#애니", "#졸업", "#골드"], sampleTextOverlay: true },
  { id: "business-anime-2026", category: "business", name: "라이트 컨퍼런스", badge: "비즈니스", desc: "건축적인 빛과 네이비 라인으로 정리한 애니 비즈니스 행사 카드.", tags: ["#애니", "#컨퍼런스", "#프리미엄"], sampleTextOverlay: true },
  ...barunsonCategoryAnimeTemplates
];

export const featuredMobileTemplateIds = [
  "wedding-barunson-anime-25",
  "wedding-barunson-anime-26",
  "wedding-barunson-anime-27",
  "wedding-barunson-anime-28",
  "wedding-barunson-anime-29",
  "wedding-barunson-anime-30",
  "dol-barunson-anime-16",
  "birthday-barunson-anime-05",
  "housewarming-barunson-anime-10",
  "hwangap-barunson-anime-08"
] as const;

export const homeHeroTemplateIds = [
  "wedding-barunson-anime-09",
  "wedding-barunson-anime-04",
  "wedding-barunson-anime-10"
] as const;

export const homeTemplateSections: HomeTemplateSection[] = [
  {
    key: "wedding",
    title: "청첩장 템플릿",
    subtitle: "로맨틱하고 단정한 웨딩 디자인",
    categoryKeys: ["wedding"]
  },
  {
    key: "dol",
    title: "돌잔치 템플릿",
    subtitle: "아기 사진과 잘 어울리는 밝은 디자인",
    categoryKeys: ["dol"]
  },
  {
    key: "bridal",
    title: "브라이덜샤워 템플릿",
    subtitle: "친구들과 나누기 좋은 화사한 디자인",
    categoryKeys: ["bridal"]
  },
  {
    key: "hwangap",
    title: "환갑잔치 템플릿",
    subtitle: "격식과 따뜻함을 담은 초대장",
    categoryKeys: ["hwangap"]
  },
  {
    key: "party",
    title: "파티 초대장",
    subtitle: "생일, 집들이, 베이비샤워까지",
    categoryKeys: ["birthday", "housewarming", "baby", "graduation", "business"]
  }
];

export function getMobileTemplateById(templateId: string) {
  return mobileTemplateGallery.find((template) => template.id === templateId) ?? null;
}

export function getMobileTemplatesByCategory(category: string) {
  return mobileTemplateGallery.filter((template) => template.category === category);
}

export function getFeaturedMobileTemplates(limit = featuredMobileTemplateIds.length) {
  return featuredMobileTemplateIds
    .map((templateId) => getMobileTemplateById(templateId))
    .filter((template): template is MobileTemplateGalleryItem => Boolean(template))
    .slice(0, limit);
}

export function getHomeHeroTemplates() {
  return homeHeroTemplateIds
    .map((templateId) => getMobileTemplateById(templateId))
    .filter((template): template is MobileTemplateGalleryItem => Boolean(template));
}

export function getHomeTemplateSections() {
  return homeTemplateSections.map((section) => ({
    ...section,
    templates: mobileTemplateGallery.filter((template) => section.categoryKeys.includes(template.category))
  }));
}
