import { useState, useEffect } from 'react';
import { RendimientosService, type RendimientoData } from '../services/rendimientosService';

interface RendimientoFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: (RendimientoData & { id: string }) | null;
  selectedUserUid?: string;
  showUserField?: boolean;
}

export function RendimientoForm({ onSave, onCancel, initialData, selectedUserUid, showUserField = true }: RendimientoFormProps) {
  const [formData, setFormData] = useState({
    uid: selectedUserUid || '',
    periodo: '',
    capital: '',
    rendimiento_pct: '',
    rendimiento_mxn: '',
    balance: '',
    notas: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        uid: initialData.uid,
        periodo: initialData.periodo,
        capital: initialData.capital?.toString() || '',
        rendimiento_pct: initialData.rendimiento_pct?.toString() || '',
        rendimiento_mxn: initialData.rendimiento_mxn?.toString() || '',
        balance: initialData.balance?.toString() || '',
        notas: initialData.notas || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (selectedUserUid) {
      setFormData(prev => ({ ...prev, uid: selectedUserUid }));
    }
  }, [selectedUserUid]);

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    // Validar usuario seleccionado (solo si se muestra el campo)
    if (showUserField && !formData.uid) {
      newErrors.uid = 'Debe seleccionar un usuario';
    }

    // Validar período (formato YYYY-MM)
    if (!formData.periodo) {
      newErrors.periodo = 'El período es requerido';
    } else if (!/^\d{4}-\d{2}$/.test(formData.periodo)) {
      newErrors.periodo = 'El período debe tener formato YYYY-MM (ej: 2025-09)';
    }

    // Validar que al menos un campo numérico esté lleno
    const hasNumericData = formData.capital || formData.rendimiento_pct || 
                          formData.rendimiento_mxn || formData.balance;
    
    if (!hasNumericData) {
      newErrors.general = 'Debe llenar al menos un campo numérico (capital, rendimiento o balance)';
    }

    // Validar números
    const numericFields = ['capital', 'rendimiento_pct', 'rendimiento_mxn', 'balance'];
    numericFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (value && isNaN(Number(value))) {
        newErrors[field] = 'Debe ser un número válido';
      }
    });

    // Validar que no exista un rendimiento duplicado para el mismo usuario y período
    if (formData.uid && formData.periodo && !newErrors.periodo) {
      try {
        const existsResult = await RendimientosService.checkRendimientoExists(
          formData.uid, 
          formData.periodo,
          initialData?.id // Excluir el documento actual si estamos editando
        );
        
        if (existsResult.success && existsResult.exists) {
          newErrors.periodo = `Ya existe un rendimiento para este usuario en el período ${formData.periodo}`;
        }
      } catch (error) {
        console.error('Error verificando rendimiento duplicado:', error);
        newErrors.general = 'Error verificando rendimiento existente';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }

    setLoading(true);

    try {
      // Filtrar campos undefined para evitar errores en Firestore
      const dataToSave: any = {
        uid: formData.uid,
        periodo: formData.periodo,
      };

      // Solo agregar campos que tienen valores válidos
      if (formData.capital && formData.capital.trim() !== '') {
        dataToSave.capital = Number(formData.capital);
      }
      if (formData.rendimiento_pct && formData.rendimiento_pct.trim() !== '') {
        dataToSave.rendimiento_pct = Number(formData.rendimiento_pct);
      }
      if (formData.rendimiento_mxn && formData.rendimiento_mxn.trim() !== '') {
        dataToSave.rendimiento_mxn = Number(formData.rendimiento_mxn);
      }
      if (formData.balance && formData.balance.trim() !== '') {
        dataToSave.balance = Number(formData.balance);
      }
      if (formData.notas && formData.notas.trim() !== '') {
        dataToSave.notas = formData.notas;
      }

      onSave(dataToSave);
    } catch (error) {
      console.error('Error guardando rendimiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Actualizar el campo
    const newFormData = { ...formData, [name]: value };
    
    // Calcular automáticamente Rendimiento MXN si se llena Capital y Rendimiento %
    if (name === 'capital' || name === 'rendimiento_pct') {
      const capital = name === 'capital' ? parseFloat(value) : parseFloat(formData.capital);
      const rendimientoPct = name === 'rendimiento_pct' ? parseFloat(value) : parseFloat(formData.rendimiento_pct);
      
      if (!isNaN(capital) && !isNaN(rendimientoPct) && capital > 0) {
        const rendimientoMxn = (capital * rendimientoPct) / 100;
        newFormData.rendimiento_mxn = rendimientoMxn.toFixed(2);
      }
    }
    
    // Calcular automáticamente Balance si se llena Capital y Rendimiento MXN
    if (name === 'capital' || name === 'rendimiento_mxn') {
      const capital = name === 'capital' ? parseFloat(value) : parseFloat(formData.capital);
      const rendimientoMxn = name === 'rendimiento_mxn' ? parseFloat(value) : parseFloat(formData.rendimiento_mxn);
      
      if (!isNaN(capital) && !isNaN(rendimientoMxn)) {
        const balance = capital + rendimientoMxn;
        newFormData.balance = balance.toFixed(2);
      }
    }
    
    setFormData(newFormData);
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validar duplicados en tiempo real cuando se cambia el período
    if (name === 'periodo' && value && formData.uid && /^\d{4}-\d{2}$/.test(value)) {
      try {
        const existsResult = await RendimientosService.checkRendimientoExists(
          formData.uid, 
          value,
          initialData?.id
        );
        
        if (existsResult.success && existsResult.exists) {
          setErrors(prev => ({ 
            ...prev, 
            periodo: `Ya existe un rendimiento para este usuario en el período ${value}` 
          }));
        }
      } catch (error) {
        console.error('Error verificando rendimiento duplicado:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nota informativa sobre cálculos automáticos */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Cálculos Automáticos
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Rendimiento MXN</strong> = (Capital × Rendimiento %) ÷ 100</li>
                <li><strong>Balance</strong> = Capital + Rendimiento MXN</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usuario - Solo mostrar si showUserField es true */}
        {showUserField && (
          <div className="md:col-span-2">
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
              Usuario *
            </label>
            <input
              type="text"
              id="usuario"
              value={formData.uid}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              placeholder="Usuario seleccionado..."
            />
            {errors.uid && (
              <p className="mt-1 text-sm text-red-600">{errors.uid}</p>
            )}
          </div>
        )}

        {/* Período */}
        <div>
          <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-2">
            Período *
          </label>
          <input
            type="text"
            id="periodo"
            name="periodo"
            value={formData.periodo}
            onChange={handleInputChange}
            placeholder="2025-09"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.periodo && (
            <p className="mt-1 text-sm text-red-600">{errors.periodo}</p>
          )}
        </div>

        {/* Capital */}
        <div>
          <label htmlFor="capital" className="block text-sm font-medium text-gray-700 mb-2">
            Capital
          </label>
          <input
            type="number"
            id="capital"
            name="capital"
            value={formData.capital}
            onChange={handleInputChange}
            placeholder="100000"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.capital && (
            <p className="mt-1 text-sm text-red-600">{errors.capital}</p>
          )}
        </div>

        {/* Rendimiento % */}
        <div>
          <label htmlFor="rendimiento_pct" className="block text-sm font-medium text-gray-700 mb-2">
            Rendimiento %
          </label>
          <input
            type="number"
            id="rendimiento_pct"
            name="rendimiento_pct"
            value={formData.rendimiento_pct}
            onChange={handleInputChange}
            placeholder="5.5"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.rendimiento_pct && (
            <p className="mt-1 text-sm text-red-600">{errors.rendimiento_pct}</p>
          )}
        </div>

        {/* Rendimiento MXN */}
        <div>
          <label htmlFor="rendimiento_mxn" className="block text-sm font-medium text-gray-700 mb-2">
            Rendimiento MXN <span className="text-xs text-gray-500">(calculado automáticamente)</span>
          </label>
          <input
            type="number"
            id="rendimiento_mxn"
            name="rendimiento_mxn"
            value={formData.rendimiento_mxn}
            onChange={handleInputChange}
            placeholder="5500"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-700"
          />
          {errors.rendimiento_mxn && (
            <p className="mt-1 text-sm text-red-600">{errors.rendimiento_mxn}</p>
          )}
        </div>

        {/* Balance */}
        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
            Balance <span className="text-xs text-gray-500">(calculado automáticamente)</span>
          </label>
          <input
            type="number"
            id="balance"
            name="balance"
            value={formData.balance}
            onChange={handleInputChange}
            placeholder="105500"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-700"
          />
          {errors.balance && (
            <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
          )}
        </div>
      </div>

      {/* Notas */}
      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-2">
          Notas
        </label>
        <textarea
          id="notas"
          name="notas"
          value={formData.notas}
          onChange={handleInputChange}
          rows={3}
          placeholder="Notas adicionales sobre el rendimiento..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
        </button>
      </div>
    </form>
  );
}
