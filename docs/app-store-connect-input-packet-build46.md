# InviteHub App Store Connect Input Packet - Build 46

This packet was prepared for `1.0.1 (46)`. Do not use it to select build 46 for
App Store review after the 2026-05-19 real iPhone launch failure. Keep the copy
as a template for the next build packet.

2026-05-19 blocker: connected iPhone evidence found installed
`com.invitehub.app` version `1.0.1` bundle version `46`, but launch produced the
iOS crash prompt and console `Unhandled JS Exception: Error: No routes found`.

## Candidate Summary

| Field | Value |
| --- | --- |
| App Store Connect App ID | `6763630299` |
| Bundle ID | `com.invitehub.app` |
| Display Name | `초대장허브` |
| App Version | `1.0.1` |
| Build Number | `46` |
| EAS Build ID | `4aefa47b-ca9e-4d90-8029-a8ab6f45a528` |
| EAS Submission ID | `023a9129-d68b-406a-a5b5-58e03c98a13a` |
| IPA Artifact | `https://expo.dev/artifacts/eas/afGx9mRBMme34vyPZ7Jyu1.ipa` |
| Internal Group | `Team (Expo)` |

Do not press final Add for Review or Submit for Review until a newer build
passes real-device QA and the user explicitly approves that Apple-side action.

## Positioning

Use the free MVP positioning:

`초대장허브는 템플릿을 골라 모바일 초대장을 만들고 공개 링크로 공유하는 무료 초대장 제작 앱입니다.`

Do not claim paid photo publishing, IAP, paid premium templates, or guaranteed
custom-domain support in this build.

## App Review Notes Draft

```txt
초대장허브는 모바일 초대장을 만들고 공개 링크로 공유하는 앱입니다.

이번 제출 버전에서는 무료 초대장 작성, 미리보기, 공개 링크 발행, RSVP, 방명록 기능을 제공합니다. 사진 포함 유료 발행 및 인앱 결제 기능은 현재 제출 빌드에서 비활성화되어 있으며, App Store Connect의 IAP 상품 승인 후 별도 업데이트로 제공할 예정입니다.

테스트 흐름:
1. TestFlight에서 1.0.1 (46)을 설치합니다.
2. 앱을 실행합니다.
3. 홈에서 템플릿을 선택합니다.
4. 초대장 기본 정보를 입력합니다.
5. 미리보기를 확인합니다.
6. 무료 공개 링크를 발행합니다.
7. 공개 링크에서 RSVP/방명록 작성을 확인합니다.

지도는 내장 지도 API가 아니라 입력된 장소/주소 기반의 외부 지도 검색 링크로 연결됩니다.
```

## Metadata Checklist

- [ ] App name is final and not a placeholder.
- [ ] Subtitle is filled.
- [ ] Description is filled and matches the free MVP feature set.
- [ ] Keywords are filled.
- [ ] Category and age rating are selected.
- [ ] Privacy policy URL opens successfully.
- [ ] Support URL opens successfully.
- [ ] App Review contact email is a verified mailbox.
- [ ] Screenshots match the current app UI.
- [ ] Build `1.0.1 (46)` is not selected; use the next real-device-passing
      build instead.
- [ ] Paid/IAP/photo-included claims are absent while paid publish is disabled.

## Real iPhone QA Checklist

- [ ] TestFlight에서 다음 빌드를 설치.
- [ ] 기존 설치 앱 삭제 후 재설치 여부 기록.
- [ ] 첫 실행 시 iOS crash dialog 없음.
- [ ] 홈 화면 5초 안에 표시.
- [ ] 템플릿 선택 시 작성 Step 1로 이동.
- [ ] 작성 단계에서 제목/날짜/장소/주소/메시지 입력 가능.
- [ ] 미리보기 진입 가능.
- [ ] 무료 발행 성공.
- [ ] 공개 링크 Safari에서 정상 표시.
- [ ] RSVP 작성 가능.
- [ ] 방명록 작성 가능.
- [ ] 작성자 화면에서 RSVP/방명록 확인 가능.

## Evidence Keys

Record these after Apple-side checks:

```txt
currentTestFlightBuildProcessed
currentBuildAssignedToInternalGroup
realIphoneTestFlightInstallLaunchPassed
currentReleaseBuildSelectedForVersion
appStoreMetadataSaved
appStorePrivacyLabelsSaved
appStoreScreenshotsUploaded
appReviewContactVerified
```
