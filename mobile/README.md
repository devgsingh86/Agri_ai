# AgriAI Mobile App

React Native mobile application for the AgriAI farming assistant platform.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| Yarn or npm | latest | bundled with Node |
| React Native CLI | latest | `npm install -g @react-native-community/cli` |
| Xcode (iOS) | ≥ 14 | Mac App Store |
| Android Studio (Android) | latest | https://developer.android.com/studio |
| CocoaPods (iOS) | ≥ 1.12 | `sudo gem install cocoapods` |

---

## Quick Start

### 1. Clone & install

```bash
# From the Agri_ai root
cd mobile
npm install         # or: yarn install
```

### 2. iOS Setup

```bash
cd ios && pod install && cd ..
```

### 3. Start Metro bundler

```bash
npm start           # or: yarn start
```

### 4. Run on device / simulator

```bash
# iOS (separate terminal)
npm run ios

# Android (separate terminal, emulator must be running)
npm run android
```

---

## Backend Connection

The app connects to the backend at:

```
http://localhost:3000/api/v1
```

Configured in `src/services/api.ts` — change `BASE_URL` to point at staging / production when needed.

### Starting the backend

```bash
cd ../backend
cp .env.example .env   # fill in DB credentials
npm install
npm run migrate
npm run dev            # starts on port 3000
```

---

## Project Structure

```
mobile/
├── App.tsx                         # Root component (Redux + Nav providers)
├── index.js                        # RN entry point
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── src/
    ├── types/
    │   └── index.ts                # All shared TypeScript interfaces
    ├── store/
    │   ├── index.ts                # Redux configureStore
    │   ├── authSlice.ts            # JWT + user state
    │   └── onboardingSlice.ts      # Wizard step state
    ├── services/
    │   └── api.ts                  # RTK Query endpoints (all API calls)
    ├── hooks/
    │   ├── useAuth.ts              # login / register / logout / restoreToken
    │   └── useRedux.ts             # Typed useAppDispatch / useAppSelector
    ├── utils/
    │   └── validation.ts           # Yup schemas for all forms
    ├── navigation/
    │   └── index.tsx               # RootNavigator, Auth/Onboarding/App stacks
    ├── components/
    │   ├── ProgressIndicator.tsx   # Step X of 5 dot track
    │   ├── StepNavigation.tsx      # Back / Next buttons
    │   └── CropSelector.tsx        # Searchable multi-select crop picker
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx
        │   └── RegisterScreen.tsx
        ├── onboarding/
        │   ├── WelcomeScreen.tsx   # Checks server for resume progress
        │   ├── PersonalInfoScreen.tsx
        │   ├── FarmSizeScreen.tsx
        │   ├── CropSelectionScreen.tsx
        │   ├── LocationScreen.tsx
        │   ├── ExperienceScreen.tsx
        │   └── ReviewScreen.tsx    # Submits profile → Dashboard
        └── app/
            ├── DashboardScreen.tsx
            └── ProfileScreen.tsx
```

---

## Onboarding Flow

```
Welcome ──► PersonalInfo ──► FarmSize ──► CropSelection ──► Location ──► Experience ──► Review ──► Dashboard
  Step 0       Step 1          Step 2         Step 3           Step 4       Step 5
```

- **Auto-save**: After each step, `POST /api/v1/profile/progress` stores current state on the server.
- **Resume**: `WelcomeScreen` calls `GET /api/v1/profile/progress` on mount and resumes from the saved step.
- **Review → Submit**: Calls `POST /api/v1/profile` with the complete assembled payload.

---

## Navigation Logic

The `RootNavigator` follows this decision tree on every render:

```
Token in Keychain?
├── No  → AuthStack  (Login / Register)
└── Yes → Fetch profile
          ├── Error / 404 → OnboardingStack
          └── Profile exists → AppStack (Dashboard + Profile tabs)
```

---

## Key Libraries

| Library | Purpose |
|---------|---------|
| `@reduxjs/toolkit` + `react-redux` | Global state + RTK Query API layer |
| `react-hook-form` + `yup` | Form validation |
| `@react-navigation/native` | Screen navigation |
| `react-native-keychain` | Secure JWT storage |
| `react-native-geolocation-service` | GPS coordinates |
| `@react-native-async-storage/async-storage` | Misc local persistence |

---

## Available Scripts

```bash
npm run android         # Run on Android
npm run ios             # Run on iOS
npm start               # Start Metro bundler
npm test                # Run Jest tests
npm run lint            # ESLint check
npm run type-check      # TypeScript type check (tsc --noEmit)
```

---

## Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

## iOS Permissions

Add to `ios/AgriAI/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>AgriAI needs your location to provide accurate farm recommendations.</string>
```

---

## Environment Variables

Currently hardcoded to `http://localhost:3000/api/v1` for local development.

For production, update `BASE_URL` in `src/services/api.ts` or introduce a build-time env mechanism (e.g., `react-native-config`).

---

## Troubleshooting

**Metro bundler won't start**
```bash
npm start -- --reset-cache
```

**iOS build fails with CocoaPods error**
```bash
cd ios && pod deintegrate && pod install && cd ..
```

**Android — `JAVA_HOME` not set**
```bash
export JAVA_HOME=$(/usr/libexec/java_home)
```

**GPS not working in iOS simulator**  
Use Simulator → Features → Location → Custom Location to set a test coordinate.
