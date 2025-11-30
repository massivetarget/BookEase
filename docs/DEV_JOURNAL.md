# Developer Journal

## Date: November 30, 2025
**Topic**: Google Sheets Integration Debugging & Data Integrity

### 🎯 Objectives
The main goal for today was to stabilize the Google Sheets Import functionality, specifically addressing:
1.  **Duplicate Entries**: Preventing the app from re-importing entries that already exist.
2.  **CSV Parsing Errors**: Fixing the "Account not found" error caused by commas inside quoted fields (e.g., "Company, Inc.").
3.  **UI Refresh**: Ensuring the Journal screen updates immediately after an import.
4.  **Data Reset**: Providing a way for the user to wipe local data and start fresh.

### 🛠️ Key Changes & Implementations

#### 1. Robust CSV Parsing (`BackupService.ts`)
*   **Problem**: Simple `split(',')` or regex was failing on fields containing commas or escaped quotes.
*   **Solution**: Implemented a character-by-character state machine parser.
    *   It tracks `inQuote` state to correctly preserve commas within fields.
    *   It handles escaped quotes (`""`) correctly.
*   **Result**: Complex account names and descriptions are now parsed 100% accurately.

#### 2. Enhanced Duplicate Detection
*   **Logic**: The import function now checks the database before adding an entry.
*   **Criteria**: An entry is considered a duplicate if a record exists with the same:
    *   `Date` (normalized to YYYY-MM-DD)
    *   `Description`
    *   `Reference`
*   **Outcome**: Re-running the import on an existing database now correctly skips all previously imported entries.

#### 3. Date Parsing Improvements
*   **Issue**: Google Sheets can export dates in various formats depending on locale (`YYYY-MM-DD` vs `DD/MM/YYYY`).
*   **Fix**: Added logic to detect and parse both formats. If `Date.parse()` fails, it manually splits the string and reconstructs the date object.

#### 4. "Reset All Data" Feature
*   **Files**: `Database.native.ts`, `settings.tsx`
*   **Implementation**: Added a `clearDatabaseData` function that:
    *   Deletes all rows from `journal_lines` and `journal_entries`.
    *   Resets all `accounts` balances to 0.
*   **UI**: Added a red "Reset All Data" button in the Settings screen.
*   **Use Case**: Allows the user to fix a corrupted/duplicate-filled database by resetting and doing a clean import.

#### 5. UI Auto-Refresh (`useJournalViewModel.ts`)
*   **Change**: Switched from `useEffect` to `useFocusEffect` (from `expo-router`).
*   **Benefit**: The journal list now re-fetches data every time the user navigates back to the Journal tab (e.g., after finishing an import in Settings).

### 🐛 Challenges & Fixes
*   **Syntax Errors**: During the session, partial edits to `BackupService.ts` led to missing braces and syntax errors.
*   **Fix**: Performed a complete rewrite of `BackupService.ts` to restore code integrity and ensure all methods (`signIn`, `backup`, `restore`, `export`, `import`) were correctly defined.

### 📚 Documentation
*   Created `docs/GOOGLE_SHEETS_INTEGRATION.md`: A technical reference guide explaining the internal logic of the backup and import/export systems.

### ✅ Final Status
The app successfully imports data from Google Sheets without duplicates. The user verified the fix by resetting the data and performing a clean import.
