# Milestone: Google Drive Backup & Restore Implementation

**Date:** November 30, 2025
**Status:** Completed & Verified

## Objective
Implement a robust backup and restore functionality for the BookEase application using Google Drive, ensuring users can safely back up their SQLite database and restore it across devices.

## Key Features Implemented
1.  **Google Sign-In**: Integrated `@react-native-google-signin/google-signin` for secure user authentication.
2.  **Backup**: Uploads the local SQLite database (`bookease.db`) to the user's Google Drive (App Data folder or Drive root depending on scope).
3.  **Restore**: Searches for the backup file, downloads it, and replaces the local database safely.
4.  **Export to Sheets**: Exports all journal entries and lines to a Google Sheet in the user's Drive for easy reporting and analysis.
5.  **Import from Sheets**: Imports journal entries from the latest Google Sheet export, intelligently grouping lines and skipping duplicates.
6.  **Error Handling**: Provides specific error messages to the user (e.g., API not enabled, Network error).

## Technical Challenges & Solutions

### 1. `expo-file-system` API Compatibility
*   **Issue**: The project aimed to use the modern `expo-file-system` API (object-oriented `File` and `Directory` classes). However, `FileSystem.documentDirectory` was returning `undefined` when imported from the main package in the current version context, leading to invalid path construction.
*   **Solution**: Adopted a hybrid approach:
    *   Imported `documentDirectory` from `expo-file-system/legacy` to guarantee a valid path string.
    *   Used the new `File` and `Directory` classes from `expo-file-system` for actual file operations, ensuring forward compatibility.

### 2. Android URI Handling (`java.lang.IllegalArgumentException`)
*   **Issue**: Android's Java `File` constructor is strict about URI formats.
    *   Passing `file:///path` caused "URI has an authority component" errors in some contexts.
    *   Passing `/path` (no scheme) caused "URI is not absolute" errors.
*   **Solution**: By correctly obtaining the `legacyDocumentDirectory` (which returns a valid `file:///data/...` string) and passing it to the `Directory` constructor, the `expo-file-system` wrapper handled the path parsing correctly without manual string manipulation hacks.

### 3. Google Drive API Permissions
*   **Issue**: Initial attempts failed with `403 Forbidden` because the Google Drive API was not enabled in the Google Cloud Console for the project.
*   **Solution**: Identified the specific error message from the API response and advised enabling the API. The code was updated to propagate these specific error messages to the UI Alert system.

## Code Architecture
*   **`core/services/BackupService.ts`**:
    *   **`backupDatabase()`**: Checks for local DB -> Authenticates -> Checks/Creates Drive File -> Uploads Content.
    *   **`restoreDatabase()`**: Authenticates -> Searches Drive File -> Downloads -> Closes Local DB -> Overwrites File.
*   **`core/database/Database.native.ts`**: Added `closeDatabase()` to safely release the SQLite connection before a restore operation to prevent file locking.

## Verification
*   **Backup**: Verified successful upload to Google Drive.
*   **Restore**: Verified successful download and replacement of the local database.
*   **UI**: Verified "Success" alerts and error handling on the Android device.

## Future Recommendations
*   **Cloud Console**: Ensure any new developers or production environments have the Google Drive API enabled in their respective Google Cloud Projects.
*   **Scopes**: Currently using `https://www.googleapis.com/auth/drive.file`. This is good practice as it only grants access to files created by the app.
