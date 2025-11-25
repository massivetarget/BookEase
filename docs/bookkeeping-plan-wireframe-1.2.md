# BookEase: Privacy-First Bookkeeping App - Concise Blueprint (w/ Wireframes)

## Overview
**BookEase** is a cross-platform bookkeeping app emphasizing **privacy**: local storage, no cloud for ops, P2P sync, encrypted backups. Targets small biz/personal use; future ML for fraud detection.

**Goals:** Native on Android/iOS/Mac/Windows; offline-first; pro UI (reports, charts, audits).

**Status:** Blueprint ready. Next: Init project.

## Tech Stack
| Component | Choice | Why |
|-----------|--------|-----|
| Framework | React Native + Expo + TS | Cross-platform; type-safe; easy builds (no heavy SDKs). |
| DB | Realm | Local/object-oriented; fast; encrypted; ML-ready. |
| Auth | Expo SecureStore + Biometrics/PIN | Local-only. |
| Sync | P2P (QR/Bluetooth) | Encrypted JSON exchange; auto-merge (latest wins). |
| Backup | Encrypted ZIP to Google Drive | Expo + Google Signin; manual/auto. |
| UI Libs | Recharts (charts); expo-print (PDF); Expo Appearance (themes) | Pro reports; accessibility. |

**Setup:**
```bash
npx create-react-native-app BookEase --template typescript
cd BookEase && expo start  # QR test via Expo Go
```

## Features
1. **Login:** PIN/biometrics; guest mode (read-only).
2. **Dashboard:** Balance; daily flow; quick-add.
3. **Transactions:** Add/edit/delete (debit red/credit green); fields: amount, date, category, note, type.
   - Realm schema: `class Transaction { amount: number; date: Date; category: string; note: string; type: 'debit'|'credit'; }`
4. **Reports:** P&L charts; date picker; PDF export. Future ML: Fraud alerts via TensorFlow.js.
5. **Audit Log:** Track changes `{action, itemId, user, timestamp}`.
6. **Settings:** Theme toggle; backup/restore; device pairing.
7. **Pro Touches:** Logo ("BookEase"); persistent balance; accessibility; multi-user PINs.

## Sync & Flow
- **Local:** Realm for offline CRUD.
- **Process:** Connect devices → Export encrypted JSON → Transfer → Import/merge (timestamp-based conflicts).
- **Web:** View-only via Expo web (IndexedDB; no edits).

## Backup
- Export: Realm → PIN-encrypted ZIP.
- Upload: To Drive (auto optional); name `backup-[UUID].zip`.
- Restore: File pick + PIN; merge/overwrite.

## Challenges & Fixes
| Issue | Fix |
|-------|-----|
| iOS/Mac Builds | Expo cloud; Xcode only for App Store. |
| Heavy Tools | Expo skips Android Studio; use Expo Go. |
| Sync Conflicts | Auto-latest; manual review. |
| ML | Direct Realm to TF.js. |
| DB Size | Yearly clean; compact for bookkeeping. |

## Wireframes
Simple ASCII wireframes for key screens (mobile portrait view). These are low-fidelity sketches; in code, use React Native components (e.g., View, Text, TouchableOpacity).

### 1. Login Screen
```
+---------------------------+
|        BookEase           |
|                           |
|     [Biometric Icon]      |
|                           |
|   Enter 6-Digit PIN       |
|   _ _ _ _ _ _              |
|                           |
|   [Guest Mode Button]     |
|                           |
|   [Forgot PIN?]           |
+---------------------------+
```
- Top: Logo. Center: PIN input or biometrics prompt. Bottom: Guest/Reset links.

### 2. Dashboard
```
+---------------------------+
| BookEase     Balance: $1k |
|                           |
| Today's Flow: +$200       |
| [Green Up Arrow]          |
|                           |
| [Quick Add Button]        |
| + New Transaction         |
|                           |
| Recent:                   |
| - Grocery: -$50 (Red)     |
| + Salary: +$2k (Green)    |
|                           |
| [Menu: Transactions|Reps] |
+---------------------------+
```
- Header: Logo + Balance. Metrics: Flow with icon. CTA: Quick add. List: Last 3 txns. Nav: Bottom tabs.

### 3. Transactions List
```
+---------------------------+
| Transactions              |
| [Filter: All|Debit|Credit]|
|                           |
| Date     Amt   Cat  Note  |
| 11/25    -$50  Food Grocery|
| [Red Icon] [Edit] [Del]   |
| 11/24    +$2k  Inc  Salary |
| [Green Icon][Edit][Del]   |
| ... (Scrollable)          |
|                           |
| [+ Add New]               |
+---------------------------+
```
- Search/Filter bar. Table-like list (use FlatList). Swipe for edit/delete. Icons for type.

### 4. Reports Screen
```
+---------------------------+
| Reports                   |
| [Date Picker: Nov 2025]   |
|                           |
| P&L Chart:                |
| [Bar Chart Placeholder]   |
| Expenses: $500 | Income:  |
| $2.5k | Profit: +$2k      |
|                           |
| [Export PDF Button]       |
|                           |
| Audit Log:                |
| - 11/25: Added txn #123   |
| ...                       |
+---------------------------+
```
- Picker: Date range. Chart: Recharts bar/line. Summary metrics. Export CTA. Log: Scrollable list.

### 5. Settings Screen
```
+---------------------------+
| Settings                  |
|                           |
| Theme: [Light|Dark|Auto]  |
|                           |
| Backup: [Create ZIP]      |
| Restore: [Pick File]      |
|                           |
| Sync: [Pair Device QR]    |
|                           |
| Users: [Add PIN User]     |
|                           |
| [Logout]                  |
+---------------------------+
```
- Toggles/Switches for theme. Buttons for backup/sync. List for users.

## Next Steps
1. Run setup.
2. Code login → dashboard.
3. Test Realm schema.
4. Add transactions → sync → backups.
5. Enhance: ML, multi-currency.

**Date:** Nov 25, 2025 | **Ver:** 1.2 (w/ Wireframes) | **Notes:** Living doc; server-free, full privacy. Start with `expo start`!


> Written with [StackEdit](https://stackedit.io/).