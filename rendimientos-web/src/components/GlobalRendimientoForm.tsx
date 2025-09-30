import { useState, useEffect } from 'react';
import { UserService } from '../services/userService';
import { RendimientosService } from '../services/rendimientosService';
import { PeriodRangePicker } from './PeriodRangePicker';
import { DatePicker } from './DatePicker';

interface GlobalRendimientoData {
  // Datos básicos de rendimiento
  periodo: string; // Can be YYYY-MM or YYYY-MM to YYYY-MM for range
  capital?: number;
  rendimiento_pct?: number;
  rendimiento_mxn?: number;
  balance?: number;
  notas: string;
  applyToAllUsers: boolean;
  applyToFutureUsers: boolean;
  
  // Parámetros de inversión
  plazoMeses: number;
  importeInversion: number;
  retiroRendimientosProgramados: boolean;
  periodicidadRendimientos: 'Mensual' | 'Trimestral' | 'Anual';
  tipoPortafolio: 'Conservador' | 'Moderado' | 'Agresivo';
  rendimientoMensual: number;
  fechaInicio: string;
  fechaVencimiento: string;
  comisionRetiro: number;
  aportacionMensualExtra: number;
  aportacionAnual: number;
}

export function GlobalRendimientoForm() {
  const [globalData, setGlobalData] = useState<GlobalRendimientoData>({
    // Datos básicos
    periodo: '',
    capital: 0,
    rendimiento_pct: 0,
    rendimiento_mxn: 0,
    balance: 0,
    notas: '',
    applyToAllUsers: true,
    applyToFutureUsers: true,
    
    // Parámetros de inversión
    plazoMeses: 6,
    importeInversion: 240000,
    retiroRendimientosProgramados: false,
    periodicidadRendimientos: 'Mensual',
    tipoPortafolio: 'Conservador',
    rendimientoMensual: 2.0,
    fechaInicio: '2025-09-05',
    fechaVencimiento: '2026-03-20',
    comisionRetiro: 5,
    aportacionMensualExtra: 0,
    aportacionAnual: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processedUsers, setProcessedUsers] = useState<string[]>([]);

  // Auto-calculate rendimiento_mxn and balance when capital or rendimiento_pct changes
  useEffect(() => {
    const capital = globalData.capital || 0;
    const rendimientoPct = globalData.rendimiento_pct || 0;
    
    if (capital > 0 && rendimientoPct > 0) {
      const rendimientoMxn = (capital * rendimientoPct) / 100;
      const balance = capital + rendimientoMxn;
      
      setGlobalData(prev => ({
        ...prev,
        rendimiento_mxn: rendimientoMxn,
        balance: balance
      }));
    }
  }, [globalData.capital, globalData.rendimiento_pct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!globalData.periodo || !globalData.notas) {
      setError('Período y notas son requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setProcessedUsers([]);

    try {
      // Obtener todos los usuarios
      const usersResult = await UserService.getAllUsers();
      
      if (!usersResult.success || !usersResult.data) {
        setError('Error obteniendo lista de usuarios');
        return;
      }

      const users = usersResult.data;
      const successfulUsers: string[] = [];
      const failedUsers: string[] = [];

      // Aplicar rendimiento a cada usuario
      for (const user of users) {
        try {
          const rendimientoData = {
            uid: user.uid,
            periodo: globalData.periodo,
            capital: globalData.capital || 0,
            rendimiento_pct: globalData.rendimiento_pct || 0,
            rendimiento_mxn: globalData.rendimiento_mxn || 0,
            balance: globalData.balance || 0,
            notas: `${globalData.notas} [GLOBAL]`
          };

          const result = await RendimientosService.createRendimiento(rendimientoData);
          
          if (result.success) {
            successfulUsers.push(user.email);
          } else {
            failedUsers.push(`${user.email}: ${result.error}`);
          }
        } catch (err: any) {
          failedUsers.push(`${user.email}: ${err.message}`);
        }
      }

      setProcessedUsers(successfulUsers);

      if (successfulUsers.length > 0) {
        setSuccessMessage(
          `✅ Rendimiento global aplicado exitosamente a ${successfulUsers.length} usuarios.`
        );
      }

      if (failedUsers.length > 0) {
        setError(
          `⚠️ Algunos usuarios fallaron:\n${failedUsers.join('\n')}`
        );
      }

    } catch (err: any) {
      setError(err.message || 'Error aplicando rendimiento global');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Rendimiento Global
        </h3>
        <p className="text-gray-600 mb-6">
          Aplica un rendimiento, comisión, bonus o ajuste a todos los usuarios del sistema.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período (YYYY-MM o rango) *
              </label>
              <PeriodRangePicker
                value={globalData.periodo}
                onChange={(value) => setGlobalData({...globalData, periodo: value})}
                placeholder="2024-01 to 2024-12"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capital
              </label>
              <input
                type="number"
                step="0.01"
                value={globalData.capital || ''}
                onChange={(e) => setGlobalData({...globalData, capital: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rendimiento %
              </label>
              <input
                type="number"
                step="0.01"
                value={globalData.rendimiento_pct || ''}
                onChange={(e) => setGlobalData({...globalData, rendimiento_pct: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rendimiento MXN <span className="text-xs text-gray-500">(Calculado automáticamente)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={globalData.rendimiento_mxn || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Balance <span className="text-xs text-gray-500">(Calculado automáticamente)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={globalData.balance || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Parámetros de Inversión */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros de Inversión</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Columna 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plazo en meses
                  </label>
                  <input
                    type="number"
                    value={globalData.plazoMeses}
                    onChange={(e) => setGlobalData({...globalData, plazoMeses: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Portafolio
                  </label>
                  <select
                    value={globalData.tipoPortafolio}
                    onChange={(e) => setGlobalData({...globalData, tipoPortafolio: e.target.value as 'Conservador' | 'Moderado' | 'Agresivo'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Conservador">Conservador</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Agresivo">Agresivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comisión sobre retiro (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalData.comisionRetiro}
                    onChange={(e) => setGlobalData({...globalData, comisionRetiro: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Columna 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importe de inversión MXN
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalData.importeInversion}
                    onChange={(e) => setGlobalData({...globalData, importeInversion: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio
                  </label>
                  <DatePicker
                    value={globalData.fechaInicio}
                    onChange={(value) => setGlobalData({...globalData, fechaInicio: value})}
                    placeholder="YYYY-MM"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aportación Mensual Extra
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalData.aportacionMensualExtra}
                    onChange={(e) => setGlobalData({...globalData, aportacionMensualExtra: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Columna 3 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rendimiento Mensual (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalData.rendimientoMensual}
                    onChange={(e) => setGlobalData({...globalData, rendimientoMensual: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de vencimiento
                  </label>
                  <DatePicker
                    value={globalData.fechaVencimiento}
                    onChange={(value) => setGlobalData({...globalData, fechaVencimiento: value})}
                    placeholder="YYYY-MM"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aportación Anual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalData.aportacionAnual}
                    onChange={(e) => setGlobalData({...globalData, aportacionAnual: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas / Descripción *
            </label>
            <textarea
              value={globalData.notas}
              onChange={(e) => setGlobalData({...globalData, notas: e.target.value})}
              placeholder="Ej: Bonus trimestral, Comisión de referencia, Ajuste por inflación, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Opciones de Aplicación</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={globalData.applyToAllUsers}
                  onChange={(e) => setGlobalData({...globalData, applyToAllUsers: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-blue-800">Aplicar a todos los usuarios existentes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={globalData.applyToFutureUsers}
                  onChange={(e) => setGlobalData({...globalData, applyToFutureUsers: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-blue-800">Aplicar automáticamente a usuarios futuros</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Aplicando a todos los usuarios...' : 'Aplicar Rendimiento Global'}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 whitespace-pre-line">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        {processedUsers.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Usuarios Procesados Exitosamente:</h4>
            <div className="max-h-32 overflow-y-auto">
              <ul className="text-sm text-blue-800 space-y-1">
                {processedUsers.map((email, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {email}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Casos de Uso Comunes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Bonus trimestral:</strong> Aplicar un rendimiento fijo a todos</li>
          <li>• <strong>Comisión de referencia:</strong> Agregar comisión por referir clientes</li>
          <li>• <strong>Ajuste por inflación:</strong> Incremento automático del balance</li>
          <li>• <strong>Promoción especial:</strong> Rendimiento extra por tiempo limitado</li>
          <li>• <strong>Corrección de errores:</strong> Ajustar datos incorrectos masivamente</li>
        </ul>
      </div>
    </div>
  );
}
