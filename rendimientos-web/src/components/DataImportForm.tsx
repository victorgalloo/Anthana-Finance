import { useState } from 'react';

interface ImportData {
  cliente: string;
  plazoMeses: number;
  importeInversion: number;
  rendimientoMensual: number;
  fechaInicio: string;
  fechaVencimiento: string;
  comisionRetiro: number;
}

export function DataImportForm() {
  const [importData, setImportData] = useState<ImportData[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleJsonImport = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      
      // Validar que sea un array
      if (!Array.isArray(parsedData)) {
        throw new Error('Los datos deben ser un array de objetos');
      }

      // Validar estructura de cada objeto
      const validatedData = parsedData.map((item, index) => {
        if (!item.cliente || !item.importeInversion || !item.rendimientoMensual) {
          throw new Error(`Elemento ${index + 1}: Faltan campos requeridos (cliente, importeInversion, rendimientoMensual)`);
        }

        return {
          cliente: item.cliente,
          plazoMeses: item.plazoMeses || 6,
          importeInversion: parseFloat(item.importeInversion),
          rendimientoMensual: parseFloat(item.rendimientoMensual),
          fechaInicio: item.fechaInicio || new Date().toISOString().split('T')[0],
          fechaVencimiento: item.fechaVencimiento || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          comisionRetiro: parseFloat(item.comisionRetiro || 5)
        };
      });

      setImportData(validatedData);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data: ImportData[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            data.push({
              cliente: row.cliente || `Cliente ${i}`,
              plazoMeses: parseInt(row.plazoMeses) || 6,
              importeInversion: parseFloat(row.importeInversion) || 0,
              rendimientoMensual: parseFloat(row.rendimientoMensual) || 0,
              fechaInicio: row.fechaInicio || new Date().toISOString().split('T')[0],
              fechaVencimiento: row.fechaVencimiento || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              comisionRetiro: parseFloat(row.comisionRetiro) || 5
            });
          }
        }

        setImportData(data);
        setError('');
      } catch (err: any) {
        setError('Error procesando archivo CSV: ' + err.message);
      }
    };

    reader.readAsText(file);
  };

  const generateSampleData = () => {
    const sampleData = [
      {
        cliente: "Bertha Alicia Bernal Torres",
        plazoMeses: 6,
        importeInversion: 240000,
        rendimientoMensual: 2.0,
        fechaInicio: "2025-09-05",
        fechaVencimiento: "2026-03-20",
        comisionRetiro: 5
      },
      {
        cliente: "Juan Pérez García",
        plazoMeses: 12,
        importeInversion: 500000,
        rendimientoMensual: 1.8,
        fechaInicio: "2025-01-01",
        fechaVencimiento: "2025-12-31",
        comisionRetiro: 5
      }
    ];

    setJsonInput(JSON.stringify(sampleData, null, 2));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Importar Datos de Corridas Financieras
        </h3>

        {/* Importación JSON */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Importación JSON</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datos JSON
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"cliente": "Nombre", "importeInversion": 240000, "rendimientoMensual": 2.0, ...}]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 font-mono text-sm"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleJsonImport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Importar JSON
              </button>
              <button
                onClick={generateSampleData}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Datos de Ejemplo
              </button>
            </div>
          </div>
        </div>

        {/* Importación CSV */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Importación CSV</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formato esperado: cliente, plazoMeses, importeInversion, rendimientoMensual, fechaInicio, fechaVencimiento, comisionRetiro
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Vista previa de datos importados */}
        {importData.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Vista Previa ({importData.length} registros)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plazo</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inversión</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendimiento %</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Fin</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.cliente}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.plazoMeses} meses
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(item.importeInversion)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.rendimientoMensual}%
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(item.fechaInicio).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(item.fechaVencimiento).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            // Aquí podrías abrir el formulario de proyección con estos datos
                            console.log('Procesar datos para:', item.cliente);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Procesar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
