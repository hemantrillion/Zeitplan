# 📱 ZEITPLAN — Build Guide

## Before you build — add your assets

Place these files in the `assets/` folder:

| File | What to use |
|---|---|
| `assets/icon.png` | Your ZIETPLAN.png (square) — 1024×1024 px |
| `assets/adaptive-icon.png` | Same as icon.png |
| `assets/splash.png` | Square logo centered on white — 1242×2436 px |
| `assets/splash_logo.png` | Your square logo — 512×512 px is fine |
| `assets/logo_dark.png` | Your BLACK_PLAN.png — 1400×400 |
| `assets/logo_light.png` | Your WHITEPAN.png — 1400×400 |

---

## Step 1 — Install Node.js
Download from https://nodejs.org (LTS version).
Verify: `node --version` (v18+), `npm --version` (v9+)

## Step 2 — Install Expo & EAS CLI
```
npm install -g expo-cli eas-cli
```

## Step 3 — Set up project
```
cd ZeitplanApp
npm install
```

## Step 4 — Test on phone (optional)
Install **Expo Go** from Play Store, then:
```
npm start
```
Scan the QR code.

## Step 5 — Build APK (free)
1. Create free account at https://expo.dev
2. `eas login`
3. `eas build -p android --profile preview`
4. Download the `.apk` link when done (~5–15 min)

## Step 6 — Install on phone
1. Transfer `.apk` to phone
2. Settings → Install unknown apps → allow
3. Tap APK → Install

---

## App structure
```
ZeitplanApp/
├── App.js                        ← Root: 3s splash then main app
├── assets/                       ← Add your logo/icon files here
├── src/
│   ├── context/
│   │   └── ThemeContext.js       ← Dark / Light theme system
│   ├── data/
│   │   └── timetable.js          ← All schedule data
│   ├── screens/
│   │   ├── TimetableScreen.js    ← Main grid
│   │   ├── SummaryScreen.js      ← Attendance stats
│   │   └── SettingsScreen.js     ← Theme toggle (triple-tap logo)
│   └── utils/
│       ├── storage.js            ← AsyncStorage persistence
│       └── attendance.js         ← Stats calculator
```

## Updating schedule
Edit `src/data/timetable.js` → add rows to `SCHEDULE` array → rebuild APK.
