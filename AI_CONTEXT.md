# AI Context & Memory

> **Instructions for AI**: Read this file at the start of every session to understand the project state, constraints, and user preferences.

## 🧠 Project Identity
- **Name**: BookEase
- **Type**: Privacy-First Double-Entry Bookkeeping App
- **Stack**: React Native (Expo SDK 54), TypeScript, SQLite (Local DB), Electron (Desktop).
- **Current Version**: v1.1.0 (Tagged)

## 🚧 Current State (as of Nov 30, 2025)
- **Active Branch**: `feature/desktop-improvements`
- **Stable Branch**: `main` (Last tag: `v1.1.0`)
- **Build Status**:
  - ✅ **Desktop (Windows)**: Working. Built via `npm run build:desktop`.
  - ✅ **Web**: Working (View-only).
  - ⚠️ **Android**: Build environment issues (Gradle/JDK). Requires Android Studio or EAS Build.
  - ⚠️ **iOS**: Untested (Requires Mac).

## ⚙️ Critical Technical Constraints
1.  **Database Duality**:
    - **Mobile**: Uses `expo-sqlite` (Native Module). **Cannot run in Expo Go**. Must use Custom Dev Client.
    - **Web/Desktop**: Uses a **Mock/Web Adapter** (or limited web-SQL if configured). *Note: Verify if SQLite is truly working on Desktop or if it's falling back to mock data.*
2.  **Builds**:
    - Desktop build excludes `node_modules` to avoid `fsevents` errors.
    - Desktop build has code signing disabled for local testing.

## 📝 User Preferences & Workflow
- **Git Workflow**: **Feature Branch Workflow**.
  - Never commit to `main`.
  - Create branches for tasks (e.g., `feature/xyz`, `fix/abc`).
  - Merge via Pull Request (or manual merge after testing).
- **Documentation**:
  - Update `CHANGELOG.md` on version bumps.
  - Update `docs/DEV_JOURNAL.md` for daily progress.
  - Record major decisions in `docs/ARCHITECTURE.md`.
- **Communication**: Prefer clear, step-by-step explanations.

## 📂 Key File Locations
- **Build Config**: `package.json` (scripts & electron-builder config).
- **Database Logic**: `core/database/` and `core/repositories/`.
- **UI Screens**: `app/(tabs)/`.
- **Documentation**: `docs/`.

## 🔜 Backlog / Todo
1.  **Verify Desktop Persistence**: Confirm if data persists on Desktop restart (Electron `localStorage` vs SQLite).
2.  **Fix Android Build**: Resolve Gradle/JDK issues to get a working APK.
3.  **Phase 2 Features**: Reports, Charts, PDF Export.
