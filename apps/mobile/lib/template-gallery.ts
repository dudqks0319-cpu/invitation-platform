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

export const mobileTemplateGallery: MobileTemplateGalleryItem[] = [
  { id: "wedding-classic", category: "wedding", name: "로즈 프레임", badge: "결혼식", desc: "로즈 가득한 보더 프레임 위에 정갈하게 올리는 클래식 웨딩 카드.", tags: ["#로즈", "#프레임", "#클래식"], previewPath: "/images/custom/wedding/wedding-01.jpeg" },
  { id: "wedding-modern", category: "wedding", name: "유칼립투스 아치", badge: "결혼식", desc: "은은한 보태니컬 아치가 둘러주는 산뜻하고 차분한 웨딩 카드.", tags: ["#보태니컬", "#그린", "#아치"], previewPath: "/images/custom/wedding/wedding-02.jpeg" },
  { id: "wedding-floral", category: "wedding", name: "미니멀 블룸", badge: "결혼식", desc: "여백이 넓은 미니멀 카드에 작은 꽃다발을 더한 단정한 초대장.", tags: ["#미니멀", "#화이트", "#블룸"], previewPath: "/images/custom/wedding/wedding-03.jpeg" },
  { id: "wedding-minimal", category: "wedding", name: "코너 블룸", badge: "결혼식", desc: "좌상단과 우하단 코너 플라워가 공간을 남겨주는 부드러운 웨딩 카드.", tags: ["#코너", "#플라워", "#소프트"], previewPath: "/images/custom/wedding/wedding-04.jpeg" },
  { id: "wedding-nature", category: "wedding", name: "골드 플로럴 보더", badge: "결혼식", desc: "섬세한 골드 라인과 플라워 코너가 어우러진 포멀 웨딩 초대장.", tags: ["#골드", "#포멀", "#보더"], previewPath: "/images/custom/wedding/wedding-05.jpeg" },
  { id: "wedding-rose-gold", category: "wedding", name: "로즈 골드 보더", badge: "결혼식", desc: "로즈 포인트와 골드 라인이 어우러진 화사한 웨딩 보더 카드.", tags: ["#로즈골드", "#보더", "#우아함"], previewPath: "/images/custom/wedding/wedding-06.jpeg" },
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
  { id: "business-dark", category: "business", name: "다크 프리미엄", badge: "비즈니스", desc: "블랙 배경의 프리미엄 비즈니스 행사 초대장.", tags: ["#다크", "#프리미엄", "#비즈니스"] }
];
