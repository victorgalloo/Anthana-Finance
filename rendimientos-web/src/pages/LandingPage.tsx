import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">Dezentral</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#beneficios" className="text-gray-600 hover:text-blue-600 transition-colors">Beneficios</a>
              <a href="#funcionamiento" className="text-gray-600 hover:text-blue-600 transition-colors">¿Cómo funciona?</a>
              <a href="#testimonios" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonios</a>
              <a href="#contacto" className="text-gray-600 hover:text-blue-600 transition-colors">Contacto</a>
            </nav>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Construye tu Futuro Financiero con{' '}
              <span className="text-blue-600">Dezentral</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Tomar el control de tus finanzas es el primer paso hacia la libertad. Te damos las herramientas y el conocimiento para que cada decisión cuente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRegister}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Comienza Ahora
              </button>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors">
                Saber Más
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tu Éxito es Nuestro Objetivo</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre cómo Dezentral puede transformar tu vida financiera con beneficios claros y tangibles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Métricas Claras</h3>
              <p className="text-gray-600">
                Visualiza tu progreso con dashboards intuitivos. Entiende de dónde viene y a dónde va tu dinero.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seguridad Total</h3>
              <p className="text-gray-600">
                Tu información es confidencial y está protegida con los más altos estándares de seguridad.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Asesoría Experta</h3>
              <p className="text-gray-600">
                Accede a una red de asesores financieros listos para guiarte en cada paso de tu camino.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionamiento Section */}
      <section id="funcionamiento" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Alcanza tus Metas en 3 Simples Pasos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestro proceso está diseñado para ser sencillo, rápido y efectivo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Regístrate</h3>
              <p className="text-gray-600">
                Crea tu cuenta en menos de un minuto y completa tu perfil inicial.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Conecta</h3>
              <p className="text-gray-600">
                Vincula tus servicios o elige las herramientas que necesitas para empezar.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Crece</h3>
              <p className="text-gray-600">
                Monitorea tu progreso, ajusta tu estrategia y ve crecer tu patrimonio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Historias de Éxito Reales</h2>
            <p className="text-xl text-gray-600">
              Nuestros clientes son nuestra mejor carta de presentación.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  LC
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Laura C.</h4>
                  <p className="text-gray-600 text-sm">Emprendedora</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Dezentral cambió mi perspectiva sobre el dinero. Por primera vez, siento que tengo el control total de mi futuro financiero. ¡El panel de control es increíble!"
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  MG
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Miguel G.</h4>
                  <p className="text-gray-600 text-sm">Ingeniero</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "La facilidad de uso y la calidad de la asesoría son inigualables. Pude trazar un plan de ahorro para la educación de mis hijos que antes veía imposible."
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  SR
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sofía R.</h4>
                  <p className="text-gray-600 text-sm">Diseñadora Gráfica</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Lo que más valoro es la seguridad y la transparencia. Sé que mis datos están seguros y entiendo cada movimiento. Totalmente recomendado."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Dashboard Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Visualiza tu Crecimiento en Tiempo Real</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Te presentamos tu futuro panel de control. Una herramienta poderosa y fácil de usar para monitorear cada aspecto de tu prosperidad.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Panel Principal</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  UD
                </div>
                <span className="text-gray-600">USUARIO DEMOSTRACIÓN</span>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h4 className="text-4xl font-bold text-gray-900 mb-2">BALANCE TOTAL</h4>
              <p className="text-3xl font-bold text-green-600">$152,480.75 USD</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Depósitos Totales</p>
                <p className="text-xl font-semibold text-gray-900">$185,000.00</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Beneficios Totales</p>
                <p className="text-xl font-semibold text-green-600">$18,980.75</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Retiros Totales</p>
                <p className="text-xl font-semibold text-gray-900">$51,500.00</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <button
                  onClick={handleRegister}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Abrir mi Cuenta Gratis
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Dezentral</h3>
              <p className="text-gray-300 mb-4">
                Transformando tu relación con el dinero para un futuro próspero y seguro.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Navegación</h4>
              <ul className="space-y-2">
                <li><a href="#beneficios" className="text-gray-300 hover:text-white transition-colors">Beneficios</a></li>
                <li><a href="#funcionamiento" className="text-gray-300 hover:text-white transition-colors">Funcionamiento</a></li>
                <li><a href="#testimonios" className="text-gray-300 hover:text-white transition-colors">Testimonios</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Términos y Condiciones</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><a href="#contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              Av. Siempre Viva 123, Zapopan, Jalisco | hola@dezentral.mx
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
