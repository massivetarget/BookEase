# Architecture Decision Records (ADR)

This document records the significant architectural decisions made for BookEase, the context, and the consequences.

## ADR 001: React Native + Expo
*   **Status**: Accepted
*   **Context**: We needed a cross-platform mobile application (Android/iOS) with a fast development cycle.
*   **Decision**: Use React Native with Expo SDK.
*   **Consequences**: 
    *   (+) Rapid development with hot reload.
    *   (+) Access to vast ecosystem of libraries.
    *   (+) Easy OTA updates (potential).
    *   (-) Some native modules require "Prebuild" (Custom Dev Client), which adds complexity compared to standard Expo Go.

## ADR 002: Local-First Data Storage (SQLite)
*   **Status**: Accepted
*   **Context**: The app is a privacy-first bookkeeping tool. Users should own their data, and it must work offline.
*   **Decision**: Use `expo-sqlite` as the primary local database.
*   **Alternatives Considered**: 
    *   *Realm*: Initially used, but faced compatibility issues with standard Expo workflows and Web/Electron environments without complex setups.
    *   *AsyncStorage*: Too simple for relational accounting data.
*   **Consequences**:
    *   (+) Standard SQL queries are powerful and well-understood.
    *   (+) Excellent performance for local datasets.
    *   (+) Easy to backup (single `.db` file).
    *   (-) Requires native build (cannot use Expo Go).

## ADR 003: Double-Entry Accounting Model
*   **Status**: Accepted
*   **Context**: To provide professional-grade accounting, simple income/expense tracking is insufficient.
*   **Decision**: Implement strict Double-Entry Accounting (Debits = Credits).
*   **Consequences**:
    *   (+) Data integrity is guaranteed.
    *   (+) Standard accounting reports (Balance Sheet, P&L) can be generated accurately.
    *   (-) Higher learning curve for users not familiar with accounting.
    *   (-) More complex UI required for entry creation (balancing lines).

## ADR 004: Electron for Desktop
*   **Status**: Accepted
*   **Context**: We wanted to support Desktop (Windows/Mac/Linux) without rewriting the app.
*   **Decision**: Use Electron to wrap the React Native Web build.
*   **Consequences**:
    *   (+) High code reuse (95%+).
    *   (+) Access to native desktop features if needed.
    *   (-) Electron apps can be resource-heavy.
    *   (-) `expo-sqlite` does not work in standard Web/Electron; requires a mock adapter or specific native bindings (currently using Mock/Web adapter for Web view).

## ADR 005: Google Drive for Backups
*   **Status**: Accepted
*   **Context**: Users need a way to backup their data off-device without a proprietary cloud service.
*   **Decision**: Use Google Drive API (App Folder scope).
*   **Consequences**:
    *   (+) User owns the storage.
    *   (+) Free for us (no backend infrastructure).
    *   (+) Secure (we don't see the data, only the user does).
    *   (-) Requires Google Sign-In setup.
