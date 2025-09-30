import { useState, useEffect } from 'react';
import { UserService } from '../services/userService';
import { RendimientosService } from '../services/rendimientosService';
import { AdminAuthService } from '../services/adminAuthService';
import { DataImportForm } from './DataImportForm';
import { GlobalRendimientoForm } from './GlobalRendimientoForm';
import { DatePicker } from './DatePicker';

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
  
  // Estados para crear rendimiento
  const [newRendimiento, setNewRendimiento] = useState({
    periodo: '',
    capital: '',
    rendimiento_pct: '',
    rendimiento_mxn: '',
    balance: '',
    notas: ''
  });
  const [showCreateRendimiento, setShowCreateRendimiento] = useState(false);
  
  // Estados para editar rendimiento
  const [editingRendimiento, setEditingRendimiento] = useState<Rendimiento | null>(null);
  const [showEditRendimiento, setShowEditRendimiento] = useState(false);
  
         // Estados para pestañas
         const [activeTab, setActiveTab] = useState<'users' | 'import' | 'global'>('users');

  useEffect(() => {
    loadUsers();
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

      if (result.success && result.user) {
        // Agregar el nuevo usuario a la lista
        const newUser: User = result.user;
        setUsers([...users, newUser]);
        
        // Limpiar el formulario
        setNewUserEmail('');
        setNewUserPassword('');
        setShowCreateUser(false);
        setError(null);
        
        // Mostrar mensaje de éxito
        if (result.requiresReauth) {
          setSuccessMessage(`✅ Usuario ${newUser.email} creado exitosamente. Necesitas volver a iniciar sesión como administrador.`);
        } else {
          setSuccessMessage(`✅ Usuario ${newUser.email} creado exitosamente.`);
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

  const handleCreateRendimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newRendimiento.periodo || !newRendimiento.capital) {
      setError('Usuario, período y capital son requeridos');
      return;
    }

    try {
      setLoading(true);
      const rendimientoData = {
        uid: selectedUser.uid,
        periodo: newRendimiento.periodo,
        capital: parseFloat(newRendimiento.capital),
        rendimiento_pct: newRendimiento.rendimiento_pct ? parseFloat(newRendimiento.rendimiento_pct) : 0,
        rendimiento_mxn: newRendimiento.rendimiento_mxn ? parseFloat(newRendimiento.rendimiento_mxn) : 0,
        balance: newRendimiento.balance ? parseFloat(newRendimiento.balance) : 0,
        notas: newRendimiento.notas || ''
      };

      const result = await RendimientosService.createRendimiento(rendimientoData);
      if (result.success) {
        await loadUserRendimientos(selectedUser.uid);
        setNewRendimiento({
          periodo: '',
          capital: '',
          rendimiento_pct: '',
          rendimiento_mxn: '',
          balance: '',
          notas: ''
        });
        setShowCreateRendimiento(false);
        setError(null);
      } else {
        setError(result.error || 'Error creando rendimiento');
      }
    } catch (err: any) {
      setError(err.message || 'Error creando rendimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRendimiento = (rendimiento: Rendimiento) => {
    setEditingRendimiento(rendimiento);
    setShowEditRendimiento(true);
  };

  const handleUpdateRendimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRendimiento) return;

    try {
      setLoading(true);
      const updateData = {
        periodo: newRendimiento.periodo || editingRendimiento.periodo,
        capital: newRendimiento.capital ? parseFloat(newRendimiento.capital) : editingRendimiento.capital,
        rendimiento_pct: newRendimiento.rendimiento_pct ? parseFloat(newRendimiento.rendimiento_pct) : editingRendimiento.rendimiento_pct,
        rendimiento_mxn: newRendimiento.rendimiento_mxn ? parseFloat(newRendimiento.rendimiento_mxn) : editingRendimiento.rendimiento_mxn,
        balance: newRendimiento.balance ? parseFloat(newRendimiento.balance) : editingRendimiento.balance,
        notas: newRendimiento.notas || editingRendimiento.notas || ''
      };

      const result = await RendimientosService.updateRendimiento(editingRendimiento.id, updateData);
      if (result.success && selectedUser) {
        await loadUserRendimientos(selectedUser.uid);
        setEditingRendimiento(null);
        setShowEditRendimiento(false);
        setNewRendimiento({
          periodo: '',
          capital: '',
          rendimiento_pct: '',
          rendimiento_mxn: '',
          balance: '',
          notas: ''
        });
        setError(null);
      } else {
        setError(result.error || 'Error actualizando rendimiento');
      }
    } catch (err: any) {
      setError(err.message || 'Error actualizando rendimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRendimiento = async (rendimientoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rendimiento?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await RendimientosService.deleteRendimiento(rendimientoId);
      if (result.success && selectedUser) {
        await loadUserRendimientos(selectedUser.uid);
        setError(null);
      } else {
        setError(result.error || 'Error eliminando rendimiento');
      }
    } catch (err: any) {
      setError(err.message || 'Error eliminando rendimiento');
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
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
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Importar Datos
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'global'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rendimiento Global
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

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Usuarios */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Usuarios</h3>
              <span className="text-sm text-gray-500">({filteredUsers.length})</span>
            </div>
            
            {/* Barra de búsqueda */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por email..."
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

        {/* Detalles del Usuario y Rendimientos */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* Información del Usuario */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Rendimientos de {selectedUser.email}
                  </h3>
                  <button
                    onClick={() => setShowCreateRendimiento(true)}
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
                                onClick={() => handleEditRendimiento(rendimiento)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteRendimiento(rendimiento.id)}
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
              <p className="text-gray-500">Elige un usuario de la lista para ver y gestionar sus rendimientos.</p>
            </div>
          )}
        </div>
      </div>
      )}


      {activeTab === 'import' && (
        <DataImportForm />
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

      {/* Modal para Crear Rendimiento */}
      {showCreateRendimiento && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Agregar Rendimiento para {selectedUser.email}
            </h3>
            <form onSubmit={handleCreateRendimiento} className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Período (YYYY-MM)
                     </label>
                     <DatePicker
                       value={newRendimiento.periodo}
                       onChange={(value) => setNewRendimiento({...newRendimiento, periodo: value})}
                       placeholder="2024-01"
                       className="w-full"
                     />
                   </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capital
                </label>
                <input
                  type="number"
                  value={newRendimiento.capital}
                  onChange={(e) => setNewRendimiento({...newRendimiento, capital: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rendimiento % (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newRendimiento.rendimiento_pct}
                  onChange={(e) => setNewRendimiento({...newRendimiento, rendimiento_pct: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rendimiento MXN (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newRendimiento.rendimiento_mxn}
                  onChange={(e) => setNewRendimiento({...newRendimiento, rendimiento_mxn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newRendimiento.balance}
                  onChange={(e) => setNewRendimiento({...newRendimiento, balance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={newRendimiento.notas}
                  onChange={(e) => setNewRendimiento({...newRendimiento, notas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateRendimiento(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Rendimiento */}
      {showEditRendimiento && editingRendimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Editar Rendimiento
            </h3>
            <form onSubmit={handleUpdateRendimiento} className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Período (YYYY-MM)
                     </label>
                     <DatePicker
                       value={newRendimiento.periodo || editingRendimiento.periodo}
                       onChange={(value) => setNewRendimiento({...newRendimiento, periodo: value})}
                       placeholder="2024-01"
                       className="w-full"
                     />
                   </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capital
                </label>
                <input
                  type="number"
                  defaultValue={editingRendimiento.capital}
                  onChange={(e) => setNewRendimiento({...newRendimiento, capital: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rendimiento % (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingRendimiento.rendimiento_pct}
                  onChange={(e) => setNewRendimiento({...newRendimiento, rendimiento_pct: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rendimiento MXN (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingRendimiento.rendimiento_mxn}
                  onChange={(e) => setNewRendimiento({...newRendimiento, rendimiento_mxn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingRendimiento.balance}
                  onChange={(e) => setNewRendimiento({...newRendimiento, balance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  defaultValue={editingRendimiento.notas}
                  onChange={(e) => setNewRendimiento({...newRendimiento, notas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditRendimiento(false);
                    setEditingRendimiento(null);
                    setNewRendimiento({
                      periodo: '',
                      capital: '',
                      rendimiento_pct: '',
                      rendimiento_mxn: '',
                      balance: '',
                      notas: ''
                    });
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
    </div>
  );
}
