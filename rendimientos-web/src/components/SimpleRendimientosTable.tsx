import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RendimientosService } from '../services/rendimientosService';

export function SimpleRendimientosTable() {
  const { user } = useAuth();
  const [rendimientos, setRendimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRendimientos = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const result = await RendimientosService.getRendimientosByUser(user.uid);
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

    loadRendimientos();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Cargando rendimientos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#dc2626' }}>Error: {error}</p>
      </div>
    );
  }

  if (rendimientos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#64748b' }}>No tienes rendimientos registrados aún.</p>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          Los rendimientos aparecerán aquí cuando se creen.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '500', color: '#374151' }}>Período</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '500', color: '#374151' }}>Capital</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '500', color: '#374151' }}>Rendimiento %</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '500', color: '#374151' }}>Rendimiento MXN</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '500', color: '#374151' }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rendimientos.map((rendimiento) => (
            <tr key={rendimiento.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', color: '#111827' }}>{rendimiento.periodo}</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                {rendimiento.capital ? `$${rendimiento.capital.toLocaleString()}` : '-'}
              </td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                {rendimiento.rendimiento_pct ? `${rendimiento.rendimiento_pct}%` : '-'}
              </td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                {rendimiento.rendimiento_mxn ? `$${rendimiento.rendimiento_mxn.toLocaleString()}` : '-'}
              </td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                {rendimiento.balance ? `$${rendimiento.balance.toLocaleString()}` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
