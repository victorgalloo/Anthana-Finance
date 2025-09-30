import { useRendimientos } from '../hooks/useRendimientos';

export function RendimientosList() {
  const { rendimientos, loading, error, isAdmin } = useRendimientos();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (rendimientos.length === 0) {
    return (
      <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded mb-4">
        <p>No hay rendimientos registrados.</p>
        {isAdmin && (
          <p className="text-sm mt-1">Como administrador, puedes crear nuevos rendimientos.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
        <p className="font-semibold">
          {isAdmin ? 'Todos los Rendimientos' : 'Mis Rendimientos'}
        </p>
        <p className="text-sm">
          {isAdmin ? 'Vista de administrador - puedes gestionar todos los rendimientos' : 'Solo puedes ver tus propios rendimientos'}
        </p>
      </div>

      <div className="grid gap-4">
        {rendimientos.map((rendimiento) => (
          <div key={rendimiento.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Período: {rendimiento.periodo}
                </h3>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {rendimiento.capital && (
                    <div>
                      <span className="font-medium text-gray-600">Capital:</span>
                      <p className="text-gray-900">${rendimiento.capital.toLocaleString()}</p>
                    </div>
                  )}
                  {rendimiento.rendimiento_pct && (
                    <div>
                      <span className="font-medium text-gray-600">Rendimiento %:</span>
                      <p className="text-gray-900">{rendimiento.rendimiento_pct}%</p>
                    </div>
                  )}
                  {rendimiento.rendimiento_mxn && (
                    <div>
                      <span className="font-medium text-gray-600">Rendimiento $:</span>
                      <p className="text-gray-900">${rendimiento.rendimiento_mxn.toLocaleString()}</p>
                    </div>
                  )}
                  {rendimiento.balance && (
                    <div>
                      <span className="font-medium text-gray-600">Balance:</span>
                      <p className="text-gray-900">${rendimiento.balance.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {rendimiento.notas && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-600 text-sm">Notas:</span>
                    <p className="text-gray-700 text-sm">{rendimiento.notas}</p>
                  </div>
                )}
              </div>
              {isAdmin && (
                <div className="ml-4 flex space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm">
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
