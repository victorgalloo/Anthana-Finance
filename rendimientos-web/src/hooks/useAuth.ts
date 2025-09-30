import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';
import { UserService } from '../services/userService';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    if (!auth) {
      // Si Firebase no está configurado, simular usuario demo
      setAuthState({
        user: null,
        loading: false,
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Crear o actualizar usuario en Firestore cuando se autentica
        try {
          await UserService.createOrUpdateUser(user.uid, {
            email: user.email || '',
            displayName: user.displayName || undefined,
          });
        } catch (error) {
          console.warn('Error actualizando usuario en Firestore:', error);
        }
      }

      setAuthState({
        user,
        loading: false,
      });
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      return { success: false, error: 'Firebase no está configurado. Configura las variables de entorno.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email: string, password: string) => {
    if (!auth) {
      return { success: false, error: 'Firebase no está configurado. Configura las variables de entorno.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (!auth) {
      return { success: false, error: 'Firebase no está configurado.' };
    }

    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
  };
}
