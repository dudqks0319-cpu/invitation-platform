# InviteHub Store Screenshot Plan

## Required Capture Set

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
- 가격 정책은 `기본 디자인 무료 + 사진 옵션 추가`가 보이게 맞출 것
- 홈 화면에서는 무료 메시지가 보여야 함
- 마지막 미리보기에서는 선택 템플릿 무드와 요금 안내 카드가 함께 보이면 좋음
- 마이페이지에서는 개인정보처리방침, 이용약관, 계정 삭제 진입이 보여야 함

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
