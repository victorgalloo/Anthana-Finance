interface ChartNewProps {
  data: number[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  gradient?: boolean;
}

export function ChartNew({ 
  data, 
  color = '#3B82F6', 
  height = 60, 
  showGrid = true,
  showDots = false,
  gradient = true 
}: ChartNewProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = range === 0 ? 50 : ((max - value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="w-full" style={{ height }}>
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Grid pattern */}
          {showGrid && (
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#F3F4F6" strokeWidth="0.5"/>
            </pattern>
          )}
          
          {/* Gradient definition */}
          {gradient && (
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
            </linearGradient>
          )}
        </defs>
        
        {/* Grid */}
        {showGrid && (
          <rect width="100" height="100" fill="url(#grid)" />
        )}
        
        {/* Area fill */}
        {gradient ? (
          <polygon
            points={areaPoints}
            fill="url(#chartGradient)"
          />
        ) : (
          <polygon
            points={areaPoints}
            fill={color}
            fillOpacity="0.1"
          />
        )}
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {showDots && data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = range === 0 ? 50 : ((max - value) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
}
