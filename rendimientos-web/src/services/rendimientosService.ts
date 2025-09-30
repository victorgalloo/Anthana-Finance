import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface RendimientoData {
  uid: string;
  periodo: string;
  capital?: number;
  rendimiento_pct?: number;
  rendimiento_mxn?: number;
  balance?: number;
  notas?: string;
  createdAt: any;
  updatedAt?: any;
}

export class RendimientosService {
  /**
   * Crear un nuevo rendimiento (solo admin)
   */
  static async createRendimiento(rendimientoData: Omit<RendimientoData, 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      // Filtrar campos undefined para evitar errores en Firestore
      const cleanData = Object.fromEntries(
        Object.entries(rendimientoData).filter(([_, value]) => value !== undefined)
      );

      const dataToSave = {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'rendimientos'), dataToSave);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creando rendimiento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar un rendimiento (solo admin)
   */
  static async updateRendimiento(docId: string, updateData: Partial<RendimientoData>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      // Filtrar campos undefined para evitar errores en Firestore
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const rendimientoRef = doc(db, 'rendimientos', docId);
      await updateDoc(rendimientoRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando rendimiento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un rendimiento (solo admin)
   */
  static async deleteRendimiento(docId: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      const rendimientoRef = doc(db, 'rendimientos', docId);
      await deleteDoc(rendimientoRef);
      return { success: true };
    } catch (error: any) {
      console.error('Error eliminando rendimiento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener rendimientos de un usuario (el usuario solo ve los suyos)
   */
  static async getRendimientosByUser(uid: string): Promise<{ success: boolean; data?: (RendimientoData & { id: string })[]; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      const rendimientosRef = collection(db, 'rendimientos');
      
      // Temporal: solo filtrar por uid sin ordenamiento hasta que el índice esté listo
      const q = query(
        rendimientosRef, 
        where('uid', '==', uid)
      );
      
      const querySnapshot = await getDocs(q);
      const rendimientos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (RendimientoData & { id: string })[];

      // Ordenar localmente por período (descendente)
      rendimientos.sort((a, b) => b.periodo.localeCompare(a.periodo));

      return { success: true, data: rendimientos };
    } catch (error: any) {
      console.error('Error obteniendo rendimientos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todos los rendimientos (solo admin)
   */
  static async getAllRendimientos(): Promise<{ success: boolean; data?: (RendimientoData & { id: string })[]; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      const rendimientosRef = collection(db, 'rendimientos');
      const q = query(rendimientosRef, orderBy('periodo', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const rendimientos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (RendimientoData & { id: string })[];

      return { success: true, data: rendimientos };
    } catch (error: any) {
      console.error('Error obteniendo todos los rendimientos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar si ya existe un rendimiento para un usuario y período específico
   */
  static async checkRendimientoExists(uid: string, periodo: string, excludeDocId?: string): Promise<{ success: boolean; exists?: boolean; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      const rendimientosRef = collection(db, 'rendimientos');
      const q = query(
        rendimientosRef,
        where('uid', '==', uid),
        where('periodo', '==', periodo)
      );

      const querySnapshot = await getDocs(q);
      
      // Si estamos editando un documento existente, excluirlo de la verificación
      if (excludeDocId) {
        const exists = querySnapshot.docs.some(doc => doc.id !== excludeDocId);
        return { success: true, exists };
      } else {
        const exists = !querySnapshot.empty;
        return { success: true, exists };
      }
    } catch (error: any) {
      console.error('Error verificando rendimiento existente:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener un rendimiento específico
   */
  static async getRendimiento(docId: string): Promise<{ success: boolean; data?: RendimientoData & { id: string }; error?: string }> {
    if (!db) {
      return { success: false, error: 'Firestore no está configurado' };
    }

    try {
      const rendimientoRef = doc(db, 'rendimientos', docId);
      const rendimientoDoc = await getDoc(rendimientoRef);

      if (rendimientoDoc.exists()) {
        return { 
          success: true, 
          data: { id: rendimientoDoc.id, ...rendimientoDoc.data() } as RendimientoData & { id: string }
        };
      } else {
        return { success: false, error: 'Rendimiento no encontrado' };
      }
    } catch (error: any) {
      console.error('Error obteniendo rendimiento:', error);
      return { success: false, error: error.message };
    }
  }
}
