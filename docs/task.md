# Tasks

- [x] **Context Restoration** <!-- id: 0 -->
    - [x] Analyze current codebase state (Dependencies, Architecture) <!-- id: 1 -->
    - [x] Create `AI_CONTEXT.md` <!-- id: 2 -->
    - [x] Check `main` branch for existing context file (Not found) <!-- id: 6 -->
    - [x] Check `origin/main` branch (Not found) <!-- id: 7 -->
    - [x] Update `task.md` with backlog items found in other docs <!-- id: 3 -->
- [x] **Remove Mock Repository** <!-- id: 8 -->
    - [x] Implement `WebAccountRepository` (Persistent) <!-- id: 9 -->
    - [x] Implement `WebJournalRepository` (Persistent) <!-- id: 10 -->
    - [x] Update `app/_layout.tsx` to use Web repositories <!-- id: 11 -->
    - [x] Delete `core/repositories/mock` directory <!-- id: 12 -->
- [x] **Fix Android Build Environment** <!-- id: 4 -->
    - [x] Locate Android SDK (`AppData/Local/Android/Sdk`) <!-- id: 13 -->
    - [x] Create `android/local.properties` <!-- id: 14 -->
    - [x] Install JDK 17 (**Fixed**: User provided path) <!-- id: 15 -->
    - [x] Set `JAVA_HOME` environment variable (Temporary) <!-- id: 16 -->
    - [x] Run `npx expo-doctor` to verify (**Verified via Build**) <!-- id: 5 -->
- [x] **Build & Run** <!-- id: 17 -->
    - [x] Run `npx expo run:android` (**Success**) <!-- id: 18 -->
- [x] **Theme Refactoring & Journal Fixes** <!-- id: 19 -->
    - [x] Implement `useTheme` in `journal.tsx`, `accounts.tsx`, `index.tsx`, `reports.tsx` <!-- id: 20 -->
    - [x] Fix "Description is required" error in Simple Mode <!-- id: 21 -->
    - [x] Fix Account Picker (FlashList visibility) <!-- id: 22 -->
    - [x] Resolve all TypeScript errors (FlashList, Ionicons) <!-- id: 23 -->

# Next Steps (Tomorrow)
- [ ] **Google Drive Backup**: Verify and debug backup/restore functionality.
- [ ] **Reports Implementation**: Build out the actual charts and data for Reports screen.
- [ ] **Unit Testing**: Add tests for ViewModels and Repositories.
- [ ] **Cleanup**: Archive `INSTRUCTIONS.md` and move `sync.config.js` to `legacy_sync_code/`.
