# Implementation Plan - Web Persistence

## Goal
Replace the temporary `MockAccountRepository` and `MockJournalRepository` (in-memory) with **persistent** implementations for Web and Desktop (Electron).
This fulfills the user's request to "remove mockrepo" while maintaining the "Persistence" capability stated in `AI_CONTEXT.md`.

## Proposed Changes

### 1. Create Web Repositories
We will implement the repository interfaces using `localStorage` (or a simple wrapper) to persist data.

#### [NEW] [WebAccountRepository.ts](file:///d:/Project/BookEase/core/repositories/web/WebAccountRepository.ts)
- Implements `IAccountRepository`.
- Loads data from `localStorage.getItem('accounts')` on init.
- Saves to `localStorage` on every change.
- Simulates async to match interface.

#### [NEW] [WebJournalRepository.ts](file:///d:/Project/BookEase/core/repositories/web/WebJournalRepository.ts)
- Implements `IJournalRepository`.
- Loads/Saves to `localStorage.getItem('journal_entries')`.

### 2. Update Application Entry
Modify `app/_layout.tsx` to use the new Web repositories instead of Mock ones.

#### [MODIFY] [app/_layout.tsx](file:///d:/Project/BookEase/app/_layout.tsx)
- Import `WebAccountRepository`, `WebJournalRepository`.
- Replace `new MockAccountRepository()` with `new WebAccountRepository()`.

### 3. Cleanup
#### [DELETE] `core/repositories/mock/`
- Remove the mock implementation directory entirely.

## Verification Plan

### Manual Verification (Web/Desktop)
1.  **Start Web**: `npm run web`.
2.  **Create Data**: Add an Account (e.g., "Test Bank") and a Journal Entry.
3.  **Reload**: Refresh the browser page.
4.  **Verify**: Ensure "Test Bank" and the Journal Entry still exist (proving persistence).
5.  **Check Console**: Ensure no errors regarding missing generic "Mock" classes.
