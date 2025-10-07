import { useState } from 'react';
import { ContractService } from '../services/contractService';
import { UserService } from '../services/userService';

interface BulkContractsUploadProps {
  onSuccess?: (createdCount: number, skippedCount: number) => void;
}

interface ContractData {
  userEmail: string;
  contractType: string;
  investmentAmount: number;
  startDate: string;
  expirationDate: string;
  rendimientoPct: number;
  rendimientoMxn: number;
  balance: number;
  plazoMeses: number;
  tipoPortafolio: string;
  rendimientoMensual: number;
  comisionRetiro: number;
  notas: string;
  rowNumber: number;
}

export function BulkContractsUpload({ onSuccess }: BulkContractsUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ContractData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de archivo
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      // Leer el archivo Excel
      const XLSX = await import('xlsx');
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        setError('El archivo está vacío');
        return;
      }

      // Validar estructura del archivo
      const firstRow = jsonData[0] as any;
      const requiredColumns = ['userEmail', 'contractType', 'investmentAmount', 'startDate', 'expirationDate'];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        setError(`Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}`);
        return;
      }

      // Procesar datos
      const contracts: ContractData[] = jsonData.map((row: any, index: number) => ({
        userEmail: row.userEmail?.toString().trim() || '',
        contractType: row.contractType?.toString().trim() || '',
        investmentAmount: parseFloat(row.investmentAmount) || 0,
        startDate: row.startDate?.toString().trim() || '',
        expirationDate: row.expirationDate?.toString().trim() || '',
        rendimientoPct: parseFloat(row.rendimientoPct) || 0,
        rendimientoMxn: parseFloat(row.rendimientoMxn) || 0,
        balance: parseFloat(row.balance) || 0,
        plazoMeses: parseInt(row.plazoMeses) || 0,
        tipoPortafolio: row.tipoPortafolio?.toString().trim() || 'Conservador',
        rendimientoMensual: parseFloat(row.rendimientoMensual) || 0,
        comisionRetiro: parseFloat(row.comisionRetiro) || 0,
        notas: row.notas?.toString().trim() || '',
        rowNumber: index + 2 // +2 porque empezamos desde la fila 2 (después del header)
      })).filter(contract => contract.userEmail && contract.contractType && contract.investmentAmount > 0);

      if (contracts.length === 0) {
        setError('No se encontraron contratos válidos en el archivo');
        return;
      }

      // Validar emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = contracts.filter(contract => !emailRegex.test(contract.userEmail));
      
      if (invalidEmails.length > 0) {
        setError(`Emails inválidos encontrados en las filas: ${invalidEmails.map(c => c.rowNumber).join(', ')}`);
        return;
      }

      // Validar fechas
      const invalidDates = contracts.filter(contract => 
        !contract.startDate || !contract.expirationDate ||
        new Date(contract.startDate).toString() === 'Invalid Date' ||
        new Date(contract.expirationDate).toString() === 'Invalid Date'
      );
      
      if (invalidDates.length > 0) {
        setError(`Fechas inválidas encontradas en las filas: ${invalidDates.map(c => c.rowNumber).join(', ')}`);
        return;
      }

      // Validar montos
      const invalidAmounts = contracts.filter(contract => contract.investmentAmount <= 0);
      if (invalidAmounts.length > 0) {
        setError(`Montos de inversión inválidos (deben ser mayores a 0) en las filas: ${invalidAmounts.map(c => c.rowNumber).join(', ')}`);
        return;
      }

      setPreviewData(contracts);
      setShowPreview(true);
      setSuccess(`✅ Se encontraron ${contracts.length} contratos válidos en el archivo`);

    } catch (err: any) {
      console.error('Error procesando archivo:', err);
      setError('Error procesando el archivo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContracts = async () => {
    if (previewData.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      let createdCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      // Obtener todos los usuarios para validar emails
      const usersResult = await UserService.getAllUsers();
      if (!usersResult.success || !usersResult.data) {
        setError('Error obteniendo lista de usuarios');
        return;
      }

      const users = usersResult.data;
      const userEmailMap = new Map(users.map(user => [user.email, user.uid]));

      // Procesar contratos uno por uno
      for (const contractData of previewData) {
        try {
          // Verificar si el usuario existe
          const userId = userEmailMap.get(contractData.userEmail);
          if (!userId) {
            errors.push(`${contractData.userEmail}: Usuario no encontrado`);
            continue;
          }

          // Crear el contrato usando ContractService
          const contractToCreate = {
            userId: userId,
            userEmail: contractData.userEmail,
            contractType: contractData.contractType,
            investmentAmount: contractData.investmentAmount,
            startDate: contractData.startDate,
            expirationDate: contractData.expirationDate,
            monthlyReturn: contractData.rendimientoMensual,
            status: 'active' as const,
            // Campos adicionales de rendimiento global
            rendimientoPct: contractData.rendimientoPct,
            rendimientoMxn: contractData.rendimientoMxn,
            balance: contractData.balance,
            plazoMeses: contractData.plazoMeses,
            tipoPortafolio: contractData.tipoPortafolio,
            comisionRetiro: contractData.comisionRetiro,
            notas: contractData.notas
          };

          const result = await ContractService.createContract(contractToCreate);

          if (result.success) {
            createdCount++;
            console.log(`✅ Contrato creado para: ${contractData.userEmail}`);
          } else {
            errors.push(`${contractData.userEmail}: ${result.error}`);
          }
        } catch (contractError: any) {
          console.error(`❌ Error creando contrato para ${contractData.userEmail}:`, contractError);
          errors.push(`${contractData.userEmail}: ${contractError.message}`);
        }
      }

      // Mostrar resultados
      if (errors.length > 0) {
        setError(`Se crearon ${createdCount} contratos. Errores: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
      } else {
        setSuccess(`✅ Se crearon ${createdCount} contratos exitosamente. ${skippedCount} contratos fueron omitidos.`);
      }

      // Limpiar formulario
      setFile(null);
      setPreviewData([]);
      setShowPreview(false);

      if (onSuccess) {
        onSuccess(createdCount, skippedCount);
      }

    } catch (err: any) {
      console.error('Error creando contratos:', err);
      setError('Error creando contratos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          📁 Carga Masiva de Contratos
        </h3>
        <p className="text-gray-600 mb-4">
          Sube un archivo Excel (.xlsx o .xls) con los siguientes campos:
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Estructura del archivo Excel:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div><strong>userEmail</strong> (requerido) - Email del usuario</div>
            <div><strong>contractType</strong> (requerido) - Tipo de contrato</div>
            <div><strong>investmentAmount</strong> (requerido) - Monto de inversión</div>
            <div><strong>startDate</strong> (requerido) - Fecha de inicio (YYYY-MM-DD)</div>
            <div><strong>expirationDate</strong> (requerido) - Fecha de vencimiento (YYYY-MM-DD)</div>
            <div><strong>rendimientoPct</strong> (opcional) - Rendimiento porcentual</div>
            <div><strong>rendimientoMxn</strong> (opcional) - Rendimiento en MXN</div>
            <div><strong>balance</strong> (opcional) - Balance total</div>
            <div><strong>plazoMeses</strong> (opcional) - Plazo en meses</div>
            <div><strong>tipoPortafolio</strong> (opcional) - Tipo de portafolio</div>
            <div><strong>rendimientoMensual</strong> (opcional) - Rendimiento mensual %</div>
            <div><strong>comisionRetiro</strong> (opcional) - Comisión de retiro %</div>
            <div><strong>notas</strong> (opcional) - Notas adicionales</div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar archivo Excel
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {file && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-2">
              Archivo seleccionado: {file.name}
            </p>
            <p className="text-green-600 text-sm">
              {previewData.length} contratos encontrados
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Preview Table */}
        {showPreview && previewData.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Vista previa de contratos:</h4>
            <div className="max-h-60 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Fila</th>
                    <th className="text-left py-2 px-2">Usuario</th>
                    <th className="text-left py-2 px-2">Tipo</th>
                    <th className="text-left py-2 px-2">Monto</th>
                    <th className="text-left py-2 px-2">Inicio</th>
                    <th className="text-left py-2 px-2">Vencimiento</th>
                    <th className="text-left py-2 px-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 20).map((contract, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-2">{contract.rowNumber}</td>
                      <td className="py-2 px-2">{contract.userEmail}</td>
                      <td className="py-2 px-2">{contract.contractType}</td>
                      <td className="py-2 px-2">${contract.investmentAmount.toLocaleString()}</td>
                      <td className="py-2 px-2">{contract.startDate}</td>
                      <td className="py-2 px-2">{contract.expirationDate}</td>
                      <td className="py-2 px-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Válido
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 20 && (
                <p className="text-gray-500 text-xs mt-2">
                  ... y {previewData.length - 20} contratos más
                </p>
              )}
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleCreateContracts}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando contratos...
                  </div>
                ) : (
                  `Crear ${previewData.length} contratos`
                )}
              </button>
              <button
                onClick={resetForm}
                disabled={loading}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
