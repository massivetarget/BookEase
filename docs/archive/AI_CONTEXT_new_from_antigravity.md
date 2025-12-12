# AI Context - BookEase

> [!IMPORTANT]
> This file serves as the **Source of Truth** for the project context. It supersedes contradicting information in other documentation files (e.g., references to Realm).

## 🎯 Project Identity
**Name**: BookEase
**Type**: Personal Finance / Small Business Bookkeeping Application
**Core Philosophy**:
1.  **Privacy-First**: User data stays on the device.
2.  **Offline-First**: Zero dependency on internet connectivity for core features.
3.  **Standard Compliance**: Basic **Double-Entry Accounting** principles (Debits = Credits).

## 🛠️ Technology Stack (Verified)
| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Core Framework** | React Native | 0.76+ (Expo SDK 54) | |
| **Mobile Runtime** | Expo Go / Dev Client | SDK 54 | |
| **Desktop Runtime** | Electron | 39.2+ | Wraps the Web build |
| **Storage (Native)**| **expo-sqlite** | ~16.0.9 | **Replaced Realm** |
| **Storage (Web)** | Mock / In-Memory | N/A | For demo/dev purposes |
| **Language** | TypeScript | 5.x | Strict Mode |
| **Navigation** | expo-router | 6.x | File-based routing |
| **Styling** | NativeWind / CSS | Mixed | Moving to NativeWind (Goal) |

> [!WARNING]
> **Realm is REMOVED.** Do not import `realm` or `@realm/react`. Use `expo-sqlite`.

## 🏗️ Architecture

### Pattern: Clean Architecture + Repository Pattern
The app is strictly layered to allow swapping data sources (which we just did from Realm to SQLite).

1.  **UI Layer (`app/`)**: React Native components. NEVER access the database directly. Uses `ServiceContext`.
2.  **Service Layer (`core/services/`)**: Business logic. injected with repositories.
3.  **Repository Layer (`core/repositories/`)**:
    *   **Interfaces**: `IAccountRepository`, `IJournalRepository`.
    *   **Implementation**: `SQLite*Repository` (Native) and `Mock*Repository` (Web).
4.  **Data Layer (`core/database/`)**: Raw DB connection setup.

### Data Model (Double-Entry)
*   **JournalEntry**: The parent transaction (Date, Description, Status).
*   **JournalLine**: The splits (Account, Debit, Credit).
*   **Account**: The bucket (Assets, Liabilities, etc.).
*   **Validation**: `Sum(Debits)` MUST EQUAL `Sum(Credits)` before `Posted` status is allowed.

## 🚦 Current State & Roadmap

### ✅ Completed (Phase 1)
*   [x] Core Data Models (Account, JournalEntry).
*   [x] CRUD for Accounts & Journals.
*   [x] Migration from Realm to **Expo SQLite**.
*   [x] basic Dashboard UI.

### 🚧 In Progress (Phase 2 - Build & Fix)
*   [ ] **Android Build**: Fixing Gradle/JDK issues to run on physical device.
*   [ ] **Google Drive Backup**: `@react-native-google-signin` installed, need to wire up `BackupService`.
*   [ ] **Theme Persistence**: `AsyncStorage` for theme settings.

### 📅 Planned (Phase 3)
*   [ ] Advanced Reporting (PDF, Charts).
*   [ ] P2P Sync (Researching).

## 📝 Coding Standards
*   **Files**: PascalCase for Components (`accountList.tsx`), camelCase for utilities.
*   **Imports**: Absolute imports where possible (or consistent relative).
*   **Error Handling**: UI should never crash. Use Error Boundaries.
*   **Async**: All DB operations are async.

## 📍 Key Directories
*   `d:\Project\BookEase\app`: UI Screens.
*   `d:\Project\BookEase\core`: Logic & Data.
*   `d:\Project\BookEase\assets`: Static files.
