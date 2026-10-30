import config from '../website-config';

import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export interface FirebaseModules {
  auth: typeof import('firebase/auth');
  firestore: typeof import('firebase/firestore');
  authInstance: Auth;
  db: Firestore;
}

let loading: Promise<FirebaseModules> | null = null;

// Firebase is loaded lazily in the browser only, so SSR never touches it.
// Shared by every component on the page so the SDK initializes once.
export const loadFirebase = (): Promise<FirebaseModules> => {
  loading = loading ?? (async () => {
    const [{ initializeApp, getApps }, auth, firestore] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    const { apiKey, authDomain, projectId, appId } = config.firebase!;
    const app = getApps()[0] ?? initializeApp({ apiKey, authDomain, projectId, appId });
    return { auth, firestore, authInstance: auth.getAuth(app), db: firestore.getFirestore(app) };
  })();
  loading.catch(() => {
    loading = null;
  });
  return loading;
};

// "/kv-cache/" -> "kv-cache"; Firestore doc ids cannot contain "/".
export const postKey = (slug: string) => slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '__') || 'index';
