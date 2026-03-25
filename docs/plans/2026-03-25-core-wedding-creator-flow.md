# InviteHub Core Wedding Creator Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the mobile wedding builder from placeholders into a usable creator flow with editable fields, persistent local draft state, and a working preview.

**Architecture:** Keep the scope inside `apps/mobile` and `packages/shared`. Reuse the shared payload types, extend local draft helpers for field updates, and bind each builder step to the same persisted draft source in AsyncStorage. Use the preview screen as the first real rendering surface for the creator flow.

**Tech Stack:** Expo Router, React Native, AsyncStorage, TypeScript, shared payload package

---

### Task 1: Add pure draft update helpers

**Files:**
- Modify: `packages/shared/src/types/invitation.ts`
- Modify: `packages/shared/src/types/invitation.test.ts`

**Steps:**
1. Add failing tests for updating title, venue, and wedding names inside a draft payload.
2. Implement minimal pure helper functions that return updated payload objects.
3. Run shared tests to verify they pass.

### Task 2: Expand mobile draft persistence API

**Files:**
- Modify: `apps/mobile/lib/drafts.ts`
- Modify: `apps/mobile/hooks/useInvitationDraft.ts`

**Steps:**
1. Wire the shared update helpers into the mobile draft hook.
2. Add field-level update methods for basics, people, location, and accounts.
3. Persist every update to AsyncStorage.

### Task 3: Replace placeholder builder steps with editable forms

**Files:**
- Modify: `apps/mobile/app/builder/step1-basic.tsx`
- Modify: `apps/mobile/app/builder/step2-people.tsx`
- Modify: `apps/mobile/app/builder/step4-accounts.tsx`
- Modify: `apps/mobile/app/builder/step5-location.tsx`

**Steps:**
1. Replace placeholder copy with real `TextInput` fields.
2. Bind fields to the shared draft hook.
3. Keep navigation intact.

### Task 4: Turn preview into a real draft preview

**Files:**
- Modify: `apps/mobile/app/builder/preview.tsx`

**Steps:**
1. Read the current draft through the hook.
2. Render the actual title, names, date, venue, and message.
3. Keep the preview minimal but truthful to the saved draft.

### Task 5: Verify the slice

**Files:**
- No new files required

**Steps:**
1. Run `npm run test:shared`.
2. Run `npm --prefix apps/mobile run typecheck`.
3. Run `npm run typecheck`.
