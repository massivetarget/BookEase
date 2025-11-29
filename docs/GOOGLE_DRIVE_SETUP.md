# Google Drive Backup Setup Guide

This guide will walk you through setting up Google Drive Backup for BookEase.

## Prerequisites
- A Google Account
- The SHA-1 Fingerprint of your app (we found this earlier):
  `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Your App Package Name: `com.anonymous.BookEaseApp`

---

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top left and select **"New Project"**.
3. Name it `BookEase` (or similar) and click **Create**.
4. Select the newly created project.

## Step 2: Enable Google Drive API

1. In the left sidebar, go to **APIs & Services > Library**.
2. Search for **"Google Drive API"**.
3. Click on it and click **Enable**.

## Step 3: Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services > OAuth consent screen**.
2. Select **External** (unless you have a Google Workspace organization) and click **Create**.
3. **App Information**:
   - **App name**: BookEase
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**.
5. **Scopes**:
   - Click **Add or Remove Scopes**.
   - Search for `drive.file` (See, edit, create, and delete only the specific Google Drive files you use with this app).
   - Select `.../auth/drive.file` and click **Update**.
   - Click **Save and Continue**.
6. **Test Users**:
   - Click **Add Users**.
   - Enter your own Google email address (the one you will test with).
   - Click **Add** and then **Save and Continue**.

## Step 4: Create Credentials

You need to create two sets of credentials: one for **Web** (used by the protocol) and one for **Android** (to authorize your specific app).

### A. Create Web Client ID
1. Go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. **Application type**: Select **Web application**.
4. **Name**: `BookEase Web`.
5. **Authorized JavaScript origins**:
   - Add `http://localhost:8081` (for local development).
6. **Authorized redirect URIs**:
   - Add `http://localhost:8081`
   - Add `https://developers.google.com/oauthplayground` (optional, useful for testing).
7. Click **Create**.
8. **Copy the Client ID**. It will look like `123456...apps.googleusercontent.com`.
   - **Save this as your `GOOGLE_WEB_CLIENT_ID`**.

### B. Create Android Client ID
1. Click **+ Create Credentials** > **OAuth client ID**.
2. **Application type**: Select **Android**.
3. **Name**: `BookEase Android`.
4. **Package name**: `com.anonymous.BookEaseApp`
5. **SHA-1 certificate fingerprint**:
   - Paste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
6. Click **Create**.
7. **Copy the Client ID**.
   - **Save this as your `GOOGLE_ANDROID_CLIENT_ID`**.

## Step 5: Update Your Code

1. Open `d:\Project\BookEase\core\services\BackupService.ts`.
2. Replace the placeholder constants at the top of the file with the IDs you just created.

```typescript
// Replace these lines:
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com'; // Leave as is if not testing iOS
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';

// With your actual IDs (example):
const GOOGLE_WEB_CLIENT_ID = '123456789-abcde...apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '123456789-fghij...apps.googleusercontent.com';
```

## Step 6: Test It

1. Restart your Metro bundler (press `r` in the terminal running `npx expo run:android`).
2. Open the **Settings** tab in the app.
3. Click **Sign in with Google**.
4. A Google permission screen should appear.
5. Once signed in, click **Backup Now**.

### Troubleshooting
- **DEVELOPER_ERROR**: Usually means the SHA-1 or Package Name in Google Console doesn't match your app. Double-check Step 4B.
- **Sign in cancelled**: You might have closed the popup or network failed.
