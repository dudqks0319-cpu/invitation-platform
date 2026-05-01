# InviteHub Store Screenshot Plan

## Required Capture Set

App Store Connect accepts 1 to 10 screenshots per display set in `.png`,
`.jpg`, or `.jpeg` format.

### iPhone 6.5"
1. 홈 화면
2. 디자인 둘러보기 화면
3. 초대장 만들기 Step 1
4. 사진 추가 Step 3
5. 마지막 미리보기 화면
6. 공개 초대장 화면
7. RSVP 입력 화면
8. 방명록 화면
9. 운영 화면
10. 마이페이지

### Android Phone
1. 홈 화면
2. 디자인 둘러보기 화면
3. 초대장 만들기 Step 1
4. 마지막 미리보기 화면
5. 공개 초대장 화면
6. 마이페이지

## Capture Notes

- 모든 캡처는 한국어 UI 기준
- 홈 화면은 현재 제품 방향에 맞춰 템플릿을 먼저 고르는 단순한 첫 화면으로 캡처한다.
- 가격 정책은 홈이 아니라 미리보기/발행 요약 화면에서 확인되게 한다.
- 마지막 미리보기에서는 선택한 고정 템플릿 캔버스 위에 이름, 날짜, 장소, 문구가 실제로 오버레이된 상태를 캡처한다.
- 사진 포함 발행권 안내는 IAP 상품이 App Store Connect에 준비된 경우에만 스크린샷/메타데이터에 노출한다.
- 마이페이지에서는 개인정보처리방침, 이용약관, 계정 삭제 진입이 보여야 함

## Current Local Evidence

- Latest iOS Release home screenshot:
  `/private/tmp/invitehub-release-home-current.png`
- Latest fixed invitation preview screenshot from real Simulator taps:
  `/private/tmp/invitehub-preview-fit-to-viewport.png`
- Verified local screenshot folder:
  `/Users/jyb-m3max/Desktop/codex/invitation-platform/output/store-screenshots-verified`
- `scripts/verify-store-screenshots.sh output/store-screenshots-verified`:
  1 PNG checked, `05-preview-fit-to-viewport.png` passed at `1206x2622`.
- These are simulator evidence only. Final App Store screenshot assets still
  need to be captured/exported in the required App Store Connect sizes.

## Simulator Checklist

1. 최신 빌드 설치
2. 샘플 초대장 draft 생성
3. 대표 템플릿 1개 선택
4. RSVP/방명록 샘플 데이터 준비
5. 스크린샷 순서대로 캡처

## Automation

기본 자동 캡처 스크립트:

```bash
zsh /Users/jyb-m3max/Desktop/codex/invitation-platform/scripts/capture-store-screenshots.sh
```

기본 출력 경로:

```bash
/Users/jyb-m3max/Desktop/codex/invitation-platform/output/store-screenshots
```

지원 범위:
- 홈
- 디자인 둘러보기
- 빌더 Step 1
- 빌더 Step 3
- 미리보기
- 마이페이지

크기 검증:

```bash
zsh /Users/jyb-m3max/Desktop/codex/invitation-platform/scripts/verify-store-screenshots.sh \
  /Users/jyb-m3max/Desktop/codex/invitation-platform/output/store-screenshots-verified
```

현재 iPhone 17 캡처는 `1206x2622`이며, Apple의 iPhone 6.3" 세트 허용 크기에
해당한다. 최종 제출 세트는 가능하면 App Store Connect에서 요구하는
대표 디스플레이 세트별로 다시 캡처한다.

주의:
- 스크립트는 실행 전 `com.invitehub.app.dev`와
  `com.invitehub.app.dev-default`를 종료/제거해 dev 앱이 딥링크를 가로채는
  문제를 줄인다.
- 다만 iOS Simulator에서 `simctl openurl`을 쓰면 `InviteHub에서
  열겠습니까?` 확인 팝업이 뜰 수 있다. 이 팝업이 찍힌 이미지는 스토어
  제출용으로 쓰면 안 된다.
- 최종 제출 이미지는 실제 탭 흐름으로 이동한 뒤 캡처하거나, 팝업을
  수동으로 해제한 뒤 다시 캡처한다.

수동 추가 권장:
- 공개 초대장
- RSVP 입력 후 상태
- 방명록 샘플 데이터
- 운영 화면/통계 화면

## Reviewer Demo Flow

1. 홈에서 `디자인 둘러보기`
2. 템플릿 선택 후 앱 내 빌더 진입
3. Step 1~5 입력
4. 미리보기 확인
5. 무료 구성이라면 무료 발행
6. 공개 초대장, RSVP, 방명록, 운영 화면 확인

## App Review Notes Copy

```txt
로그인 없이 홈에서 템플릿을 선택하면 초대장 초안을 만들고 미리보기까지 확인할 수 있습니다.
원격 저장, 공개 링크 발행, RSVP/방명록 운영은 로그인 후 사용할 수 있습니다.
방명록은 하객 작성 직후 공개되지 않고 호스트가 대시보드에서 승인하거나 숨길 수 있습니다.
사진이 포함된 발행은 iOS에서 Apple In-App Purchase 상품 publish.credit.ios를 사용합니다.
문의: support@invitehub.co.kr
```
