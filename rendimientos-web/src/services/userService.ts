import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserData {
  email: string;
  displayName?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserSearchResult {
  uid: string;
  email: string;
  displayName?: string;
}

export class UserService {
  /**
   * Crear o actualizar un usuario en Firestore
   */
  static async createOrUpdateUser(uid: string, userData: Partial<UserData>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      // Filtrar campos undefined para evitar errores en Firestore
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      );

      const dataToSave: any = {
        ...cleanUserData,
        updatedAt: serverTimestamp(),
      };

      // Si el usuario no existe, agregar createdAt
      if (!userDoc.exists()) {
        dataToSave.createdAt = serverTimestamp();
      }

      await setDoc(userRef, dataToSave, { merge: true });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error creando/actualizando usuario:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener datos de un usuario
   */
  static async getUser(uid: string): Promise<{ success: boolean; data?: UserData; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() as UserData };
      } else {
        return { success: false, error: 'Usuario no encontrado' };
      }
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar usuarios por email (autocomplete)
   */
  static async searchUsersByEmail(searchTerm: string): Promise<{ success: boolean; data?: UserSearchResult[]; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    if (!searchTerm || searchTerm.length < 2) {
      return { success: true, data: [] };
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '>=', searchTerm),
        where('email', '<=', searchTerm + '\uf8ff'),
        orderBy('email'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName || undefined,
        };
      });

      return { success: true, data: users };
    } catch (error: any) {
      console.error('Error buscando usuarios:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todos los usuarios (solo admin)
   */
  static async getAllUsers(): Promise<{ success: boolean; data?: UserSearchResult[]; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('email'));

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName || undefined,
        };
      });

      return { success: true, data: users };
    } catch (error: any) {
      console.error('Error obteniendo usuarios:', error);
      return { success: false, error: error.message };
    }
  }
}
