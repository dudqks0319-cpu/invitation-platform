# InviteHub Store Submission Metadata

## App Store

### App Name
InviteHub

### Subtitle
모바일 초대장 제작과 공유

### Promotional Text
디자인을 고르고 이름, 날짜, 장소만 채우면 모바일 초대장을 바로 만들 수 있습니다.

### Description
InviteHub는 결혼식과 각종 행사 초대장을 모바일에서 손쉽게 만들고 공유할 수 있는 앱입니다.

- 청첩장, 돌잔치, 브라이덜샤워, 환갑잔치 등 행사별 템플릿을 고를 수 있습니다.
- 날짜, 장소, 문구, 계좌 안내, RSVP, 방명록까지 한 번에 준비할 수 있습니다.
- 링크 하나로 하객에게 초대장을 공유하고 참석 여부와 축하 메시지를 받을 수 있습니다.
- 방명록은 호스트 확인 후 공개되도록 운영할 수 있습니다.
- 기본 구성은 무료로 시작할 수 있고, 사진이 포함된 발행은 앱 스토어 결제 흐름을 사용합니다.

현재 적용 중인 요금 정책:
- 기본 디자인: 무료
- 사진 포함 발행권: 3,300원

InviteHub는 “디자인을 먼저 고르고, 필요한 정보만 채워 공유한다”는 방향으로 초대장 경험을 만들고 있습니다.

### Keywords
청첩장,모바일초대장,결혼식초대장,돌잔치초대장,초대장제작,웨딩초대장,모바일청첩장,RSVP,방명록,초대링크

### Review Notes
- 로그인 없이도 앱 내에서 초대장 초안을 만들고 미리보기할 수 있습니다.
- 계정이 있는 경우 원격 저장, 공개 링크 발행, RSVP/방명록 관리가 가능합니다.
- 방명록은 작성 직후 공개되지 않고 호스트가 대시보드에서 승인하거나 숨길 수 있습니다.
- 지도는 앱 내부 지도 타일을 직접 표시하지 않고, 장소명/주소를 기준으로 카카오맵과 네이버지도 검색 링크를 엽니다.
- 사진이 포함된 유료 발행은 iOS 앱에서 Apple In-App Purchase를 사용합니다.
- App Store 제출 전 App Store Connect의 인앱결제 상품 ID와 `EXPO_PUBLIC_IAP_PRODUCT_ID_IOS`가 일치해야 합니다.

### In-App Purchase
- Product ID: `publish.credit.ios`
- Type: Consumable
- Display Name: 사진 포함 발행권
- Price Target: 3,300원
- Server Env: `STORE_PUBLISH_PRODUCT_IDS_IOS=publish.credit.ios`
- Mobile Env: `EXPO_PUBLIC_IAP_PRODUCT_ID_IOS=publish.credit.ios`

### App Privacy Labels Draft
App Store Connect 입력 시 아래 항목을 기준으로 실제 운영 설정과 맞춰 저장합니다.

- Contact Info: 이메일, 이름. 계정 관리, 초대장 소유자 표시, RSVP 연락 목적.
- User Content: 초대장 문구, 사진, RSVP, 방명록. 앱 기능 제공 목적.
- Identifiers: 사용자 ID, 초대장 ID, 결제 트랜잭션 ID. 앱 기능 및 결제 검증 목적.
- Purchases: 인앱상품 ID, 주문/트랜잭션 참조. 결제 검증 및 부정 사용 방지 목적.
- Tracking: 현재 제출 기준으로 추적 목적 사용 없음.

### Support
- Email: support@invitehub.co.kr
- Privacy: https://invitehub.co.kr/privacy
- Terms: https://invitehub.co.kr/terms

## Google Play

### Short Description
디자인을 골라 바로 만드는 모바일 초대장 앱

### Full Description
InviteHub는 결혼식과 각종 행사 초대장을 모바일에서 쉽게 만들고, 링크로 공유하고, 응답과 방명록까지 함께 관리할 수 있는 앱입니다.

핵심 기능:
- 행사별 디자인으로 바로 시작
- 날짜, 장소, 문구, 계좌 안내 입력
- RSVP 및 방명록 관리
- 링크 공유
- 사진 포함 발행 옵션 지원

현재 요금 정책:
- 기본 디자인: 무료
- 사진 포함 발행권: 3,300원

### Support
- Email: support@invitehub.co.kr
- Privacy: https://invitehub.co.kr/privacy
- Terms: https://invitehub.co.kr/terms
