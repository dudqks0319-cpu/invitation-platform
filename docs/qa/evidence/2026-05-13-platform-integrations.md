# Platform Integration Evidence

Date: 2026-05-13

## Kakao

| Item | Status | Evidence |
| --- | --- | --- |
| `NEXT_PUBLIC_KAKAO_JS_KEY` lookup | Not checked |  |
| Platform key precedence | Not checked |  |
| SDK script loading | Not checked |  |
| `Kakao.Share.sendDefault` payload | Not checked |  |
| Fallback to Web Share or clipboard | Not checked |  |
| Real device Kakao app share | Watch | Requires staging/production domain and physical device |

## Login

| Item | Status | Evidence |
| --- | --- | --- |
| Supabase auth route | Not checked |  |
| Social login provider readiness | Not checked |  |
| Logged-in mobile home state | Not checked |  |

## Maps And Payments

| Item | Status | Evidence |
| --- | --- | --- |
| Kakao map link | Not checked |  |
| Naver/Google map fallback expectations | Not checked |  |
| KakaoPay link hidden/visible behavior | Not checked |  |
| Store payment publish-blocked state | Not checked |  |

## Export And Analytics

| Item | Status | Evidence |
| --- | --- | --- |
| RSVP CSV download | Not checked |  |
| CSV privacy warning | Not checked |  |
| GA4 `trackEvent` no-op without `gtag` | Not checked |  |
| GA4 real collection | Watch | Requires deployed GA4 tag and DebugView |
