import { useState } from 'react';
import { RendimientosService } from '../services/rendimientosService';
import { DatePicker } from './DatePicker';

interface AddRendimientoFormProps {
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddRendimientoForm({ userId, userEmail, onSuccess, onCancel }: AddRendimientoFormProps) {
  const [formData, setFormData] = useState({
    periodo: '',
    capital: '',
    rendimiento_pct: '',
    rendimiento_mxn: '',
    balance: '',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.periodo || !formData.capital) {
      setError('Período y capital son campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rendimientoData = {
        uid: userId,
        periodo: formData.periodo,
        capital: parseFloat(formData.capital),
        rendimiento_pct: parseFloat(formData.rendimiento_pct || '0'),
        rendimiento_mxn: parseFloat(formData.rendimiento_mxn || '0'),
        balance: parseFloat(formData.balance || '0'),
        notas: formData.notas || ''
      };

      const result = await RendimientosService.createRendimiento(rendimientoData);
      
      if (result.success) {
        // Limpiar formulario
        setFormData({
          periodo: '',
          capital: '',
          rendimiento_pct: '',
          rendimiento_mxn: '',
          balance: '',
          notas: ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || 'Error creando rendimiento');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Agregar Rendimiento
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Para: {userEmail}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período (YYYY-MM) *
            </label>
            <DatePicker
              value={formData.periodo}
              onChange={(value) => handleInputChange('periodo', value)}
              placeholder="2024-01"
              className="w-full"
            />
          </div>

          {/* Capital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capital (MXN) *
            </label>
            <input
              type="number"
              value={formData.capital}
              onChange={(e) => handleInputChange('capital', e.target.value)}
              placeholder="100000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Rendimiento % */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rendimiento % (opcional)
            </label>
            <input
              type="number"
              value={formData.rendimiento_pct}
              onChange={(e) => handleInputChange('rendimiento_pct', e.target.value)}
              placeholder="5.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          {/* Rendimiento MXN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rendimiento MXN (opcional)
            </label>
            <input
              type="number"
              value={formData.rendimiento_mxn}
              onChange={(e) => handleInputChange('rendimiento_mxn', e.target.value)}
              placeholder="5500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          {/* Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Balance (opcional)
            </label>
            <input
              type="number"
              value={formData.balance}
              onChange={(e) => handleInputChange('balance', e.target.value)}
              placeholder="105500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => handleInputChange('notas', e.target.value)}
            placeholder="Información adicional sobre este rendimiento..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información sobre los campos
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Capital:</strong> Monto inicial de la inversión</li>
                  <li><strong>Rendimiento %:</strong> Porcentaje de ganancia obtenida</li>
                  <li><strong>Rendimiento MXN:</strong> Ganancia en pesos mexicanos</li>
                  <li><strong>Balance:</strong> Capital + Rendimiento (total actual)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading || !formData.periodo || !formData.capital}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              'Guardar Rendimiento'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
