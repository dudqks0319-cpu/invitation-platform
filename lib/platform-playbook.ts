export type PlatformCategoryKey = "wedding" | "dol" | "bridal" | "housewarming" | "hwangap";

export type PlatformCategory = {
  key: PlatformCategoryKey;
  label: string;
  emoji: string;
  tone: string;
  description: string;
  mustHave: string[];
};

export type PlatformPillar = {
  label: string;
  title: string;
  body: string;
  source: "Weddingly" | "Korean mobile invites" | "InviteHub";
};

export type BuilderFlowItem = {
  id: "template" | "story" | "media" | "guest" | "publish";
  title: string;
  body: string;
};

export type DashboardSignal = {
  label: string;
  metric: string;
  body: string;
};

export const priorityCategories: PlatformCategory[] = [
  {
    key: "wedding",
    label: "결혼식",
    emoji: "💍",
    tone: "아이보리, 플로럴, 세리프, 정중한 초대문",
    description: "신랑·신부, 혼주, 예식장, 축의금, 하객 응답까지 가장 완전한 모듈이 필요한 카테고리입니다.",
    mustHave: ["양가 연락처", "계좌/카카오페이", "네이버·카카오 지도", "참석 응답", "방명록"]
  },
  {
    key: "dol",
    label: "돌잔치",
    emoji: "🎂",
    tone: "파스텔, 아기 사진, 가족 중심 문구",
    description: "사진 갤러리와 성장 기록, 가족 초대 문구가 중심인 모바일 우선 초대장입니다.",
    mustHave: ["아기 프로필", "성장 갤러리", "참석 인원", "식사 여부", "하객 사진"]
  },
  {
    key: "bridal",
    label: "브라이덜샤워",
    emoji: "👰",
    tone: "라일락, 샴페인, 파티 무드, 가벼운 참석 확인",
    description: "친구 중심 파티 초대라서 템플릿 분위기와 공유 속도가 중요합니다.",
    mustHave: ["드레스코드", "파티 장소", "준비물", "참석 응답", "SNS 공유"]
  },
  {
    key: "housewarming",
    label: "집들이",
    emoji: "🏠",
    tone: "식물, 리넨, 테이블, 캐주얼한 안내",
    description: "주소와 길찾기, 시간대별 방문 안내가 핵심인 가벼운 생활 이벤트입니다.",
    mustHave: ["주소 복사", "길찾기", "방문 시간", "메모", "호스트 연락처"]
  },
  {
    key: "hwangap",
    label: "환갑",
    emoji: "🎊",
    tone: "금박, 매화, 비취, 가족 대표 초대문",
    description: "가족이 주최하는 격식 있는 행사로 축하 메시지 승인과 품격 있는 문구가 중요합니다.",
    mustHave: ["가족 대표명", "행사장", "축하 메시지", "사진 승인", "답례 안내"]
  }
];

export const platformPillars: PlatformPillar[] = [
  {
    label: "제작",
    title: "차근차근 만드는 흐름",
    body: "템플릿, 초대문, 사진, 참석 확인, 공개 링크를 순서대로 작성할 수 있게 안내합니다.",
    source: "Weddingly"
  },
  {
    label: "마음 확인",
    title: "하객 응답과 방명록",
    body: "참석 여부, 축하 메시지, 하객 사진을 한곳에서 확인하고 필요한 내용만 공개할 수 있습니다.",
    source: "InviteHub"
  },
  {
    label: "공유",
    title: "한국형 공유와 길찾기",
    body: "카카오톡 공유, 네이버 지도, 계좌 복사, 가족 호칭처럼 한국 모바일 초대장에서 기대하는 기능을 기본값으로 둡니다.",
    source: "Korean mobile invites"
  },
  {
    label: "보관",
    title: "고유 링크와 저장",
    body: "초안으로 저장하고, 완성된 초대장은 공개 링크로 간편하게 다시 꺼내볼 수 있습니다.",
    source: "InviteHub"
  }
];

export const builderFlow: BuilderFlowItem[] = [
  {
    id: "template",
    title: "템플릿과 행사 정보",
    body: "행사 유형, 날짜, 장소, 템플릿을 먼저 고정해 이후 입력 항목을 줄입니다."
  },
  {
    id: "story",
    title: "호스트와 초대문",
    body: "신랑·신부, 부모님, 아이, 가족 대표 등 카테고리별 호스트 문구를 구성합니다."
  },
  {
    id: "media",
    title: "미디어와 갤러리",
    body: "메인 사진, 배경, 갤러리, 배경음악을 업로드하고 발행 전 교체 비용을 안내합니다."
  },
  {
    id: "guest",
    title: "참석 확인과 마음 전하기",
    body: "참석 응답, 식사 여부, 방명록, 하객 사진, 계좌/간편송금을 한 흐름으로 묶습니다."
  },
  {
    id: "publish",
    title: "지도와 공개 링크",
    body: "네이버·카카오 길찾기, 카카오 공유, QR/고유 링크까지 발행 직전 확인합니다."
  }
];

export const dashboardSignals: DashboardSignal[] = [
  {
    label: "참석 확인",
    metric: "응답 현황",
    body: "참석, 불참, 식사, 동행 인원을 한눈에 확인합니다."
  },
  {
    label: "방명록",
    metric: "새 메시지",
    body: "공개 전 메시지와 사진을 확인해 가족 행사에 맞는 톤을 유지합니다."
  },
  {
    label: "공유",
    metric: "조회 현황",
    body: "카카오 공유와 공개 링크 조회 흐름을 함께 관리합니다."
  }
];

export const referenceSummary = [
  {
    name: "Weddingly Builder",
    strength: "관리자 빌더, 커스텀 URL, 참석 응답, 갤러리, 음악, 지도, 선물/계좌 섹션을 하나의 제작 흐름으로 묶음",
    applyToInviteHub: "빌더를 단순 폼이 아니라 운영 가능한 제작 파이프라인으로 표현"
  },
  {
    name: "한국형 모바일 청첩장",
    strength: "카카오 공유, 네이버/카카오 지도, 계좌 복사, 방명록, 가족 호칭 등 국내 사용자가 기대하는 세부 기능",
    applyToInviteHub: "결혼식뿐 아니라 돌잔치·환갑·집들이에도 한국형 기본 모듈을 확장"
  },
  {
    name: "참석 응답 관리 계열",
    strength: "하객 응답을 수집하고 관리자 화면에서 필터링·집계하는 운영 중심 구조",
    applyToInviteHub: "대시보드를 템플릿 목록이 아니라 행사 운영 콘솔로 확장"
  }
];
