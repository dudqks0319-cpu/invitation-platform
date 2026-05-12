# Command Results

Date: 2026-05-13
Branch: codex/invitation-review-fixes
Head: 56ecdbd Document invitation mobile QA audit plan

## Automated Verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Pass | 70 files / 208 tests passed. |
| `npm run lint` | Pass | ESLint exited 0. |
| `npm run typecheck` | Pass | `next build --webpack >/dev/null && tsc --noEmit` exited 0. |
| `npm run lint --workspace @invitehub/mobile` | Pass | Mobile ESLint exited 0. |
| `npm run typecheck --workspace @invitehub/mobile` | Pass | Mobile `tsc --noEmit` exited 0. |
| `npx expo install --check` | Pass | Online check: `Dependencies are up to date`. Offline pre-check also used local dependency map and found dependencies up to date. |
| `npx expo-doctor --verbose` | Watch | 17/18 checks passed. Only failure is the known non-CNG config sync warning for native folders plus app config fields. |
| `npm audit --omit=dev --audit-level=high` | Pass | High threshold exits 0. Remaining report is 4 moderate `postcss <8.5.10` vulnerabilities through Expo; `npm audit fix --force` would install `expo@49.0.23`, a breaking downgrade. |
| `git diff --check` | Pass | No whitespace errors. |

## Known Structural Caveats

- Expo Doctor may report the existing non-CNG config sync warning because native `ios/` and `android/` folders exist with app config fields.
- Expo transitive `postcss` moderate advisory may remain if fixing it would force an Expo downgrade.

## Notes

- Vitest prints a non-fatal `--localstorage-file` warning in some suites.
- `npm audit` first failed under sandboxed DNS, then passed with approved network access.
