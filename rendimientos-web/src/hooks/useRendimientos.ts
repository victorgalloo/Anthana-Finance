import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { RendimientosService, type RendimientoData } from '../services/rendimientosService';

export function useRendimientos() {
  const { user } = useAuth();
  const [rendimientos, setRendimientos] = useState<(RendimientoData & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el usuario es admin
  const isAdmin = user?.email?.includes('admin') || user?.email === 'admin@test.com';

  const loadRendimientos = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = isAdmin 
        ? await RendimientosService.getAllRendimientos()
        : await RendimientosService.getRendimientosByUser(user.uid);

      if (result.success && result.data) {
        setRendimientos(result.data);
      } else {
        setError(result.error || 'Error cargando rendimientos');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const createRendimiento = async (rendimientoData: Omit<RendimientoData, 'createdAt'>) => {
    if (!isAdmin) {
      setError('Solo los administradores pueden crear rendimientos');
      return { success: false };
    }

    setError(null);
    const result = await RendimientosService.createRendimiento(rendimientoData);
    
    if (result.success) {
      await loadRendimientos(); // Recargar la lista
    } else {
      setError(result.error || 'Error creando rendimiento');
    }

    return result;
  };

  const updateRendimiento = async (docId: string, updateData: Partial<RendimientoData>) => {
    if (!isAdmin) {
      setError('Solo los administradores pueden actualizar rendimientos');
      return { success: false };
    }

    setError(null);
    const result = await RendimientosService.updateRendimiento(docId, updateData);
    
    if (result.success) {
      await loadRendimientos(); // Recargar la lista
    } else {
      setError(result.error || 'Error actualizando rendimiento');
    }

    return result;
  };

  const deleteRendimiento = async (docId: string) => {
    if (!isAdmin) {
      setError('Solo los administradores pueden eliminar rendimientos');
      return { success: false };
    }

    setError(null);
    const result = await RendimientosService.deleteRendimiento(docId);
    
    if (result.success) {
      await loadRendimientos(); // Recargar la lista
    } else {
      setError(result.error || 'Error eliminando rendimiento');
    }

    return result;
  };

  // Cargar rendimientos cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadRendimientos();
    } else {
      setRendimientos([]);
    }
  }, [user, isAdmin]);

  return {
    rendimientos,
    loading,
    error,
    isAdmin,
    loadRendimientos,
    createRendimiento,
    updateRendimiento,
    deleteRendimiento,
  };
}
