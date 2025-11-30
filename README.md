# BookEase 📚

**Privacy-First Double-Entry Bookkeeping Application**

A cross-platform accounting app built with React Native, Expo, and Realm. Features local-first data storage, full double-entry accounting, and works on mobile, desktop, and web.

---

## 🚀 Quick Start

### Fastest Way to Run (Desktop)
```bash
npm install
npm run web          # Terminal 1
npm run electron:dev # Terminal 2
```

### For Mobile Development
```bash
npm install
npx expo run:android  # or run:ios
```

---

## 🎉 Project Status: Code Complete!

**📄 [READ THE FINAL SUMMARY](./FINAL_SUMMARY.md)** - Complete project overview and next steps

---

## 📖 Documentation

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview, features, architecture, and data models
- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)** - Detailed setup, build, and troubleshooting guide

---

## ✨ Features

### ✅ Implemented (Phase 1 & 2)
- **Double-Entry Accounting** with real-time validation
- **Chart of Accounts** with 40+ pre-configured accounts
- **Journal Entry Management** (Draft & Posted)
- **Dashboard** with balance sheet summary
- **Cross-Platform**: Android, iOS, Windows, macOS, Linux
- **Local-First**: All data stored on device with Realm
- **Automatic Balance Updates** when entries are posted
- **Google Drive Encrypted Backups** (New in v1.1.0)
- **Google Sheets Import/Export** (New in v1.1.0)

### 🚧 Coming Soon (Phase 3+)
- Reports & Analytics (General Ledger, Trial Balance, P&L, Balance Sheet)
- PDF Export
- P2P Device Sync
- Dark Mode
- PIN/Biometric Authentication

---

## 🛠️ Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **Database**: Realm 12.0.0
- **Navigation**: expo-router (file-based)
- **Desktop**: Electron 39.2+
- **Icons**: @expo/vector-icons

---

## 📱 Supported Platforms

| Platform | Status | Method |
|----------|--------|--------|
| Android | ✅ | Custom Dev Client / EAS Build |
| iOS | ✅ | Custom Dev Client / EAS Build |
| Windows | ✅ | Electron |
| macOS | ✅ | Electron |
| Linux | ✅ | Electron |
| Web | ⚠️ | View-only (Realm not supported) |

---

## 🎯 Core Screens

1. **Dashboard** - Balance sheet summary and quick stats
2. **Chart of Accounts** - Full CRUD with search and filtering
3. **Journal Entry** - Multi-line entries with double-entry validation
4. **Reports** - Placeholder for Phase 2
5. **Settings** - Placeholder for Phase 2

---

## 🔒 Privacy Features

- ✅ **100% Local Data** - No cloud required for core operations
- ✅ **Offline-First** - Works without internet
- ✅ **Encrypted Database** - Realm supports encryption
- 🔜 **Encrypted Backups** - Optional Google Drive backups (Phase 3)
- 🔜 **P2P Sync** - Direct device-to-device sync (Phase 3)

---

## 📊 Sample Workflow

### Recording a Sale
1. Go to **Journal** tab
2. Tap **+** to create new entry
3. Add lines:
   - **Debit**: Cash $500
   - **Credit**: Sales Revenue $500
4. Verify balance indicator is green ✓
5. Tap **Post Entry**
6. Check **Dashboard** - Assets increased by $500

---

## 🧪 Testing

### First Run Test
1. Start the app
2. Navigate to **Accounts** - Should see 40+ accounts
3. Go to **Journal** - Create a test entry
4. Check **Dashboard** - Balances should update

### Sample Test Entry
- **Description**: "Initial Capital"
- **Line 1**: Debit Cash $10,000
- **Line 2**: Credit Owner's Equity $10,000
- **Result**: Assets = Equity = $10,000

---

## 📦 Installation

```bash
# Clone or navigate to project
cd d:\Project\BookEase

# Install dependencies
npm install

# Run on desktop (easiest)
npm run web          # Terminal 1
npm run electron:dev # Terminal 2

# Or run on mobile
npx expo run:android
```

For detailed instructions, see **[INSTRUCTIONS.md](./INSTRUCTIONS.md)**

---

## 🐛 Troubleshooting

### "Missing Realm constructor" Error
❌ **Don't use standard Expo Go** - Realm requires native modules  
✅ **Use Custom Dev Client** or **Electron**

### Quick Fix
```bash
# Clear cache and restart
npx expo start --clear
```

For more help, see **[INSTRUCTIONS.md](./INSTRUCTIONS.md)** → Troubleshooting section

---

## 📁 Project Structure

```
BookEase/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   └── (tabs)/            # Tab screens
├── src/
│   ├── models/            # Realm schemas
│   └── utils/             # Helper functions
├── electron/              # Desktop app
├── docs/                  # Planning docs
├── PROJECT_SUMMARY.md     # Full project details
├── INSTRUCTIONS.md        # Setup & run guide
└── README.md             # This file
```

---

## 🎓 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Realm Documentation](https://www.mongodb.com/docs/realm/)
- [expo-router Guide](https://expo.github.io/router/docs/)
- [Double-Entry Accounting](https://en.wikipedia.org/wiki/Double-entry_bookkeeping)

---

## 📄 License

Apache-2.0

---

## 🙏 Acknowledgments

Built with:
- React Native & Expo team
- Realm (MongoDB)
- Antigravity AI Agent

---

## 📞 Support

- **Full Documentation**: See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- **Setup Guide**: See [INSTRUCTIONS.md](./INSTRUCTIONS.md)
- **Issues**: Check Troubleshooting section in INSTRUCTIONS.md

---

**Version**: 1.1.0 (Phase 2 Complete)  
**Last Updated**: November 30, 2025  
**Status**: ✅ Production Ready for Core Features & Cloud Backup

---

## 🎯 Next Steps

1. **Read** [INSTRUCTIONS.md](./INSTRUCTIONS.md) for setup
2. **Run** the app using Quick Start above
3. **Test** with sample transactions
4. **Explore** the Chart of Accounts
5. **Create** your first journal entry!

Happy Bookkeeping! 📊
