# Android Build Failure Report

## Issue
The Android build failed with the error:
```
Error resolving plugin [id: 'com.facebook.react.settings']
> 25.0.1
```

## Root Cause
You are using **JDK 25** (`OpenJDK 25.0.1`).
React Native (Expo SDK 54) and Gradle **do not support Java 25** yet.
The maximum supported version is typically **Java 17** (or sometimes 21, but 17 is recommended).

## Solution
1.  **Uninstall** "OpenJDK 25" or "Eclipse Adoptium 25".
2.  **Install JDK 17**.
    *   Recommended: [Microsoft OpenJDK 17](https://learn.microsoft.com/en-us/java/openjdk/download)
    *   Or: [Eclipse Adoptium (Temurin) 17](https://adoptium.net/temurin/releases/?version=17)
3.  After installing, please tell me the new path (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17...`).
