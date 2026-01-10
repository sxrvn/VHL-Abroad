import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <div className="flex items-center justify-center py-12">
      <span className={`material-symbols-outlined animate-spin text-primary ${sizes[size]}`}>
        progress_activity
      </span>
    </div>
  );
};

export default LoadingSpinner;
