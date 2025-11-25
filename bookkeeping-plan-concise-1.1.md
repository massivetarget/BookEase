
# BookEase: Privacy-First Bookkeeping App - Concise Blueprint

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
| DB Size | Yearly clean; compact for bookkeeping.

## Next Steps
1. Run setup.
2. Code login → dashboard.
3. Test Realm schema.
4. Add transactions → sync → backups.
5. Enhance: ML, multi-currency.

**Date:** Nov 25, 2025 | **Ver:** 1.1 (Concise) | **Notes:** Living doc; server-free, full privacy. Start with `expo start`!

> Written with [StackEdit](https://stackedit.io/).