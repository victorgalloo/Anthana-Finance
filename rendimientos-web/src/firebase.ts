import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: mostrar configuración
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✓ Configurada' : '✗ No configurada',
  authDomain: firebaseConfig.authDomain ? '✓ Configurada' : '✗ No configurada',
  projectId: firebaseConfig.projectId ? '✓ Configurada' : '✗ No configurada',
  storageBucket: firebaseConfig.storageBucket ? '✓ Configurada' : '✗ No configurada',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Configurada' : '✗ No configurada',
  appId: firebaseConfig.appId ? '✓ Configurada' : '✗ No configurada',
});

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
}

export { auth, db, storage };
export default app;
