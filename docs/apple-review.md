# Apple 심사 체크리스트

## 1. 핵심 가이드라인
- 1.2 User-Generated Content
- 3.1.1 In-App Purchase
- 4.8 Login Services
- 5.1.1 Data Collection and Storage

공식 문서:
- https://developer.apple.com/app-store/review/guidelines/

## 2. v1.0 대응 원칙
- 기본 템플릿 제작과 사진 없는 공개 링크 발행은 무료 제공
- 첫 제출 버전에서는 사진 포함 유료 발행을 노출하지 않음
- 사진 포함 발행은 App Store Connect IAP 상품이 준비된 뒤 Apple In-App Purchase로만 활성화
- 외부 결제 유도 문구 없음
- Apple 로그인 포함
- 계정 삭제 기능 포함
- RSVP와 방명록 공개/운영 보호 기능 포함

## 3. UGC 체크
- RSVP/방명록 작성은 JSON 요청, 입력 길이 제한, 허니팟 필드, rate limit을 적용한다.
- 방명록은 작성 직후 공개하지 않고 호스트 승인 후 공개한다.
- 대시보드에서 방명록 승인/숨김 처리가 가능하다.
- 문의 이메일과 개인정보 처리방침/약관 URL을 제출 메타데이터에 포함한다.
- 현재 코드 기준 자동 욕설 필터, 사용자 신고, 사용자 차단 기능은 확인되지 않았다. App Store 메타데이터나 Review Notes에서 해당 기능을 제공한다고 쓰지 않는다.

## 4. 로그인 체크
- 카카오 로그인 제공 시 Apple 로그인도 제공
- 로그인 없이 공개 링크는 웹에서 열람 가능
- 앱 내 계정 삭제 가능

## 5. 메타데이터 체크
- 스크린샷은 실제 앱 화면과 일치
- 앱 설명은 현재 기능만 기재
- 아직 없는 유료 기능과 IAP 상품을 메타데이터/스크린샷/Review Notes에 쓰지 않음

## 6. 제출 전 확인
- 실기기 빌드 성공
- 크래시 없는지 확인
- 권한 설명 문자열 확인
- privacy / terms URL 동작 확인
- 심사용 테스트 계정 준비

## 7. Review Notes 초안
- 테스트 계정 제공
- 로그인 없이 가능한 초안 생성/미리보기 경로 설명
- 로그인 후 원격 저장, 공개 링크 발행, RSVP/방명록 운영 경로 설명
- 첫 제출 빌드는 사진 없는 무료 발행만 제공하고 사진 포함 유료 발행은 숨겨져 있음을 설명
- IAP 상품 `publish.credit.ios`는 App Store Connect 상품 준비 후 별도 업데이트에서 활성화 예정
- 방명록은 승인 후 공개되고 대시보드에서 숨김 처리할 수 있음을 설명
- 문의 채널 `support@invitehub.co.kr` 설명
