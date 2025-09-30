import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { RendimientosService, type RendimientoData } from '../services/rendimientosService';

interface RendimientosTotales {
  totalRendimientoMxn: number;
  totalBalance: number;
  totalCapital: number;
  promedioRendimientoPct: number;
}

export function useUserRendimientos() {
  const { user } = useAuth();
  const [rendimientos, setRendimientos] = useState<(RendimientoData & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRendimientos = async () => {
    if (!user) {
      setRendimientos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await RendimientosService.getRendimientosByUser(user.uid);
      
      if (result.success && result.data) {
        setRendimientos(result.data);
      } else {
        setError(result.error || 'Error cargando rendimientos');
        setRendimientos([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
      setRendimientos([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales del año actual
  const calcularTotales = (): RendimientosTotales => {
    const currentYear = new Date().getFullYear().toString();
    
    const rendimientosDelAno = rendimientos.filter(r => 
      r.periodo.startsWith(currentYear)
    );

    const totales = rendimientosDelAno.reduce(
      (acc, rendimiento) => ({
        totalRendimientoMxn: acc.totalRendimientoMxn + (rendimiento.rendimiento_mxn || 0),
        totalBalance: acc.totalBalance + (rendimiento.balance || 0),
        totalCapital: acc.totalCapital + (rendimiento.capital || 0),
        promedioRendimientoPct: acc.promedioRendimientoPct + (rendimiento.rendimiento_pct || 0),
      }),
      {
        totalRendimientoMxn: 0,
        totalBalance: 0,
        totalCapital: 0,
        promedioRendimientoPct: 0,
      }
    );

    // Calcular promedio de rendimiento porcentual
    const rendimientosConPct = rendimientosDelAno.filter(r => r.rendimiento_pct !== undefined);
    if (rendimientosConPct.length > 0) {
      totales.promedioRendimientoPct = totales.promedioRendimientoPct / rendimientosConPct.length;
    }

    return totales;
  };

  // Cargar rendimientos cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadRendimientos();
    } else {
      setRendimientos([]);
    }
  }, [user]);

  const totales = calcularTotales();

  return {
    rendimientos,
    loading,
    error,
    totales,
    reload: loadRendimientos,
  };
}
