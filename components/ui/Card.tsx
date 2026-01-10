import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  onClick 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
  };

  return (
    <div
      className={`bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 backdrop-blur-sm ${paddingClasses[padding]} ${
        hover ? 'hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer' : 'shadow-sm'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconColor = 'bg-gradient-to-br from-primary to-orange-500',
  trend,
  onClick
}) => {
  return (
    <Card hover onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-60 mb-2">{title}</p>
          <p className="text-4xl font-black tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <span
                className={`material-symbols-outlined text-base ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? 'trending_up' : 'trending_down'}
              </span>
              <span className={`text-sm font-bold ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`${iconColor} rounded-xl p-4 text-white shadow-lg shadow-primary/10`}>
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
      </div>
    </Card>
  );
};

export default Card;
