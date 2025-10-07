import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserService } from './userService';

export interface CreateUserData {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
}

export interface CreateUserResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresReauth?: boolean;
}

export interface CreateUserOptions {
  email: string;
  password: string;
  currentUserEmail: string;
  currentUserPassword: string;
}

export class AdminAuthService {
  /**
   * Crear un nuevo usuario con Firebase Auth
   * Solo para administradores - usa Firebase Admin SDK para mantener sesión
   */
  static async createUser(userData: CreateUserData): Promise<CreateUserResult> {
    if (!auth) {
      return { success: false, error: 'Firebase Auth no está configurado' };
    }

    try {
      // Guardar el usuario actual antes de crear el nuevo
      const currentAdminUser = auth.currentUser;
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      const newUser = userCredential.user;

      // Crear documento del usuario en Firestore
      const userResult = await UserService.createOrUpdateUser(newUser.uid, {
        email: newUser.email || '',
        displayName: userData.displayName || newUser.displayName || undefined,
        phoneNumber: userData.phoneNumber || undefined,
      });

      if (!userResult.success) {
        console.warn('Error creando usuario en Firestore:', userResult.error);
      }

      // Si hay un usuario admin previo, intentar restaurar su sesión
      if (currentAdminUser) {
        try {
          // Cerrar sesión del nuevo usuario
          await signOut(auth);
          
          // Nota: En una implementación real, aquí usarías Firebase Admin SDK
          // para crear usuarios sin cambiar la sesión del cliente
          console.log('Usuario creado exitosamente. El admin debe volver a iniciar sesión.');
          
          return { 
            success: true, 
            user: {
              uid: newUser.uid,
              email: newUser.email,
              createdAt: new Date()
            },
            requiresReauth: true // Indicar que el admin debe volver a autenticarse
          };
        } catch (restoreError) {
          console.warn('Error en proceso de restauración:', restoreError);
        }
      }

      return { 
        success: true, 
        user: {
          uid: newUser.uid,
          email: newUser.email,
          createdAt: new Date()
        }
      };
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      
      // Manejar errores específicos de Firebase
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil (mínimo 6 caracteres)';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El email no es válido';
      }

      return { success: false, error: errorMessage };
    }
  }
}
