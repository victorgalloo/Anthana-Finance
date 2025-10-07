import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export function FirebaseTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [error, setError] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log('🔍 Probando conexión a Firebase...');
        console.log('📊 DB object:', db);
        
        if (!db) {
          throw new Error('Firebase DB no está inicializado');
        }

        // Intentar leer la colección de usuarios
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersData);
        setStatus('success');
        console.log('✅ Firebase conectado correctamente');
        console.log('👥 Usuarios encontrados:', usersData.length);
        
      } catch (err: any) {
        console.error('❌ Error conectando a Firebase:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">🔧 Prueba de Conexión Firebase</h3>
      
      {status === 'testing' && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Probando conexión...</span>
        </div>
      )}
      
      {status === 'success' && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-green-600">
            <span>✅</span>
            <span>Firebase conectado correctamente</span>
          </div>
          <div className="text-sm text-gray-600">
            Usuarios encontrados: {users.length}
          </div>
          {users.length > 0 && (
            <div className="text-xs text-gray-500">
              Primeros usuarios: {users.slice(0, 3).map(u => u.email || u.id).join(', ')}
            </div>
          )}
        </div>
      )}
      
      {status === 'error' && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-red-600">
            <span>❌</span>
            <span>Error conectando a Firebase</span>
          </div>
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
