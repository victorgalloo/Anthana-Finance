import { useState, useEffect } from 'react';
import { UserService } from '../services/userService';
import { RendimientosService } from '../services/rendimientosService';
import { AdminAuthService } from '../services/adminAuthService';
import { ContractService } from '../services/contractService';
import { GlobalRendimientoForm } from './GlobalRendimientoForm';
import { FirebaseTest } from './FirebaseTest';
import { AddRendimientoForm } from './AddRendimientoForm';
import { BulkUserUpload } from './BulkUserUpload';
import { BulkContractsUpload } from './BulkContractsUpload';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: any;
}

interface Rendimiento {
  id: string;
  uid: string;
  periodo: string;
  capital: number;
  rendimiento_pct: number;
  rendimiento_mxn: number;
  balance: number;
  notas?: string;
  createdAt?: any;
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rendimientos, setRendimientos] = useState<Rendimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para crear usuario
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  // Estados para pestañas
  const [activeTab, setActiveTab] = useState<'users' | 'contracts' | 'global'>('users');
  
  // Estados para contratos
  const [contractExpirations, setContractExpirations] = useState<any[]>([]);
  const [contractsPerPage, setContractsPerPage] = useState<number>(10);
  
  // Estados para formulario de rendimiento
  const [showAddRendimientoForm, setShowAddRendimientoForm] = useState(false);

  useEffect(() => {
    loadUsers();
    loadContractExpirations();
  }, []);

  useEffect(() => {
    // Filtrar usuarios basado en el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  useEffect(() => {
    if (selectedUser) {
      loadUserRendimientos(selectedUser.uid);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await UserService.getAllUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Error cargando usuarios');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRendimientos = async (uid: string) => {
    try {
      const result = await RendimientosService.getRendimientosByUser(uid);
      if (result.success && result.data) {
        setRendimientos(result.data as Rendimiento[]);
      } else {
        setError(result.error || 'Error cargando rendimientos');
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando rendimientos');
    }
  };

  const loadContractExpirations = async () => {
    try {
      setLoading(true);
      
      // Primero cargar usuarios desde Firebase
      const usersResult = await UserService.getAuthUsers();
      if (!usersResult.success || !usersResult.data) {
        console.warn('No se pudieron cargar usuarios:', usersResult.error);
        setContractExpirations([]);
        return;
      }

      // Luego cargar contratos desde Firebase
      const contractsResult = await ContractService.getAllContracts();
      if (!contractsResult.success || !contractsResult.data) {
        console.warn('No se pudieron cargar contratos:', contractsResult.error);
        setContractExpirations([]);
        return;
      }

      // Combinar información de usuarios con contratos
      const enrichedContracts = contractsResult.data.map(contract => {
        const user = usersResult.data?.find(u => u.uid === contract.userId);
        return {
          ...contract,
          userEmail: user?.email || contract.userEmail,
          userName: user?.displayName || user?.email || contract.userEmail,
          userPhone: user?.phoneNumber || '',
          userCreatedAt: user?.createdAt || ''
        };
      });

      setContractExpirations(enrichedContracts);
      console.log('✅ Contratos cargados con información de usuarios:', enrichedContracts.length);
      
      if (enrichedContracts.length === 0) {
        setSuccessMessage('ℹ️ No hay contratos registrados. Usa "Rendimiento Global" para crear contratos automáticamente.');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err: any) {
      console.error('❌ Error cargando contratos:', err);
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) {
      setError('Email y contraseña son requeridos');
      return;
    }

    if (newUserPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await AdminAuthService.createUser({
        email: newUserEmail,
        password: newUserPassword
      });

      if (result.success) {
        setNewUserEmail('');
        setNewUserPassword('');
        setShowCreateUser(false);
        setError(null);
        
        // Mostrar mensaje de éxito
        if (result.requiresReauth) {
          setSuccessMessage(`✅ Usuario ${newUserEmail} creado exitosamente. Necesitas volver a iniciar sesión como administrador.`);
        } else {
          setSuccessMessage(`✅ Usuario ${newUserEmail} creado exitosamente.`);
        }
        
        // Limpiar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        setError(result.error || 'Error creando usuario');
      }
    } catch (err: any) {
      setError(err.message || 'Error creando usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleRendimientoSuccess = async () => {
    setShowAddRendimientoForm(false);
    if (selectedUser) {
      await loadUserRendimientos(selectedUser.uid);
    }
    setSuccessMessage('✅ Rendimiento agregado exitosamente');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona usuarios, rendimientos y proyecciones financieras</p>
        </div>
        <button
          onClick={() => setShowCreateUser(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Crear Usuario
        </button>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap space-x-2 lg:space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👥 Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contracts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Todos los Contratos
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'global'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Rendimiento Global
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Prueba de Firebase */}
      <FirebaseTest />

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            {/* Lista de Usuarios */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Usuarios</h3>
                  <span className="text-sm text-gray-500">({filteredUsers.length})</span>
                </div>
            
                {/* Barra de búsqueda */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar por email o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
            
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.uid}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.uid === user.uid
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Creado: {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  ))}
              
                  {filteredUsers.length === 0 && searchTerm && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No se encontraron usuarios</p>
                    </div>
                  )}
                  
                  {filteredUsers.length === 0 && !searchTerm && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No hay usuarios registrados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Histórico del Usuario */}
            <div className="xl:col-span-1">
              {selectedUser ? (
                <div className="space-y-6">
                  {/* Información del Usuario */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        📊 Histórico de {selectedUser.email}
                      </h3>
                      <button
                        onClick={() => setShowAddRendimientoForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        + Agregar Rendimiento
                      </button>
                    </div>

                    {/* Tabla de Rendimientos */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Período
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Capital
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rendimiento %
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rendimiento MXN
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Balance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {rendimientos.map((rendimiento) => (
                            <tr key={rendimiento.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {rendimiento.periodo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                ${rendimiento.capital?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {rendimiento.rendimiento_pct || 0}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                ${rendimiento.rendimiento_mxn?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                ${rendimiento.balance?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => alert('Funcionalidad de editar rendimiento próximamente')}
                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('¿Estás seguro de que quieres eliminar este rendimiento?')) {
                                        // TODO: Implementar eliminación
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {rendimientos.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No hay rendimientos registrados para este usuario.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un usuario</h3>
                  <p className="text-gray-500">Haz clic en un usuario de la lista para ver su histórico de rendimientos.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Carga Masiva de Usuarios */}
          <div className="mt-6">
            <BulkUserUpload 
              onSuccess={(createdCount, skippedCount) => {
                setSuccessMessage(`✅ Carga masiva completada: ${createdCount} usuarios creados, ${skippedCount} omitidos`);
                setTimeout(() => setSuccessMessage(''), 5000);
                loadUsers(); // Recargar la lista de usuarios
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'contracts' && (
        <div className="space-y-4 lg:space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">📋 Todos los Contratos</h2>
              <div className="flex space-x-3">
                <button
                  onClick={loadContractExpirations}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔄 Recargar Contratos
                </button>
              </div>
            </div>

            {/* Estadísticas de Contratos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{contractExpirations.length}</div>
                <div className="text-sm text-blue-600">Total Contratos</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {contractExpirations.filter(c => c.daysRemaining < 0).length}
                </div>
                <div className="text-sm text-red-600">Vencidos</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {contractExpirations.filter(c => c.daysRemaining >= 0 && c.daysRemaining <= 30).length}
                </div>
                <div className="text-sm text-yellow-600">Próximos a Vencer</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {contractExpirations.filter(c => c.daysRemaining > 30).length}
                </div>
                <div className="text-sm text-green-600">Activos</div>
              </div>
            </div>

            {/* Lista de Contratos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Lista de Contratos</h3>
                
                {/* Filtro de contratos por página */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Mostrar:</label>
                  <select
                    value={contractsPerPage}
                    onChange={(e) => setContractsPerPage(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5 contratos</option>
                    <option value={10}>10 contratos</option>
                    <option value={25}>25 contratos</option>
                    <option value={50}>50 contratos</option>
                    <option value={100}>100 contratos</option>
                    <option value={contractExpirations.length}>Todos ({contractExpirations.length})</option>
                  </select>
                </div>
              </div>
              
              {contractExpirations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">No hay contratos en la base de datos</p>
                  <p className="text-sm text-gray-600 mb-4">Los contratos se crean automáticamente cuando aplicas rendimientos globales.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 lg:mx-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Contrato</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Vencimiento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Restantes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contractExpirations.slice(0, contractsPerPage).map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    {(contract.userName || contract.userEmail).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {contract.userName || contract.userEmail}
                                </div>
                                <div className="text-sm text-gray-500">{contract.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contract.contractType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${contract.investmentAmount?.toLocaleString() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(contract.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(contract.expirationDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contract.daysRemaining < 0
                                ? 'bg-red-100 text-red-800'
                                : contract.daysRemaining <= 30
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {contract.daysRemaining < 0 ? 'Vencido' : `${contract.daysRemaining} días`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contract.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {contract.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Información de paginación */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <div>
                      Mostrando {Math.min(contractsPerPage, contractExpirations.length)} de {contractExpirations.length} contratos
                    </div>
                    {contractExpirations.length > contractsPerPage && (
                      <div className="text-blue-600">
                        Usa el filtro "Mostrar" para ver más contratos
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Carga Masiva de Contratos */}
          <div className="mt-6">
            <BulkContractsUpload 
              onSuccess={(createdCount, skippedCount) => {
                setSuccessMessage(`✅ Carga masiva de contratos completada: ${createdCount} contratos creados, ${skippedCount} omitidos`);
                setTimeout(() => setSuccessMessage(''), 5000);
                loadContractExpirations(); // Recargar la lista de contratos
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'global' && (
        <GlobalRendimientoForm />
      )}

      {/* Modal para Crear Usuario */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUser(false);
                    setNewUserEmail('');
                    setNewUserPassword('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Agregar Rendimiento */}
      {showAddRendimientoForm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AddRendimientoForm
            userId={selectedUser.uid}
            userEmail={selectedUser.email}
            onSuccess={handleRendimientoSuccess}
            onCancel={() => setShowAddRendimientoForm(false)}
          />
        </div>
      )}
    </div>
  );
}