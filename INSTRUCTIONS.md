# BookEase - Setup & Run Instructions

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the App](#running-the-app)
4. [Building for Production](#building-for-production)
5. [Troubleshooting](#troubleshooting)
6. [Development Tips](#development-tips)

---

## 🔧 Prerequisites

### Required Software

#### For All Platforms
- **Node.js**: Version 18.x or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`
- **npm**: Version 9.x or higher (comes with Node.js)
  - Verify: `npm --version`
- **Git**: For version control
  - Download: https://git-scm.com/

#### For Mobile Development (Optional)
- **Expo Go App** (for testing only - limited functionality)
  - iOS: https://apps.apple.com/app/expo-go/id982107779
  - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

#### For Android Development
- **Android Studio** (for building custom dev client)
  - Download: https://developer.android.com/studio
  - Or use **EAS Build** (cloud builds, no local install needed)

#### For iOS Development
- **macOS** with **Xcode** (required for local iOS builds)
  - Download Xcode from Mac App Store
  - Or use **EAS Build** (cloud builds)

#### For Desktop Development
- **Electron** is already included in dependencies
- No additional software needed

---

## 📦 Installation

### Step 1: Clone or Navigate to Project
```bash
cd d:\Project\BookEase
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Expo SDK 54
- Realm 12.0.0
- expo-router
- Electron
- TypeScript
- All UI dependencies

### Step 3: Verify Installation
```bash
npm list expo realm
```

You should see:
- `expo@54.x.x`
- `realm@12.0.0`

---

## 🚀 Running the App

### ⚠️ Important Note
**This app uses Realm (native module) and CANNOT run in standard Expo Go.**

You have 3 options:
1. **Custom Dev Client** (Recommended for development)
2. **EAS Build** (Cloud builds)
3. **Desktop (Electron)** (Easiest for quick testing)

---

### Option 1: Custom Dev Client (Mobile)

#### First Time Setup

**For Android:**
```bash
# Build the custom dev client
npx expo prebuild
npx expo run:android
```

**For iOS (requires Mac):**
```bash
# Build the custom dev client
npx expo prebuild
npx expo run:ios
```

This creates a custom version of Expo Go with Realm included.

#### Subsequent Runs
Once the dev client is installed on your device:

```bash
# Start the development server
npm start
```

Then:
1. Open the custom dev client app on your device
2. Scan the QR code or enter the URL
3. The app will load with hot reload enabled

---

### Option 2: EAS Build (Cloud Builds)

#### Setup EAS
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account (create one if needed)
eas login

# Configure the project
eas build:configure
```

#### Build for Android
```bash
# Development build (for testing)
eas build --profile development --platform android

# Production build (for release)
eas build --profile production --platform android
```

#### Build for iOS
```bash
# Development build (for testing)
eas build --profile development --platform ios

# Production build (for release)
eas build --profile production --platform ios
```

The builds will be available in your Expo dashboard.

---

### Option 3: Desktop (Electron) - Easiest!

#### Development Mode
```bash
# Terminal 1: Start Expo web server
npm run web

# Terminal 2: Start Electron (in a new terminal)
npm run electron:dev
```

The app will open in an Electron window with hot reload.

#### Production Mode
```bash
# Build the web bundle first
npx expo export -p web

# Run Electron in production mode
npm run electron
```

---

### Option 4: Web Browser (Limited)

⚠️ **Note**: Realm doesn't work in browsers, so this is view-only mode.

```bash
npm run web
```

Open http://localhost:8081 in your browser.

---

## 🏗️ Building for Production

### Android APK/AAB

#### Using EAS (Recommended)
```bash
# Build APK (for direct install)
eas build --profile production --platform android

# Build AAB (for Google Play Store)
eas build --profile production --platform android --output aab
```

#### Local Build
```bash
# Build APK locally
npx expo run:android --variant release
```

The APK will be in `android/app/build/outputs/apk/release/`

---

### iOS IPA

#### Using EAS (Recommended)
```bash
# Build for App Store
eas build --profile production --platform ios

# Build for Ad Hoc distribution
eas build --profile preview --platform ios
```

#### Local Build (requires Mac + Xcode)
```bash
# Build IPA locally
npx expo run:ios --configuration Release
```

---

### Desktop Builds

#### Windows
```bash
# Install electron-builder
npm install --save-dev electron-builder

# Build for Windows
npx electron-builder --win
```

Output: `dist/BookEase Setup.exe`

#### macOS
```bash
# Build for macOS (requires Mac)
npx electron-builder --mac
```

Output: `dist/BookEase.dmg`

#### Linux
```bash
# Build for Linux
npx electron-builder --linux
```

Output: `dist/BookEase.AppImage`

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Missing Realm constructor" Error
**Problem**: Trying to run in standard Expo Go  
**Solution**: Use Custom Dev Client or Electron instead

```bash
# Build custom dev client
npx expo run:android
# or
npx expo run:ios
```

#### 2. "expo-router not found" Error
**Problem**: Dependencies not installed correctly  
**Solution**: Reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

#### 3. Metro Bundler Cache Issues
**Problem**: Old cached files causing errors  
**Solution**: Clear cache

```bash
npx expo start --clear
```

#### 4. Android Build Fails
**Problem**: Gradle or SDK issues  
**Solution**: 

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npx expo run:android
```

#### 5. iOS Build Fails (Mac only)
**Problem**: CocoaPods or Xcode issues  
**Solution**:

```bash
# Clean iOS build
cd ios
pod deintegrate
pod install
cd ..

# Rebuild
npx expo run:ios
```

#### 6. Electron Window Blank
**Problem**: Web server not running  
**Solution**: Start web server first

```bash
# Terminal 1
npm run web

# Terminal 2 (wait for web server to start)
npm run electron:dev
```

#### 7. TypeScript Errors
**Problem**: Type checking issues  
**Solution**: Check tsconfig.json

```bash
# Verify TypeScript
npx tsc --noEmit
```

---

## 💡 Development Tips

### Hot Reload
- **Mobile**: Shake device → "Reload"
- **Desktop**: Ctrl+R (Windows/Linux) or Cmd+R (Mac)
- **Auto**: Changes auto-reload in dev mode

### Debugging

#### React Native Debugger
```bash
# Install React Native Debugger
# Download from: https://github.com/jhen0409/react-native-debugger

# Enable in app
# Shake device → "Debug Remote JS"
```

#### Chrome DevTools (for Web/Electron)
- Press F12 in Electron window
- Or right-click → "Inspect Element"

#### Realm Studio (Database Viewer)
```bash
# Install Realm Studio
# Download from: https://www.mongodb.com/docs/realm/studio/

# Open database file
# Location: Device storage / App data / default.realm
```

### Viewing Logs

#### Mobile
```bash
# Android logs
npx react-native log-android

# iOS logs (Mac only)
npx react-native log-ios
```

#### Electron
- Logs appear in the terminal where you ran `npm run electron:dev`

---

## 📱 Testing the App

### First Run Checklist

1. **Start the app** (using any method above)
2. **Dashboard loads** - You should see:
   - Balance Sheet Summary (all zeros initially)
   - Quick Stats showing account counts
3. **Navigate to Accounts tab**
   - Should see 40+ pre-seeded accounts
   - Try searching for "Cash"
   - Try filtering by "Asset"
4. **Create a Journal Entry**
   - Navigate to Journal tab
   - Tap the + button
   - Add a simple entry:
     - Date: Today
     - Description: "Test Entry"
     - Line 1: Debit Cash $100
     - Line 2: Credit Owner's Equity $100
   - Verify balance indicator turns green
   - Post the entry
5. **Check Dashboard**
   - Total Assets should now show $100
   - Total Equity should show $100
6. **View Account Balance**
   - Go to Accounts tab
   - Find "Cash on Hand" (code 1101)
   - Balance should show $100

### Sample Transactions to Test

#### 1. Record a Sale
- Debit: Cash $500
- Credit: Sales Revenue $500

#### 2. Pay Rent
- Debit: Rent Expense $1000
- Credit: Cash $1000

#### 3. Purchase Equipment
- Debit: Equipment $5000
- Credit: Cash $2000
- Credit: Loan Payable $3000

---

## 🔄 Updating Dependencies

### Check for Updates
```bash
npm outdated
```

### Update Expo SDK
```bash
npx expo install --fix
```

### Update All Dependencies
```bash
npm update
```

⚠️ **Warning**: Test thoroughly after updates, especially Realm and Expo versions.

---

## 📊 Performance Optimization

### For Production Builds

1. **Enable Hermes** (JavaScript engine)
   - Already enabled in Expo SDK 54+

2. **Optimize Images**
   ```bash
   # Install optimization tools
   npm install --save-dev @expo/image-utils
   ```

3. **Enable Realm Encryption** (add to app/_layout.tsx)
   ```typescript
   <RealmProvider
     schema={schemas}
     encryptionKey={getEncryptionKey()} // Add your key generation
   >
   ```

4. **Reduce Bundle Size**
   ```bash
   # Analyze bundle
   npx expo export --dump-sourcemap
   ```

---

## 🆘 Getting Help

### Resources
- **Expo Docs**: https://docs.expo.dev/
- **Realm Docs**: https://www.mongodb.com/docs/realm/
- **expo-router Docs**: https://expo.github.io/router/docs/
- **React Native Docs**: https://reactnative.dev/

### Common Commands Reference

```bash
# Development
npm start                    # Start dev server
npm run android             # Run on Android
npm run ios                 # Run on iOS (Mac only)
npm run web                 # Run in browser
npm run electron:dev        # Run Electron desktop

# Building
npx expo prebuild           # Generate native folders
eas build --platform android # Cloud build for Android
eas build --platform ios    # Cloud build for iOS

# Maintenance
npm install                 # Install dependencies
npx expo install --fix      # Fix dependency versions
npx expo start --clear      # Clear cache
```

---

## ✅ Quick Start (TL;DR)

**Fastest way to test the app:**

```bash
# 1. Install dependencies
npm install

# 2. Start web server
npm run web

# 3. In another terminal, start Electron
npm run electron:dev
```

The app will open in a desktop window. No mobile setup needed!

---

**Last Updated**: November 26, 2025  
**Version**: 1.0.0  

For questions or issues, refer to the Troubleshooting section above.
