# BookEase - Privacy-First Bookkeeping Application

## 📋 Project Summary

**BookEase** is a cross-platform, privacy-first bookkeeping application built with React Native, Expo, and **SQLite**. It implements full **Double-Entry Accounting** principles with local-first data storage, no cloud dependency for core operations, and optional encrypted backups.

### 🎯 Key Features

#### ✅ **Implemented (Phase 1)**
- **Double-Entry Bookkeeping System**
  - Chart of Accounts with 40+ pre-configured accounts
  - Journal Entry management with real-time validation
  - Automatic account balance updates
  - Draft and Posted entry statuses
  - Audit logging for all changes

- **Complete UI Implementation**
  - Dashboard with balance sheet summary
  - Chart of Accounts (Full CRUD operations)
  - Journal Entry screen with multi-line support
  - Reports placeholder
  - Settings placeholder

- **Data Models**
  - `Account`: Chart of Accounts with hierarchy support
  - `JournalEntry`: Complete journal entries with status tracking
  - `JournalLine`: Individual debit/credit lines
  - `AuditLog`: Change tracking for compliance

- **Cross-Platform Support**
  - Mobile: Android & iOS (React Native + Expo)
  - Desktop: Windows, macOS, Linux (Electron)
  - Web: View-only mode (React Native Web) with Mock Data

#### 🚧 **Planned (Future Phases)**
- **Phase 2**: Reports & Analytics
  - General Ledger
  - Trial Balance
  - Income Statement (P&L)
  - Balance Sheet
  - Interactive charts with Victory Native
  - PDF export

- **Phase 3**: Sync & Backup
  - 🚧 Peer-to-Peer device sync (Bluetooth/Wi-Fi)
  - ✅ Google Drive encrypted backups (Implemented, pending config)
  - Conflict resolution

- **Phase 4**: Polish & Features
  - Dark mode
  - PIN/Biometric authentication
  - Multi-user support
  - Data import/export (CSV, Excel)

---

## 🏗️ Technical Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React Native + Expo | SDK 54 |
| **Language** | TypeScript | 5.1+ |
| **Database** | expo-sqlite | 16.0+ |
| **Navigation** | expo-router | 6.0+ |
| **Desktop** | Electron | 39.2+ |
| **State Management** | React Context + Hooks | - |
| **Icons** | @expo/vector-icons | Latest |

### Project Structure

```
BookEase/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout (Service Provider)
│   └── (tabs)/                  # Tab navigation
│       ├── _layout.tsx          # Tabs layout
│       ├── index.tsx            # Dashboard
│       ├── accounts.tsx         # Chart of Accounts
│       ├── journal.tsx          # Journal Entry
│       ├── reports.tsx          # Reports (placeholder)
│       └── settings.tsx         # Settings (placeholder)
├── core/                         # Core Business Logic
│   ├── database/                # Database connection & setup
│   ├── interfaces/              # Repository Interfaces
│   ├── repositories/            # Data Access Layer
│   │   ├── sqlite/              # Native SQLite implementation
│   │   └── mock/                # Web Mock implementation
│   └── services/                # Service Context & Logic
├── models/                       # TypeScript Data Models
│   ├── index.ts
│   └── ...
├── electron/                    # Electron desktop app
│   ├── main.js                 # Main process
│   └── preload.js              # Preload script
├── docs/                       # Planning documents
├── assets/                     # Images, fonts
├── package.json
├── tsconfig.json
├── app.json                    # Expo configuration
└── index.js                    # Entry point
```

---

## 📊 Data Model (Double-Entry Accounting)

### Account Schema (SQLite Table: `accounts`)
```typescript
{
  id: string,                // UUID
  code: string,              // e.g., "1101"
  name: string,              // e.g., "Cash on Hand"
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense',
  subtype?: string,          // e.g., "Current Asset"
  balance: number,           // Cached balance
  isActive: boolean,         // 0 or 1 in DB
  createdAt: Date,           // ISO String in DB
  updatedAt: Date            // ISO String in DB
}
```

### JournalEntry Schema (SQLite Table: `journal_entries`)
```typescript
{
  id: string,                // UUID
  date: Date,                // ISO String in DB
  description: string,
  reference?: string,        // Invoice #, Receipt #
  status: 'Draft' | 'Posted',
  createdAt: Date,
  updatedAt: Date
}
```

### JournalLine Schema (SQLite Table: `journal_lines`)
```typescript
{
  id: string,                // UUID
  entryId: string,           // FK to journal_entries
  accountId: string,         // FK to accounts
  debit: number,            // 0 if credit
  credit: number,           // 0 if debit
  description?: string,
  createdAt: Date
}
```

### Accounting Rules Implemented

1. **Double-Entry Validation**: `sum(debits) === sum(credits)` enforced before posting
2. **Account Balance Updates**:
   - **Assets & Expenses**: Debit increases, Credit decreases
   - **Liabilities, Equity & Income**: Credit increases, Debit decreases
3. **Minimum Requirements**: Each entry must have at least 2 lines
4. **Status Control**: Only "Posted" entries affect account balances

---

## 🎨 UI/UX Features

### Dashboard
- Real-time balance sheet summary
- Total Assets, Liabilities, Equity calculation
- Net Worth display with color coding
- Quick statistics (account counts, entry counts)
- Professional card-based layout

### Chart of Accounts
- **Search**: Filter by code or name
- **Filter**: By account type (Asset, Liability, etc.)
- **CRUD Operations**: Add, Edit, Toggle Active/Inactive
- **Color Coding**: 
  - 🟢 Green: Assets
  - 🔴 Red: Liabilities
  - 🟣 Purple: Equity
  - 🔵 Blue: Income
  - 🟠 Orange: Expenses
- **Real-time Balance**: Shows current balance for each account

### Journal Entry
- **Multi-line Entry**: Add/remove lines dynamically
- **Account Picker**: Searchable dropdown for account selection
- **Real-time Validation**: 
  - Green checkmark when balanced
  - Red alert when unbalanced
  - Live debit/credit totals
- **Dual Save Options**:
  - Save as Draft (no balance update)
  - Post Entry (updates account balances)
- **Entry Details**: View posted/draft entries with full line breakdown

---

## 🔒 Privacy & Security Features

### Current Implementation
- ✅ **Local-First**: All data stored on device using SQLite
- ✅ **No Cloud Dependency**: Core operations work 100% offline
- ✅ **Clean Architecture**: Repository pattern allows for easy security upgrades

### Planned Features
- 🔜 PIN/Biometric authentication
- 🔜 Encrypted backups to Google Drive
- 🔜 P2P sync with encryption
- 🔜 Multi-user with separate PINs

---

## 📦 Default Chart of Accounts

The app auto-seeds with 40+ accounts on first run:

| Code Range | Category | Examples |
|------------|----------|----------|
| **1000-1999** | Assets | Cash, Bank, Receivables, Inventory, Equipment |
| **2000-2999** | Liabilities | Payables, Credit Cards, Loans, Sales Tax |
| **3000-3999** | Equity | Owner's Equity, Retained Earnings |
| **4000-4999** | Income | Sales Revenue, Service Revenue |
| **5000-5999** | Expenses | COGS, Rent, Salaries, Utilities, Marketing |

Users can add custom accounts as needed.

---

## 🚀 Performance & Scalability

- **Database**: SQLite is robust, standard, and highly performant for local data.
- **Offline-First**: No network latency for core operations.
- **Optimized Queries**: Direct SQL queries for efficient data retrieval.
- **Scalability**: Suitable for small to medium businesses.

---

## 🛠️ Development Workflow

### Custom Dev Client Required
⚠️ **Important**: This app uses `expo-sqlite` (native module), so it **cannot** run in standard Expo Go.

You must use:
1. **Expo Dev Client** (custom build)
2. **EAS Build** (cloud builds)
3. **Local builds** with `expo run:android` or `expo run:ios`

### Supported Platforms
- ✅ Android (via Expo Dev Client or EAS)
- ✅ iOS (via Expo Dev Client or EAS, requires Mac for local builds)
- ✅ Web (View-only mode with Mock Data)
- ✅ Windows Desktop (via Electron)
- ✅ macOS Desktop (via Electron)
- ✅ Linux Desktop (via Electron)

---

## 📝 Code Quality

### TypeScript
- Full TypeScript implementation
- Type-safe Interfaces
- Strict mode enabled

### Architecture Patterns
- **Clean Architecture**: Separation of concerns (UI, Core, Data)
- **Repository Pattern**: Abstracted data access
- **Service Provider**: Dependency injection for services
- **Component-based**: Reusable UI components
- **File-based routing**: expo-router for navigation

---

## 🎯 Use Cases

### Target Users
- Small business owners
- Freelancers
- Personal finance tracking
- Accountants needing offline tools
- Privacy-conscious users

### Example Workflows

1. **Recording a Sale**:
   - Create journal entry
   - Debit: Cash (Asset)
   - Credit: Sales Revenue (Income)
   - Post entry → Cash balance increases

2. **Paying Rent**:
   - Create journal entry
   - Debit: Rent Expense (Expense)
   - Credit: Cash (Asset)
   - Post entry → Cash decreases, Expense increases

3. **Purchasing Equipment**:
   - Create journal entry
   - Debit: Equipment (Asset)
   - Credit: Cash (Asset) or Loan Payable (Liability)
   - Post entry → Asset composition changes

---

## 🔮 Future Enhancements

### Short-term (Phase 2)
- General Ledger with filtering
- Trial Balance report
- Income Statement (P&L)
- Balance Sheet
- Charts and visualizations
- PDF export

### Medium-term (Phase 3)
- P2P device sync
- Google Drive integration
- Conflict resolution
- Data import/export (CSV, Excel)

### Long-term (Phase 4)
- Multi-currency support
- Invoice generation
- Receipt scanning (OCR)
- ML-based fraud detection
- Tax report generation
- Multi-company support

---

## 📄 License

Apache-2.0

---

## 👥 Contributors

Built with Antigravity AI Agent

---

## 📞 Support

For issues or questions, refer to the `INSTRUCTIONS.md` file for setup and troubleshooting.

---

**Last Updated**: November 29, 2025  
**Version**: 1.1.0 (Phase 1 Complete - SQLite Migration)  
**Status**: ✅ Production Ready for Core Features
