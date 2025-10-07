import { useState, useEffect } from 'react';
import { ContractService } from '../services/contractService';

export function useContractsTotal() {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTotalAmount = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ContractService.getTotalContractsAmount();
      
      if (result.success && result.totalAmount !== undefined) {
        setTotalAmount(result.totalAmount);
      } else {
        setError(result.error || 'Error cargando total de contratos');
        setTotalAmount(0);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTotalAmount();
  }, []);

  return {
    totalAmount,
    loading,
    error,
    refetch: loadTotalAmount
  };
}
