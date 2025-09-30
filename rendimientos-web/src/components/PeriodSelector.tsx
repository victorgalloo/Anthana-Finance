
interface PeriodSelectorProps {
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
}

export function PeriodSelector({ selectedPeriod, onSelectPeriod }: PeriodSelectorProps) {
  const periods = [
    { value: '12 meses', label: '12 meses' },
    { value: '30 días', label: '30 días' },
    { value: '7 días', label: '7 días' },
    { value: '24 horas', label: '24 horas' }
  ];

  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onSelectPeriod(period.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedPeriod === period.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}