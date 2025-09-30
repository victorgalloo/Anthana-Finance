import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon?: ReactNode;
  iconBg?: string;
}

export function MetricCard({ title, value, change, icon, iconBg }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg || 'bg-gradient-to-br from-gray-500 to-gray-600'} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
          {value}
        </p>
        
        {change && (
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              change.type === 'increase' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <svg 
                className={`w-3 h-3 mr-1 ${change.type === 'increase' ? 'rotate-0' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              {change.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}