# Mill Calc

Mobile-first PWA for steel rolling mills in Mandi Gobindgarh. Three calculators (Yield, Breakeven, Power) with real-time math, offline support, and Firestore logging.

## Quick start
1) Install deps
```bash
npm install
```
2) Start dev server (uses inline Vite config to avoid loader hiccups)
```bash
npm run dev
```
3) Production build
```bash
npm run build
```
4) Preview built app
```bash
npm run preview
```

## Environment
Copy `.env.example` to `.env` and fill your Firebase project values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Firebase setup
1. Create a Firebase project and a Firestore database (production mode).
2. Enable **Authentication** → **Sign-in method** → turn on **Anonymous** and **Google** providers.
3. Deploy security rules
```bash
firebase deploy --only firestore:rules
```
(Uses `firestore.rules` in repo.)

## Deploy to Firebase Hosting
```bash
firebase login
firebase init hosting   # pick existing project, set build folder to dist
npm run build
firebase deploy --only hosting
```

## PWA
- Vite + `vite-plugin-pwa` with `generateSW`
- Manifest at `public/manifest.webmanifest`
- Cache-first for static assets, network-first for Firestore calls

## Stack
React 18, Vite, Tailwind CSS, React Router v6, Zustand, Firebase v10, vite-plugin-pwa.
# Mill-Calculators
