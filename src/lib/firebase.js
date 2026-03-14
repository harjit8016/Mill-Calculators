import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const hasEnv = Boolean(apiKey && apiKey !== 'undefined' && apiKey !== 'null');

const firebaseConfig = hasEnv
  ? {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    }
  : null;

let app = null;
let db = null;
let auth = null;
let analyticsPromise = Promise.resolve(null);

if (hasEnv && firebaseConfig) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  analyticsPromise =
    typeof window !== 'undefined' && firebaseConfig.measurementId
      ? isSupported().then((ok) => (ok ? getAnalytics(app) : null))
      : Promise.resolve(null);
} else {
  console.warn('Firebase env vars missing; running in local-only mode. Add keys in .env to enable sync.');
}

export { app, db, auth, analyticsPromise };

const noAuthUser = { uid: 'local-demo-user' };

export const ensureAnonymousUser = async () => {
  if (!auth) return noAuthUser;
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
};

export const watchAuth = (cb) => (auth ? onAuthStateChanged(auth, cb) : () => {});

export const signInWithGoogle = async () => {
  if (!auth) return noAuthUser;
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  return user;
};

const withCommonFields = (data, userId) => ({
  ...data,
  userId,
  timestamp: Date.now(),
  createdAt: serverTimestamp(),
});

const noDb = async () => null;

export const saveYieldLog = async (data) => {
  if (!data?.userId) return null;
  if (!db) return noDb();
  return addDoc(collection(db, 'yield_logs'), withCommonFields(data, data.userId));
};

export const saveBreakevenLog = async (data) => {
  if (!data?.userId) return null;
  if (!db) return noDb();
  return addDoc(collection(db, 'breakeven_logs'), withCommonFields(data, data.userId));
};

export const savePowerLog = async (data) => {
  if (!data?.userId) return null;
  if (!db) return noDb();
  return addDoc(collection(db, 'power_logs'), withCommonFields(data, data.userId));
};

export const getRecentLogs = async (collectionName, userId, limitCount = 5) => {
  if (!userId || !db) return [];
  try {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('fetch logs error', err);
    return [];
  }
};
