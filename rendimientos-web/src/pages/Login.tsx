import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin 
        ? await login(email, password)
        : await register(email, password);

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Top line */}
      <div className="w-full max-w-md mb-8">
        <div className="h-px bg-black"></div>
      </div>

      {/* Main content */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-black mb-4">Rendimientos</h1>
        <p className="text-lg text-black mb-8">Sistema de gestión financiera</p>
        
        <h2 className="text-2xl font-bold text-black mb-2">¡Bienvenido!</h2>
        <p className="text-black">Inicia sesión para acceder a tu dashboard</p>
      </div>

      {/* Login form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Procesando...' : 'Iniciar Sesión'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-black hover:text-gray-600 text-sm font-medium transition-colors"
          >
            {isLogin ? 'Crear nueva cuenta' : 'Iniciar sesión'}
          </button>
        </div>
      </form>

      {/* Bottom line */}
      <div className="w-full max-w-md mt-12">
        <div className="h-px bg-black"></div>
      </div>

      {/* Power/Gauge icon */}
      <div className="mt-16 flex justify-center">
        <div className="relative">
          {/* Arc */}
          <div className="w-32 h-16 border-8 border-black border-b-0 rounded-t-full"></div>
          {/* Vertical bar */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-16 bg-black rounded-t-full"></div>
        </div>
      </div>
    </div>
  );
}
