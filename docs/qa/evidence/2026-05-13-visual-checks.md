# Visual QA Evidence

Date: 2026-05-13

## Method

- Local target: `http://127.0.0.1:3000`
- Browser automation: Playwright MCP
- Primary viewports: `360 x 800`, `390 x 844`, `430 x 932`, `768 x 1024`, `1440 x 900`
- Main check: `document.documentElement.scrollWidth <= clientWidth + 1`, key headings and CTA presence, public invitation guest-facing copy

## Route Matrix

| Route | 360 | 390 | 430 | 768 | 1440 | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Pass | Pass | Pass | Sampled | Pass | No global horizontal overflow. Category tabs intentionally scroll inside their own tab rail. Hero and template sections are readable. |
| `/builder` | Pass layout, Watch UX | Pass layout, Watch UX | Sampled | Sampled | Sampled | No global overflow. Builder inputs are still populated with demo values as real input values, which can confuse first-time users. |
| `/preview` | Pass layout, Watch content | Pass layout, Watch content | Sampled | Sampled | Sampled | Preview renders the same `InvitationView` surface as public pages and disables share buttons. It also shows guest-facing optional prompts from demo payload. |
| `/checkout` | Pass layout, Watch direct route | Pass layout, Watch direct route | Sampled | Sampled | Sampled | Terms and privacy links are visible. Direct `/checkout` without `invitationId` leaves the main publish button disabled without a clear recovery action. |
| `/dashboard` | Pass | Pass | Sampled | Pass | Sampled | Empty state, today-to-check section, CSV warning, and disabled CSV button render without global overflow. |
| `/invitations/kim-lee-demo` | Pass layout, Watch guest copy | Pass layout, Watch guest copy | Pass layout, Watch guest copy | Sampled | Sampled | Public invitation opens with RSVP, maps, share, and guestbook. Missing optional data renders "입력해 주세요" / "등록되지 않았습니다." to guests. |
| `/dashboard/invitations/{id}/publish-recovery` | Static reviewed | Static reviewed | Static reviewed | Static reviewed | Static reviewed | No paid invitation fixture was available locally, so this was checked through code and existing tests rather than a live route. |

## Screenshots Captured

- `invitehub-landing-360.png`
- `invitehub-builder-360.png`
- `invitehub-public-360.png`

## Visual Risk Notes

- Horizontal overflow: No global overflow was reproduced on sampled routes and viewports. The landing category rail has off-screen buttons inside an intended scrollable container.
- Text overlap: No obvious overlap was reproduced in the sampled mobile routes.
- CTA visibility: Landing, dashboard, public invitation, and checkout CTAs are visible. Builder CTA meaning remains harder to understand because the initial form appears already filled.
- Preview/public match: Preview and public invitation use the same visual component, which is good for consistency. The remaining mismatch is semantic: preview/demo placeholders can look like real data.
- Guest-facing optional sections: Contact, account, KakaoPay, and location fallback copy currently uses host/editor language on public pages.
- Dashboard action density: Empty-state dashboard is clean on mobile. Rows with real data still need a data-filled mobile QA pass because action density is higher than the empty state.
