# AI Context & Memory - BookEase

> [!IMPORTANT]
> **Instructions for AI**: Read this file at the start of every session to understand the project state, constraints, and user preferences. This file is the **Source of Truth**.

## 🧠 Project Identity
*   **Name**: BookEase
*   **Type**: Privacy-First Double-Entry Bookkeeping App
*   **Core Philosophy**:
    1.  **Privacy-First**: User data stays on the device.
    2.  **Offline-First**: Zero dependency on internet connectivity.
    3.  **Standard Compliance**: Double-Entry Accounting (Debits = Credits).

## 🛠️ Technology Stack (Verified)
| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Core Framework** | React Native | 0.76+ (Expo SDK 54) | |
| **Mobile Runtime** | Expo Go / Dev Client | SDK 54 | **Must use Custom Dev Client** (Native Modules) |
| **Desktop Runtime** | Electron | 39.2+ | Wraps the Web build |
| **Storage (Native)**| **expo-sqlite** | ~16.0.9 | **Replaced Realm** |
*   **Storage (Web)** | LocalStorage | N/A | **Persistent JSON** (Replaced Mock) |
| **Language** | TypeScript | 5.x | Strict Mode |
| **Navigation** | expo-router | 6.x | File-based routing |
| **Styling** | NativeWind / CSS | Mixed | NativeWind disabled; **Custom ThemeContext** implemented |

## 🏗️ Architecture & Data

### Pattern: Clean Architecture + Repository Pattern
The app is strictly layered to allow swapping data sources.
1.  **UI Layer (`app/`)**: React Native components. NEVER access DB directly. Uses `ServiceContext`.
2.  **Service Layer (`core/services/`)**: Business logic, injected with repositories.
3.  **Repository Layer (`core/repositories/`)**:
    *   **Interfaces**: `IAccountRepository`, `IJournalRepository`.
    *   **Implementation**: `SQLite*Repository` (Native) and `Web*Repository` (Web/Desktop - Persistent).

### Critical Constraints
1.  **Database Duality**:
    *   **Mobile**: Uses `expo-sqlite`. **Cannot run in standard Expo Go**.
    *   **Web/Desktop**: Uses **LocalStorage** (Persistent).
2.  **Build Configuration**:
    *   Desktop build excludes `node_modules` to avoid `fsevents` errors.
    *   Code signing disabled for local Desktop testing.
    *   **Google Auth**: `google-services.json` Project Number MUST match `.env` Client ID prefix.
        *   Debug Keystore SHA-1 must be added to Firebase Console manually. (Found in `android/app/debug.keystore`).

## 🚦 Current State (as of Dec 6, 2025)
*   **Active Branch**: `main`
*   **Version**: v1.2.1
*   **Build Status**:
    *   ✅ **Desktop (Windows)**: Functional (Persistent Data).
    *   ✅ **Web**: Functional (Persistent Data).
    *   ✅ **Android**: **Verified Functional**.
        *   **UI/UX**: Dynamic Theming (Light/Dark) fully implemented.
        *   **Journal**: Simple Mode validation fixed; Account Picker fixed.
    *   ⚠️ **iOS**: Untested.

## 👥 User Preferences & Workflow
*   **Git**: Feature Branch Workflow. Never commit directly to `main`.
*   **files**: PascalCase for Components, camelCase for utils.
*   **Documentation**: Keep `AI_CONTEXT.md` updated as the primary memory.

## 🔜 Backlog & Roadmap
### Phase 1: Fixes & Foundation (Completed)
1.  ✅ **Fix Android Build**: Bundling & Environment resolved.
2.  ✅ **Google Drive Backup**: Implemented via secure `expo-file-system`.
3.  ✅ **Simple Mode**: Simplified interaction for Journal Entries.
4.  ✅ **UI Polish**: Accounts tab buttons fixed, Theming System implemented.
5.  ✅ **Data Persistence**: LocalStorage for Web/Desktop implemented.

### Phase 2: Features
1.  **Reports**: Balance Sheet, P&L, PDF Export.
2.  **Charts**: Visual analytics.

### Phase 3: Future
1.  **Tailwind Migration**: Paused (NativeWind v4 issues).
2.  **P2P Sync**: Researching feasibility.
