# Platform Integration Evidence

Date: 2026-05-13

## Kakao

| Item | Status | Evidence |
| --- | --- | --- |
| `NEXT_PUBLIC_KAKAO_JS_KEY` lookup | Watch | Web public invitation reads `process.env.NEXT_PUBLIC_KAKAO_JS_KEY`, and draft payload can override it. `.env.example` and README do not yet document this web key. |
| Platform key precedence | Pass | `resolveInvitationPlatformConfig` lets draft-level Kakao JS key override platform key. |
| SDK script loading | Pass static | `ensureKakaoSdk(kakaoJsKey)` is called before `Kakao.Share.sendDefault`. Official Kakao JavaScript docs require a JavaScript SDK key and registered JavaScript SDK domain. |
| `Kakao.Share.sendDefault` payload | Pass static | Public invitation sends a text template with web/mobile web URLs and `buttonTitle: "초대장 보기"`. |
| Fallback to Web Share or clipboard | Watch | Kakao SDK failure falls through, but `navigator.share` and `navigator.clipboard` paths still lack prompt fallback on the public invitation page. |
| Real device Kakao app share | Requires device | Needs staging/production domain in Kakao Developers and a physical device with KakaoTalk installed. |

## Login

| Item | Status | Evidence |
| --- | --- | --- |
| Web Supabase OAuth route | Pass static | Web sign-in supports `google`, `apple`, and `kakao` providers through Supabase OAuth. |
| Mobile Kakao login provider readiness | Pass static | Expo config installs `@react-native-kakao/core` when `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY` exists. |
| Mobile Google provider readiness | Watch | `isNativeGoogleConfigured()` requires iOS client/url scheme values even on Android, so Android-only Google setup can be incorrectly reported as unconfigured. |
| Logged-in mobile home state | Pass static | Mobile home branches the header action to "내 초대장" for full accounts and "로그인" otherwise. |
| OAuth redirect scheme | Watch | Expo dev app can use `invitehub-dev`, but Supabase callback helper returns `invitehub://auth/callback`. |

## Maps And Payments

| Item | Status | Evidence |
| --- | --- | --- |
| Kakao map link | Pass web, Watch mobile app | Web uses Kakao map web URLs. Mobile custom user-provided Kakao URL path does not have a fallback when an app scheme fails. |
| Naver map link | Pass static | Naver web search fallback exists. Official Naver Maps scheme docs state app URL schemes require app install checks or store fallback. |
| Google map fallback | Gap | Web and mobile currently prioritize Naver/Kakao only. Several Korean invitation services expose Naver/Kakao/Google map options for broader guest compatibility. |
| KakaoPay link hidden/visible behavior | Pass baseline, Watch input | Missing link renders guidance instead of a disabled fake CTA. Input normalization is weak for values like `qr.kakaopay.com/...` without `https://`. |
| Store payment publish-blocked state | Pass static/tests | Mobile `useStorePurchase` treats `paymentConfirmed + publishBlocked` as a separate outcome and finishes the transaction. Test coverage exists. |
| Apple IAP environment | Watch | Mobile verification sends `sandbox` only in `__DEV__`; TestFlight/preview edge cases need backend fallback or build-channel config. |

## Export And Analytics

| Item | Status | Evidence |
| --- | --- | --- |
| RSVP CSV download | Watch | CSV export exists and includes BOM for Korean Excel compatibility, but cells are only quote-escaped and remain vulnerable to formula injection. |
| CSV privacy warning | Pass | Dashboard warns that CSV includes guest names and phone numbers and should only be used for event operations. |
| GA4 `trackEvent` no-op without `gtag` | Pass static | `trackEvent` safely no-ops when `window.gtag` is missing. |
| GA4 real collection | Gap | No GA4/GTM script is injected in `app/layout.tsx`, so production will not collect unless the deployment shell adds it separately. |

## Korean Market References Checked

- Kakao Developers: KakaoTalk Share JavaScript SDK and `Kakao.Share.sendDefault`.
- Kakao Developers: Kakao Login tutorial and redirect URI flow.
- Naver Cloud: Naver Maps URL scheme requirements and installed-app fallback.
- Kakao Maps: web URL patterns for map/search/direction links.
- Korean invitation services sampled from public pages: Paper Moments, Snap Post, MakeInvite, Makedear, PageSisters. Common expectations are Kakao/SMS/SNS share, RSVP, maps, account copy, guestbook, and in some cases QR/custom RSVP.
