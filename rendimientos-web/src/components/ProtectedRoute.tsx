import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario es administrador
  const isAdmin = user.email?.includes('admin') || 
                 user.email === 'admin@test.com' ||
                 user.email === 'victorgallo.financiero@gmail.com' ||
                 user.email === 'test3@gmail.com';

  if (requireAdmin) {
    // Si requiere admin y no es admin, mostrar error
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Email actual: {user.email}
            </p>
            <div className="space-y-2">
              <a 
                href="/app" 
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir al Dashboard
              </a>
              <button 
                onClick={() => window.history.back()} 
                className="block w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      );
    }
  } else {
    // Si NO requiere admin pero el usuario ES admin, redirigir al panel de admin
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
}
