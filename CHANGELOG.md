# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-30

### Added
- **Desktop Build Support**: Added `electron-builder` configuration to generate Windows installers (`.exe`) and portable executables.
- **Google Sheets Integration**: 
  - Import journal entries from Google Sheets CSV.
  - Export journal entries to CSV.
  - Robust CSV parsing logic to handle commas and quotes in fields.
- **Google Drive Backup**: 
  - Encrypted backup to Google Drive App Folder.
  - Restore functionality from Google Drive.
- **Data Reset**: Added "Reset All Data" feature in Settings to wipe local database and start fresh.
- **UI Improvements**: 
  - Auto-refresh Journal list on focus.
  - Added loading indicators for backup/restore operations.

### Changed
- **Database**: Migrated from Realm to **Expo SQLite** for better compatibility and performance.
- **Architecture**: Refactored `BackupService` to be more robust and handle edge cases.
- **Documentation**: Updated `README.md`, `INSTRUCTIONS.md`, and `PROJECT_SUMMARY.md` to reflect new features and build processes.

### Fixed
- **Duplicate Imports**: Implemented logic to prevent duplicate journal entries during import.
- **CSV Parsing**: Fixed "Account not found" errors caused by commas in account names (e.g., "Company, Inc.").
- **Build Scripts**: Fixed Windows environment variable issues in build scripts.
- **Desktop Stability**:
  - Fixed blank screen on launch by enforcing relative paths.
  - Fixed `FlashList` crashes by implementing robust ID mapping for IndexedDB.
  - Fixed Accounts screen layout stretching and added Dark Mode support.
  - Implemented `WebAccountRepository` and `WebJournalRepository` using IndexedDB for persistent desktop data.

## [1.0.0] - 2025-11-26

### Added
- **Core Accounting**: 
  - Double-Entry Bookkeeping System.
  - Chart of Accounts with 40+ pre-configured accounts.
  - Journal Entry management (Draft/Posted statuses).
  - Real-time balance validation.
- **UI/UX**:
  - Dashboard with Balance Sheet summary.
  - Account list with search and filtering.
  - Multi-line journal entry form.
  - Professional card-based design.
- **Architecture**:
  - Local-first data storage using Realm (later migrated to SQLite).
  - Clean Architecture with Repository pattern.
  - Expo Router for file-based navigation.
- **Cross-Platform**:
  - Android and iOS support via Expo.
  - Desktop support via Electron.
  - Web view-only mode.

### Security
- **Local-First**: All data stored locally on the device.
- **Privacy**: No cloud dependency for core operations.
