# InviteHub Bootstrap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create the initial monorepo-safe bootstrap for InviteHub with a shared package foundation and an Expo iOS app scaffold, without breaking the current web app.

**Architecture:** Keep the current Next.js app operational at the repo root for now, add workspace scaffolding around it, and introduce `apps/mobile` plus `packages/shared` as the first migration step. Defer the full `apps/web` move until the shared package and mobile scaffold are stable.

**Tech Stack:** Next.js, TypeScript, Vitest, Expo, React Native, npm workspaces

---

### Task 1: Add workspace root structure

**Files:**
- Modify: `package.json`
- Create: `package-workspaces-note` in README update

**Steps:**
1. Add npm workspaces to the root package.
2. Preserve current web scripts so existing verification still works.
3. Add bootstrap scripts for shared and mobile checks.

### Task 2: Create shared package foundation

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/invitation.ts`
- Create: `packages/shared/src/constants/colors.ts`
- Create: `packages/shared/src/constants/index.ts`
- Create: `packages/shared/src/types/invitation.test.ts`

**Steps:**
1. Write failing tests for the shared invitation payload shape.
2. Add minimal shared type/constants implementation.
3. Run tests to confirm the package works in isolation.

### Task 3: Scaffold Expo app without network-dependent generation

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/index.tsx`
- Create: `apps/mobile/app/(tabs)/my-invitations.tsx`
- Create: `apps/mobile/app/(tabs)/mypage.tsx`
- Create: `apps/mobile/app/login.tsx`
- Create: `apps/mobile/components/ui/*` minimal placeholders

**Steps:**
1. Add a minimal Expo Router app structure aligned with the PRD.
2. Keep UI intentionally simple but production-shaped.
3. Reference the shared package from the app config/type layer.

### Task 4: Wire low-risk shared adoption into the current web app

**Files:**
- Modify: `tsconfig.json`
- Modify: current web code only where aliasing shared types is low-risk

**Steps:**
1. Add path aliases for the shared package.
2. Re-export or consume shared constants/types in one small area.
3. Avoid broad refactors or moving the entire web app in this slice.

### Task 5: Verify bootstrap slice

**Files:**
- No new product files; run checks

**Steps:**
1. Run shared tests.
2. Run current root typecheck/lint/test if still valid.
3. Document what remains for the full app build-out.
