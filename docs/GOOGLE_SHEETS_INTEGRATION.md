# Google Drive & Sheets Integration Reference

This document summarizes the technical implementation and user workflows for the Google Drive Backup and Google Sheets Integration features in BookEase.

## 1. Google Drive Backup & Restore

### Overview
Allows users to backup their entire SQLite database (`bookease.db`) to their personal Google Drive and restore it later.

### Technical Implementation
*   **Service**: `BackupService.ts`
*   **Auth**: Uses `@react-native-google-signin/google-signin` with `https://www.googleapis.com/auth/drive.file` scope.
*   **File Handling**: Uses `expo-file-system` (legacy `documentDirectory`) to access the SQLite database file.
*   **API**: Google Drive API v3.

### Workflows
*   **Backup**:
    1.  Checks if `bookease.db` exists locally.
    2.  Searches Drive for an existing file named `bookease.db`.
    3.  If found, updates the file content (`PATCH`).
    4.  If not found, creates a new file metadata and uploads content (`POST` + `PATCH`).
*   **Restore**:
    1.  Searches Drive for `bookease.db`.
    2.  Downloads the file content as a blob.
    3.  Closes the active database connection.
    4.  Overwrites the local `bookease.db` file with the downloaded content.

## 2. Export to Google Sheets

### Overview
Exports all journal entries and their associated lines to a Google Sheet for reporting and external analysis.

### Technical Implementation
*   **Query**: Joins `journal_entries`, `journal_lines`, and `accounts` tables.
*   **Format**: CSV string with headers: `Date, Entry Description, Reference, Status, Account, Line Description, Debit, Credit`.
*   **Escaping**: Handles commas and quotes within fields by wrapping them in double quotes (e.g., `"My, Description"`).
*   **Upload**: Uploads the CSV content with MIME type `application/vnd.google-apps.spreadsheet`, which triggers Google Drive to automatically convert it into a native Google Sheet.

## 3. Import from Google Sheets

### Overview
Imports journal entries from the latest "BookEase Export" Google Sheet back into the application.

### Technical Implementation
1.  **File Search**: Finds the most recent file in Drive named "BookEase Export".
2.  **Download**: Exports the Google Sheet as a CSV (`mimeType=text/csv`).
3.  **Parsing**:
    *   **CSV Parser**: Custom character-by-character parser to correctly handle quoted fields and escaped quotes.
    *   **Date Parsing**: Robust logic to handle ISO strings, `YYYY-MM-DD`, and `DD/MM/YYYY` formats.
    *   **Account Mapping**: Matches CSV account names to local Account IDs (case-insensitive, trimmed).
4.  **Duplicate Detection**:
    *   Checks for existing entries matching **Date (YYYY-MM-DD)** + **Description** + **Reference**.
    *   Skips duplicates to prevent data corruption.
5.  **Data Integrity**:
    *   Groups rows by Entry (Date + Description + Reference).
    *   Validates that accounts exist before creating lines.

## 4. Data Management (Reset)

### Overview
A "Reset All Data" feature was added to allow users to clear their local database without uninstalling the app.

### Technical Implementation
*   **Function**: `clearDatabaseData` in `Database.native.ts`.
*   **Action**:
    *   `DELETE FROM journal_lines`
    *   `DELETE FROM journal_entries`
    *   `UPDATE accounts SET balance = 0`
*   **Usage**: Useful for clearing duplicate data before performing a clean import.

## Future Considerations
*   **Web Support**: Currently, these features are disabled on Web due to `expo-file-system` and `expo-sqlite` limitations.
*   **Background Sync**: Future updates could implement background synchronization.
