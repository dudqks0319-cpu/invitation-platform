# 오삼오삼 iOS 릴리스 상태

Canonical status: [docs/current-release-state.md](docs/current-release-state.md)

- Candidate source: `1.0.3` at `8fe9a65`; next build number must exceed `64`
- App Store Connect: Build 64 is processed but superseded; no current-source build uploaded
- TestFlight real-device validation: pending a new exact build
- App Review: not submitted
- Public App Store: still `1.0.2`

Do not select Builds 62, 63, or 64 for App Review. Create and verify a new build
from `8fe9a65`, show the final preview to the user, and submit only after explicit
approval and the required real-iPhone TestFlight smoke test pass.
