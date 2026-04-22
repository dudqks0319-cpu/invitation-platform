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
  { key: "birthday", label: "생일", emoji: "🎁" },
  { key: "anniversary", label: "기념일", emoji: "♡" },
  { key: "hwangap", label: "환갑잔치", emoji: "🎊" },
  { key: "other", label: "기타 다양한", emoji: "☆" },
  { key: "bridal", label: "브라이덜샤워", emoji: "👰" },
  { key: "housewarming", label: "집들이", emoji: "🏠" },
  { key: "baby", label: "베이비샤워", emoji: "👶" },
  { key: "graduation", label: "졸업파티", emoji: "🎓" },
  { key: "business", label: "비즈니스", emoji: "📋" }
];

export const mobileTemplateGallery: MobileTemplateGalleryItem[] = [
  { id: "wedding-flower-garden", category: "wedding", name: "플라워 가든", badge: "결혼식", desc: "화사한 플로럴 아치가 중심이 되는 세로형 결혼식 템플릿.", tags: ["#플로럴", "#아치", "#세로형"], previewPath: "/images/highres/wedding/flower-garden.svg" },
  { id: "wedding-minimal-line", category: "wedding", name: "미니멀 라인", badge: "결혼식", desc: "여백과 얇은 보태니컬 라인으로 완성한 웨딩 템플릿.", tags: ["#미니멀", "#라인", "#보태니컬"], previewPath: "/images/highres/wedding/minimal-line.svg" },
  { id: "wedding-ribbon-frame", category: "wedding", name: "리본 프레임", badge: "결혼식", desc: "부드러운 리본 장식과 파스텔 프레임의 웨딩 템플릿.", tags: ["#리본", "#파스텔", "#프레임"], previewPath: "/images/highres/wedding/ribbon-frame.svg" },
  { id: "wedding-starry-garden", category: "wedding", name: "별빛 가든", badge: "결혼식", desc: "짙은 밤색 배경에 금빛 플라워가 빛나는 웨딩 템플릿.", tags: ["#네이비", "#골드", "#별빛"], previewPath: "/images/highres/wedding/starry-garden.svg" },
  { id: "wedding-soft-pastel", category: "wedding", name: "소프트 파스텔", badge: "결혼식", desc: "부드러운 파스텔 톤과 꽃 장식이 어우러진 웨딩 템플릿.", tags: ["#파스텔", "#수채화", "#로맨틱"] },
  { id: "wedding-watercolor-bloom", category: "wedding", name: "수채화 블룸", badge: "결혼식", desc: "수채화 꽃 번짐과 따뜻한 여백이 있는 웨딩 템플릿.", tags: ["#수채화", "#블룸", "#내추럴"] },
  { id: "wedding-classic", category: "wedding", name: "플라워 보더", badge: "결혼식", desc: "꽃잎이 감싸는 클래식 결혼식 템플릿.", tags: ["#로즈", "#프레임", "#클래식"], previewPath: "/images/custom/wedding/wedding-01.jpeg" },
  { id: "wedding-modern", category: "wedding", name: "화이트 플라워", badge: "결혼식", desc: "하얀 꽃과 그린 잎사귀가 둘러주는 결혼식 템플릿.", tags: ["#보태니컬", "#그린", "#아치"], previewPath: "/images/custom/wedding/wedding-02.jpeg" },
  { id: "wedding-floral", category: "wedding", name: "드레스 클래식", badge: "결혼식", desc: "턱시도와 웨딩드레스 실루엣을 담은 결혼식 템플릿.", tags: ["#미니멀", "#화이트", "#블룸"], previewPath: "/images/custom/wedding/wedding-03.jpeg" },
  { id: "wedding-minimal", category: "wedding", name: "그린 리스", badge: "결혼식", desc: "초록 리스가 정갈하게 감싸는 결혼식 템플릿.", tags: ["#코너", "#플라워", "#소프트"], previewPath: "/images/custom/wedding/wedding-04.jpeg" },
  { id: "wedding-nature", category: "wedding", name: "골드 아치", badge: "결혼식", desc: "금빛 라인과 잎사귀가 어우러진 결혼식 템플릿.", tags: ["#골드", "#포멀", "#보더"], previewPath: "/images/custom/wedding/wedding-05.jpeg" },
  { id: "wedding-rose-gold", category: "wedding", name: "채플 스케치", badge: "결혼식", desc: "채플 라인 드로잉 감성의 결혼식 템플릿.", tags: ["#로즈골드", "#보더", "#우아함"], previewPath: "/images/custom/wedding/wedding-06.jpeg" },
  { id: "dol-cute", category: "dol", name: "테디 벌룬", badge: "돌잔치", desc: "곰돌이와 풍선이 반겨주는 돌잔치 템플릿.", tags: ["#곰돌이", "#풍선", "#옐로우"], previewPath: "/images/custom/dol/dol-card-01.jpeg" },
  { id: "dol-pastel", category: "dol", name: "아기 왕관", badge: "돌잔치", desc: "왕관을 쓴 아기 얼굴이 중심인 돌잔치 템플릿.", tags: ["#리본", "#크라운", "#핑크"], previewPath: "/images/custom/dol/dol-card-02.jpeg" },
  { id: "dol-blue", category: "dol", name: "목마 첫돌", badge: "돌잔치", desc: "목마와 그린 장식이 있는 돌잔치 템플릿.", tags: ["#우주", "#블루", "#별"], previewPath: "/images/custom/dol/dol-card-03.jpeg" },
  { id: "dol-nature", category: "dol", name: "체크 리본", badge: "돌잔치", desc: "파란 체크와 리본으로 꾸민 돌잔치 템플릿.", tags: ["#골드", "#크라운", "#프리미엄"], previewPath: "/images/custom/dol/dol-card-04.jpeg" },
  { id: "dol-gold", category: "dol", name: "파스텔 풍선", badge: "돌잔치", desc: "파스텔 풍선이 부드럽게 떠 있는 돌잔치 템플릿.", tags: ["#케이크", "#파티", "#러블리"], previewPath: "/images/custom/dol/dol-cake-01.jpeg" },
  { id: "dol-eucalyptus", category: "dol", name: "열기구 첫돌", badge: "돌잔치", desc: "열기구와 아기자기한 장식의 돌잔치 템플릿.", tags: ["#유칼립투스", "#케이크", "#내추럴"], previewPath: "/images/custom/dol/dol-cake-02.jpeg" },
  { id: "dol-star-cake", category: "dol", name: "골드 스타 케이크", badge: "돌잔치", desc: "별 장식과 골드 포인트가 가볍게 반짝이는 화사한 돌잔치 카드.", tags: ["#골드", "#별", "#화사함"], previewPath: "/images/custom/dol/dol-cake-03.jpeg" },
  { id: "dol-blue-balloon", category: "dol", name: "블루 벌룬 케이크", badge: "돌잔치", desc: "하늘색 풍선과 케이크가 어우러진 산뜻한 블루 무드 돌잔치 카드.", tags: ["#블루", "#풍선", "#산뜻함"], previewPath: "/images/custom/dol/dol-cake-04.jpeg" },
  { id: "dol-pink-first", category: "dol", name: "핑크 퍼스트 케이크", badge: "돌잔치", desc: "핑크 촛불과 파스텔 도트가 사랑스럽게 어우러진 첫 돌 초대장.", tags: ["#핑크", "#퍼스트", "#파스텔"], previewPath: "/images/custom/dol/dol-cake-05.jpeg" },
  { id: "hwangap-classic", category: "hwangap", name: "플라워 환갑", badge: "환갑잔치", desc: "꽃 장식이 품격 있게 감싸는 환갑 템플릿.", tags: ["#금빛", "#전통", "#품격"], previewPath: "/images/custom/hwangap/hwangap-01.jpeg" },
  { id: "hwangap-modern", category: "hwangap", name: "네이비 금장", badge: "환갑잔치", desc: "짙은 남색과 금장 포인트의 환갑 템플릿.", tags: ["#문양", "#전통", "#격식"], previewPath: "/images/custom/hwangap/hwangap-02.jpeg" },
  { id: "hwangap-red", category: "hwangap", name: "핑크 플로럴", badge: "환갑잔치", desc: "화사한 분홍 꽃으로 꾸민 환갑 템플릿.", tags: ["#레드", "#장수", "#보더"], previewPath: "/images/custom/hwangap/hwangap-03.jpeg" },
  { id: "hwangap-floral", category: "hwangap", name: "그린 전통", badge: "환갑잔치", desc: "초록 전통 문양을 닮은 환갑 템플릿.", tags: ["#플로럴", "#화사", "#품격"], previewPath: "/images/custom/hwangap/hwangap-04.jpeg" },
  { id: "hwangap-hanja", category: "hwangap", name: "학 그림", badge: "환갑잔치", desc: "학 일러스트가 담긴 전통 환갑 템플릿.", tags: ["#서예", "#정통", "#한자"], previewPath: "/images/custom/hwangap/hwangap-05.jpeg" },
  { id: "hwangap-branch", category: "hwangap", name: "세로 회갑연", badge: "환갑잔치", desc: "세로 서체와 가지 장식의 회갑연 템플릿.", tags: ["#미니멀", "#가지", "#정갈함"], previewPath: "/images/custom/hwangap/hwangap-06.jpeg" },
  { id: "bridal-pink", category: "bridal", name: "핑크 드림", badge: "브라이덜샤워", desc: "핑크 포인트와 리본 장식이 사랑스러운 브라이덜샤워 카드.", tags: ["#핑크", "#리본", "#샤워"], previewPath: "/images/custom/bridal/bridal-01.jpeg" },
  { id: "bridal-boho", category: "bridal", name: "보헤미안", badge: "브라이덜샤워", desc: "차분한 톤과 드라이 플라워 느낌이 어우러진 브라이덜샤워 카드.", tags: ["#보헤미안", "#어스톤", "#감성"], previewPath: "/images/custom/bridal/bridal-02.jpeg" },
  { id: "bridal-modern", category: "bridal", name: "블랙 럭셔리", badge: "브라이덜샤워", desc: "화이트 여백 위에 포인트 장식이 살아 있는 깔끔한 럭셔리 카드.", tags: ["#럭셔리", "#화이트", "#하이엔드"], previewPath: "/images/custom/bridal/bridal-03.jpeg" },
  { id: "bridal-mint", category: "bridal", name: "민트 프레쉬", badge: "브라이덜샤워", desc: "부드러운 컬러감과 여백이 시원한 민트 무드 브라이덜샤워 카드.", tags: ["#민트", "#청량", "#상큼"], previewPath: "/images/custom/bridal/bridal-04.jpeg" },
  { id: "birthday-fun", category: "birthday", name: "풍선 생일", badge: "생일파티", desc: "하늘색 풍선으로 시작하는 생일 템플릿.", tags: ["#바다", "#동물친구", "#파티"], previewPath: "/images/custom/birthday/birthday-01.jpeg" },
  { id: "birthday-elegant", category: "birthday", name: "밤하늘 생일", badge: "생일파티", desc: "달과 별이 반짝이는 생일 템플릿.", tags: ["#샤크", "#버블", "#블루"], previewPath: "/images/custom/birthday/birthday-02.jpeg" },
  { id: "birthday-kids", category: "birthday", name: "스마일 생일", badge: "생일파티", desc: "노란 스마일이 밝게 웃는 생일 템플릿.", tags: ["#정글", "#동물", "#탐험"], previewPath: "/images/custom/birthday/birthday-03.jpeg" },
  { id: "birthday-ocean-shark", category: "birthday", name: "케이크 생일", badge: "생일파티", desc: "핑크 케이크와 촛불이 있는 생일 템플릿.", tags: ["#상어", "#바다", "#청량"], previewPath: "/images/custom/birthday/birthday-04.jpeg" },
  { id: "birthday-unicorn", category: "birthday", name: "컨페티 생일", badge: "생일파티", desc: "알록달록 컨페티로 꾸민 생일 템플릿.", tags: ["#유니콘", "#무지개", "#파스텔"], previewPath: "/images/custom/birthday/birthday-05.jpeg" },
  { id: "birthday-winter-penguin", category: "birthday", name: "곰돌이 생일", badge: "생일파티", desc: "곰돌이와 따뜻한 파티 무드의 생일 템플릿.", tags: ["#펭귄", "#겨울", "#스노우"], previewPath: "/images/custom/birthday/birthday-06.jpeg" },
  { id: "birthday-city-bus", category: "birthday", name: "시티 버스", badge: "생일파티", desc: "도시 풍경과 귀여운 버스가 달리는 경쾌한 생일파티 카드.", tags: ["#버스", "#도시", "#활기"], previewPath: "/images/custom/birthday/birthday-07.jpeg" },
  { id: "birthday-hero-star", category: "birthday", name: "히어로 스타", badge: "생일파티", desc: "별 포인트와 히어로 망토가 눈에 들어오는 씩씩한 생일파티 카드.", tags: ["#히어로", "#별", "#레드블루"], previewPath: "/images/custom/birthday/birthday-08.jpeg" },
  { id: "birthday-safari-jungle", category: "birthday", name: "사파리 정글", badge: "생일파티", desc: "사파리 동물 친구들과 잎사귀 프레임이 가득한 정글 생일 초대장.", tags: ["#사파리", "#정글", "#동물"], previewPath: "/images/custom/birthday/birthday-09.jpeg" },
  { id: "house-warm", category: "housewarming", name: "그린 집들이", badge: "집들이", desc: "새 보금자리를 알리는 따뜻한 그린 집들이 초대장.", tags: ["#집들이", "#그린", "#따뜻한"], previewPath: "/images/genspark/6XcxVcVH.jpg" },
  { id: "house-modern", category: "housewarming", name: "모던 화이트", badge: "집들이", desc: "모던하고 깔끔한 화이트 인테리어 감성의 집들이 초대장.", tags: ["#모던", "#화이트", "#인테리어"] },
  { id: "baby-shower", category: "baby", name: "블루 스카이", badge: "베이비샤워", desc: "하늘빛 파란색의 포근한 베이비샤워 초대장.", tags: ["#베이비", "#블루", "#포근"], previewPath: "/images/genspark/zIB8bEWC.jpg" },
  { id: "baby-pink", category: "baby", name: "핑크 베이비", badge: "베이비샤워", desc: "핑크빛 공주 테마의 사랑스러운 베이비샤워 초대장.", tags: ["#베이비", "#핑크", "#공주"] },
  { id: "graduation", category: "graduation", name: "블루 졸업", badge: "졸업파티", desc: "네이비 블루의 격조 있는 졸업 파티 초대장.", tags: ["#졸업", "#네이비", "#격식"], previewPath: "/images/genspark/Xdz6nHcL.jpg" },
  { id: "graduation-warm", category: "graduation", name: "골든 졸업", badge: "졸업파티", desc: "황금빛의 따뜻하고 화사한 졸업 파티 초대장.", tags: ["#졸업", "#골드", "#화사"] },
  { id: "business", category: "business", name: "비즈니스 블루", badge: "비즈니스", desc: "신뢰와 전문성을 담은 비즈니스 행사 초대장.", tags: ["#비즈니스", "#전문", "#행사"], previewPath: "/images/genspark/xpx0zLPW.jpg" },
  { id: "business-dark", category: "business", name: "다크 프리미엄", badge: "비즈니스", desc: "블랙 배경의 프리미엄 비즈니스 행사 초대장.", tags: ["#다크", "#프리미엄", "#비즈니스"] },
  { id: "anniversary-tulip", category: "anniversary", name: "커플 기념일", badge: "기념일", desc: "두 사람의 모습을 담은 기념일 템플릿.", tags: ["#튤립", "#기념일", "#감성"], previewPath: "/images/genspark/78rOyfxL.jpg" },
  { id: "anniversary-photo", category: "anniversary", name: "폴라로이드", badge: "기념일", desc: "작은 사진과 추억을 담는 기념일 템플릿.", tags: ["#사진", "#폴라로이드", "#추억"], previewPath: "/images/genspark/7W1rqztu.jpg" },
  { id: "anniversary-heart", category: "anniversary", name: "러브 하트", badge: "기념일", desc: "분홍 하트와 러브 레터 느낌의 기념일 템플릿.", tags: ["#하트", "#핑크", "#러브"], previewPath: "/images/genspark/AZJKCYaG.jpg" },
  { id: "anniversary-night", category: "anniversary", name: "별빛 1000일", badge: "기념일", desc: "밤하늘 아래 오래 남는 기념일 템플릿.", tags: ["#밤하늘", "#1000일", "#로맨틱"], previewPath: "/images/genspark/DJVxKvNl.jpg" },
  { id: "anniversary-branch", category: "anniversary", name: "보태니컬 기념일", badge: "기념일", desc: "마른 가지와 여백으로 꾸민 기념일 템플릿.", tags: ["#가지", "#크림", "#차분함"], previewPath: "/images/genspark/EFRNlJ6k.jpg" },
  { id: "anniversary-paris", category: "anniversary", name: "파리 기념일", badge: "기념일", desc: "에펠탑 실루엣이 있는 기념일 템플릿.", tags: ["#파리", "#여행", "#빈티지"], previewPath: "/images/genspark/EJf1yoDr.jpg" },
  { id: "other-moving", category: "other", name: "이사왔어요", badge: "기타", desc: "새 보금자리 소식을 전하는 초대장.", tags: ["#이사", "#집들이", "#소식"], previewPath: "/images/genspark/FeLszYGF.jpg" },
  { id: "other-graduation", category: "other", name: "졸업 축하", badge: "기타", desc: "졸업과 새로운 시작을 축하하는 초대장.", tags: ["#졸업", "#축하", "#시작"], previewPath: "/images/genspark/IWM0Xjom.jpg" },
  { id: "other-baby-shower", category: "other", name: "베이비샤워", badge: "기타", desc: "새 생명을 기다리는 따뜻한 초대장.", tags: ["#베이비샤워", "#아기", "#축하"], previewPath: "/images/genspark/J2t3Q3VC.jpg" },
  { id: "other-retirement", category: "other", name: "퇴임식", badge: "기타", desc: "감사와 존경을 전하는 퇴임식 초대장.", tags: ["#퇴임식", "#감사", "#꽃다발"], previewPath: "/images/genspark/JpRqNMCV.jpg" },
  { id: "other-teacher", category: "other", name: "선생님 감사", badge: "기타", desc: "감사의 마음을 꽃 한 송이에 담은 카드.", tags: ["#감사", "#선생님", "#카네이션"], previewPath: "/images/genspark/KIvCzl5p.jpg" },
  { id: "other-worship", category: "other", name: "예배 초대", badge: "기타", desc: "예배와 모임을 정갈하게 안내하는 초대장.", tags: ["#예배", "#초대", "#모임"], previewPath: "/images/genspark/LGIpWzz2.jpg" }
];
