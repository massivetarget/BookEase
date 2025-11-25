# BookEase Plan Review

## Executive Summary
The "BookEase" plan outlines a solid privacy-first bookkeeping application. The core features (Offline-first, Realm, P2P sync) are well-chosen for the "privacy" goal. However, the plan contains **critical technical contradictions** regarding the development workflow (Expo Go vs. Native Modules) that need to be addressed before starting.

## Critical Technical Findings

### 1. Realm & Expo Go Incompatibility
- **Plan Claim:** "Expo avoids Android Studio... use Expo Go for testing."
- **Reality:** **Realm does not work with standard Expo Go.** Realm depends on C++ native modules that are not included in the Expo Go client.
- **Impact:** You **cannot** just run `npx expo start` and scan with the standard Expo Go app.
- **Solution:** You must use **Expo Dev Client** (Custom Development Client).
    - This requires running `npx expo prebuild`.
    - You will need to build a custom "Go-like" app for your device.
    - **Android:** Requires Android Studio or EAS Build (Cloud).
    - **iOS:** Requires Xcode (Mac only) or EAS Build (Cloud). *Note: Installing custom iOS builds requires an Apple Developer Account ($99/yr) or provisioning devices manually.*

### 2. Google Drive Backup & Auth
- **Plan Claim:** Use `@react-native-google-signin/google-signin`.
- **Reality:** This library also requires native code linking, meaning it **will not work in standard Expo Go**.
- **Alternative:** `expo-auth-session` works in Expo Go for authentication, but for robust file management with Google Drive, the native library is superior. This reinforces the need for a **Custom Dev Client**.

### 3. Peer-to-Peer Sync Complexity
- **Plan Claim:** "Devices connect directly... via QR scan or Bluetooth".
- **Reality:** "QR Scan" is not a connection method; it's just a way to share a secret/IP.
    - **Bluetooth:** Requires libraries like `react-native-ble-plx` (Native code required).
    - **Local Network (Wi-Fi):** Requires devices to be on the same Wi-Fi. You'd use `react-native-tcp-socket` or `expo-network` to find IP addresses.
- **Challenge:** True P2P sync is complex to implement from scratch. Handling "Auto-merge conflicts" with just JSON exports is error-prone.
- **Recommendation:** Use **Realm Sync** (Atlas Device Sync) if you want easy sync, but that violates "No server". For pure P2P, sticking to **Local File Export/Import** (AirDrop/Nearby Share) is significantly easier and more reliable than building a custom Bluetooth sync protocol.

## Recommendations

### Option A: Stick to "Pure Expo Go" (Easiest Dev Experience)
If you absolutely want to use Expo Go (no Android Studio/Xcode):
1.  **Database:** Switch from Realm to **`expo-sqlite`**. It works natively in Expo Go.
2.  **Sync:** Drop "Real-time P2P". Use **Manual File Export/Import** (JSON/CSV) via system share sheet (AirDrop, Email, Drive).
3.  **Auth:** Use simple PIN/Biometrics (supported in Expo Go via `expo-local-authentication`).

### Option B: Stick to "Realm + Privacy" (Better App, Harder Setup)
If you want the power of Realm and true background sync:
1.  **Workflow:** Accept that you **cannot use standard Expo Go**.
2.  **Setup:** Initialize with a custom dev client:
    ```bash
    npx create-react-native-app BookEase --template @realm/expo-template
    ```
3.  **Sync:** Start with **Manual Export/Import**. Build Bluetooth/Wi-Fi sync only after the core app works, as it is a heavy engineering task.

## Verdict
The plan is **feasible** but the **"Technology Stack" section regarding Expo Go is incorrect**.

**Recommended Path:** Go with **Option B (Custom Dev Client)** but simplify the Sync.
- Use **Realm** (it's great for this).
- Use **Expo Dev Client**.
- **Phase 1 Sync:** Manual Backup/Restore (Export JSON to file).
- **Phase 2 Sync:** Google Drive integration.
- **Phase 3 Sync:** Direct P2P (if really needed).

## Wireframe & UI/UX Review (Added)

### 1. Charting Library
- **Plan Claim:** "Recharts (charts)".
- **Reality:** **Recharts is designed for React Web**, not React Native. While it can work with heavy polyfilling, it is not optimized for mobile touch interactions and performance.
- **Recommendation:** Use **`victory-native`** or **`react-native-gifted-charts`**. These are built specifically for React Native and offer the "Pro" look and animation support you want.

### 2. Navigation & Structure
- **Wireframe:** Shows a "Menu: Transactions|Reps" at the bottom.
- **Recommendation:** Use **`expo-router`** (file-based routing) with a Bottom Tab layout. This is the modern standard for Expo apps and provides native platform feel out of the box.

### 3. "Guest Mode"
- **Wireframe:** "[Guest Mode Button]" on login.
- **Technical Note:** Ensure "Guest Mode" clearly defines data persistence limits. If Realm is used, guest data still needs to be stored somewhere. Usually, "Guest" just means "No PIN required yet", but data is still saved locally.

### 4. Visual Polish
- **Goal:** "Professional feel... dark mode".
- **Recommendation:** Use a UI library like **`react-native-paper`** or **`tamagui`** to get accessible, high-quality components (Inputs, Cards, Buttons) out of the box, rather than styling everything from scratch. This speeds up the "Pro" feel significantly.

