import { useState } from 'react';
import { AdminAuthService } from '../services/adminAuthService';
import { UserService } from '../services/userService';

interface BulkUserUploadProps {
  onSuccess?: (createdCount: number, skippedCount: number) => void;
}

interface UserData {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
  rowNumber: number;
}

export function BulkUserUpload({ onSuccess }: BulkUserUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<UserData[]>([]);
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
      const requiredColumns = ['email', 'password'];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        setError(`Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}`);
        return;
      }

      // Procesar datos
      const users: UserData[] = jsonData.map((row: any, index: number) => ({
        email: row.email?.toString().trim() || '',
        password: row.password?.toString().trim() || '',
        displayName: row.displayName?.toString().trim() || row.email?.toString().trim() || '',
        phoneNumber: row.phoneNumber?.toString().trim() || '',
        rowNumber: index + 2 // +2 porque empezamos desde la fila 2 (después del header)
      })).filter(user => user.email && user.password);

      if (users.length === 0) {
        setError('No se encontraron usuarios válidos en el archivo');
        return;
      }

      // Validar emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = users.filter(user => !emailRegex.test(user.email));
      
      if (invalidEmails.length > 0) {
        setError(`Emails inválidos encontrados en las filas: ${invalidEmails.map(u => u.rowNumber).join(', ')}`);
        return;
      }

      // Validar contraseñas
      const weakPasswords = users.filter(user => user.password.length < 6);
      if (weakPasswords.length > 0) {
        setError(`Contraseñas muy cortas (mínimo 6 caracteres) en las filas: ${weakPasswords.map(u => u.rowNumber).join(', ')}`);
        return;
      }

      setPreviewData(users);
      setShowPreview(true);
      setSuccess(`✅ Se encontraron ${users.length} usuarios válidos en el archivo`);

    } catch (err: any) {
      console.error('Error procesando archivo:', err);
      setError('Error procesando el archivo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsers = async () => {
    if (previewData.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      let createdCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      // Procesar usuarios uno por uno
      for (const userData of previewData) {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await UserService.getUserByEmail(userData.email);
          if (existingUser.success && existingUser.data) {
            console.log(`Usuario ${userData.email} ya existe, omitiendo...`);
            skippedCount++;
            continue;
          }

          // Crear el usuario usando AdminAuthService
          const result = await AdminAuthService.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
            phoneNumber: userData.phoneNumber
          });

          if (result.success) {
            createdCount++;
            console.log(`✅ Usuario creado: ${userData.email}`);
          } else {
            errors.push(`${userData.email}: ${result.error}`);
          }
        } catch (userError: any) {
          console.error(`❌ Error creando usuario ${userData.email}:`, userError);
          errors.push(`${userData.email}: ${userError.message}`);
        }
      }

      // Mostrar resultados
      if (errors.length > 0) {
        setError(`Se crearon ${createdCount} usuarios. Errores: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
      } else {
        setSuccess(`✅ Se crearon ${createdCount} usuarios exitosamente. ${skippedCount} usuarios fueron omitidos (emails duplicados).`);
      }

      // Limpiar formulario
      setFile(null);
      setPreviewData([]);
      setShowPreview(false);

      if (onSuccess) {
        onSuccess(createdCount, skippedCount);
      }

    } catch (err: any) {
      console.error('Error creando usuarios:', err);
      setError('Error creando usuarios: ' + err.message);
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
          📁 Carga Masiva de Usuarios
        </h3>
        <p className="text-gray-600 mb-4">
          Sube un archivo Excel (.xlsx o .xls) con las siguientes columnas:
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Estructura del archivo Excel:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div><strong>email</strong> (requerido) - Email del usuario</div>
            <div><strong>password</strong> (requerido) - Contraseña (mínimo 6 caracteres)</div>
            <div><strong>displayName</strong> (opcional) - Nombre para mostrar</div>
            <div><strong>phoneNumber</strong> (opcional) - Número de teléfono</div>
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
              {previewData.length} usuarios encontrados
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
            <h4 className="font-medium text-gray-900 mb-3">Vista previa de usuarios:</h4>
            <div className="max-h-60 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Fila</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Nombre</th>
                    <th className="text-left py-2 px-2">Teléfono</th>
                    <th className="text-left py-2 px-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 20).map((user, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-2">{user.rowNumber}</td>
                      <td className="py-2 px-2">{user.email}</td>
                      <td className="py-2 px-2">{user.displayName || '-'}</td>
                      <td className="py-2 px-2">{user.phoneNumber || '-'}</td>
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
                  ... y {previewData.length - 20} usuarios más
                </p>
              )}
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleCreateUsers}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando usuarios...
                  </div>
                ) : (
                  `Crear ${previewData.length} usuarios`
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
