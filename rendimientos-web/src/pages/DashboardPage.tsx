import { MetricCard } from '../components/MetricCard';
import { SimpleRendimientosTable } from '../components/SimpleRendimientosTable';
import { useContractsTotal } from '../hooks/useContractsTotal';
import { WithdrawalButton } from '../components/WithdrawalButton';
import { DepositButton } from '../components/DepositButton';

export default function DashboardPage() {
  const { totalAmount, loading: contractsLoading } = useContractsTotal();

  return (
    <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Resumen completo de tus rendimientos e inversiones
            </p>
          </div>
          
          <div className="flex space-x-3">
            <DepositButton />
            <WithdrawalButton />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title="Rendimiento Total"
            value="$235,000"
            change={{ value: "7.4%", type: "increase" }}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          
          <MetricCard
            title="Balance Actual"
            value="$150,000"
            change={{ value: "9.2%", type: "increase" }}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          
          <MetricCard
            title="Rendimiento %"
            value="17.0%"
            change={{ value: "6.6%", type: "increase" }}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M18 14v4h-4m6 0l-4-4" />
              </svg>
            }
          />
          
          <MetricCard
            title="Inversiones Activas"
            value="12"
            change={{ value: "8.1%", type: "increase" }}
            iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          
          <MetricCard
            title="Total Contratos"
            value={contractsLoading ? "Cargando..." : `$${totalAmount.toLocaleString()}`}
            change={{ value: "0%", type: "increase" }}
            iconBg="bg-gradient-to-br from-indigo-500 to-indigo-600"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Rendimiento Mensual</h3>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-600">Gráfico de rendimiento</p>
                <p className="text-sm text-gray-500">Próximamente disponible</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Estadísticas Rápidas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mejor mes</p>
                    <p className="text-sm text-gray-600">Diciembre 2024</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">+12.5%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Promedio mensual</p>
                    <p className="text-sm text-gray-600">Últimos 12 meses</p>
                  </div>
                </div>
                <span className="text-blue-600 font-semibold">+8.2%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Tiempo activo</p>
                    <p className="text-sm text-gray-600">Desde el inicio</p>
                  </div>
                </div>
                <span className="text-purple-600 font-semibold">24 meses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Rendimientos Detallados</h3>
            <p className="text-sm text-gray-600 mt-1">Historial completo de tus inversiones</p>
          </div>
          <div className="p-6">
            <SimpleRendimientosTable />
          </div>
        </div>
      </div>
  );
}