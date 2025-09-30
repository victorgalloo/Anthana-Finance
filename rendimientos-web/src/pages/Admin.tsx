import { Navbar } from '../components/Navbar';
import { RendimientosList } from '../components/RendimientosList';

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h2>
            <p className="text-gray-600">
              Gestiona todos los rendimientos del sistema
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Rendimientos del Sistema
              </h3>
              <RendimientosList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
