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
| **Storage (Web)** | LocalStorage | N/A | **Persistent** (Simulated Async) |
| **Language** | TypeScript | 5.x | Strict Mode |
| **Navigation** | expo-router | 6.x | File-based routing |
| **Styling** | NativeWind / CSS | Mixed | NativeWind disabled due to Desktop build issues |

## 🏗️ Architecture & Data

### Pattern: Clean Architecture + Repository Pattern
The app is strictly layered to allow swapping data sources.
1.  **UI Layer (`app/`)**: React Native components. NEVER access DB directly. Uses `ServiceContext`.
2.  **Service Layer (`core/services/`)**: Business logic, injected with repositories.
3.  **Repository Layer (`core/repositories/`)**:
    *   **Interfaces**: `IAccountRepository`, `IJournalRepository`.
    *   **Implementation**: `SQLite*Repository` (Native) and `Mock*Repository` (Web/Desktop).

### Critical Constraints
1.  **Database Duality**:
    *   **Mobile**: Uses `expo-sqlite`. **Cannot run in standard Expo Go**.
    *   **Web/Desktop**: Currently uses **In-Memory Mock Data** (Non-persistent on reload).
2.  **Build Configuration**:
    *   Desktop build excludes `node_modules` to avoid `fsevents` errors.
    *   Code signing disabled for local Desktop testing.

## 🚦 Current State (as of Dec 5, 2025)
*   **Active Branch**: `feature/tailwind-ui` (Needs Verification) / `main`
*   **Version**: v1.1.0
*   **Build Status**:
    *   ✅ **Desktop (Windows)**: Functional (Mock Data).
    *   ✅ **Web**: Functional (Mock Data).
    *   ✅ **Android**: **Functional** (JDK 17 Configured).
    *   ⚠️ **iOS**: Untested.

## � User Preferences & Workflow
*   **Git**: Feature Branch Workflow. Never commit directly to `main`.
*   **files**: PascalCase for Components, camelCase for utils.
*   **Documentation**: Keep `AI_CONTEXT.md` updated as the primary memory.

## 🔜 Backlog & Roadmap
### Phase 1: Fixes (Current)
1.  **Fix Android Build**: Install JDK 17, Setup `ANDROID_HOME`, Create `local.properties`.
2.  **Google Drive Backup**: Wiring up `BackupService`.

### Phase 2: Features
1.  **Reports**: Balance Sheet, P&L, PDF Export.
2.  **Charts**: Visual analytics.

### Phase 3: Future
1.  **Tailwind Migration**: Paused (NativeWind v4 issues).
2.  **P2P Sync**: Researching feasibility.
