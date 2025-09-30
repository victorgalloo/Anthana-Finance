import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginMinimal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isRegistering 
        ? await register(email, password)
        : await login(email, password);

      if (result.success) {
        navigate('/app');
      } else {
        setError(result.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Decorative checkmarks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-8xl text-blue-200 font-thin opacity-30 transform -rotate-12">✓</div>
        <div className="absolute bottom-1/5 right-1/4 text-8xl text-indigo-200 font-thin opacity-30 transform rotate-12">✓</div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Rendimientos
            </h1>
            <p className="text-xl font-semibold text-gray-800 mb-1">
              {isRegistering ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
            </p>
            <p className="text-sm text-gray-600">
              {isRegistering ? 'Regístrate para acceder a tu dashboard' : 'Inicia sesión para acceder a tu dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
                placeholder="Tu contraseña"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-lg">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              disabled={loading}
            >
              {loading 
                ? (isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...') 
                : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')
              }
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="text-blue-600 text-sm cursor-pointer underline transition-colors duration-200 hover:text-blue-700"
            >
              {isRegistering ? '¿Ya tienes cuenta? Iniciar Sesión' : '¿No tienes cuenta? Crear una'}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            © 2024 Rendimientos. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
}