import React from 'react';
import { Result } from '../../types';

interface ProgressChartProps {
  data: { date: string; value: number }[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  title?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  height = 200,
  color = '#667eea',
  showGrid = true,
  title
}) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 rounded-xl"
        style={{ height }}
      >
        <p className="text-sm opacity-50">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;
  const width = 100;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * chartWidth + padding;
    const y = height - ((item.value - minValue) / range) * chartHeight - padding;
    return { x, y, value: item.value, date: item.date };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-bold mb-3">{title}</h3>}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = height - (percent / 100) * chartHeight - padding;
              return (
                <line
                  key={percent}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.2"
                  strokeDasharray="1,1"
                />
              );
            })}
          </g>
        )}

        {/* Area fill */}
        <path
          d={areaD}
          fill={color}
          opacity="0.1"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill={color}
              className="transition-all hover:r-2"
            >
              <title>{`${point.date}: ${point.value}%`}</title>
            </circle>
          </g>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-4 text-xs opacity-60">
        <span>{data[0]?.date}</span>
        {data.length > 2 && (
          <span className="hidden sm:inline">
            {data[Math.floor(data.length / 2)]?.date}
          </span>
        )}
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};

interface PerformanceTrendProps {
  results: Result[];
  className?: string;
}

export const PerformanceTrend: React.FC<PerformanceTrendProps> = ({ results, className = '' }) => {
  const chartData = results
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(result => ({
      date: new Date(result.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: result.percentage
    }));

  return (
    <div className={className}>
      <ProgressChart
        data={chartData}
        title="Exam Performance Trend"
        color="#10b981"
        height={180}
      />
    </div>
  );
};

export default ProgressChart;
