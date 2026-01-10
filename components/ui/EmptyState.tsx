import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center size-20 rounded-full bg-gray-100 dark:bg-white/5 mb-4">
        <span className="material-symbols-outlined text-4xl opacity-40">{icon}</span>
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {description && <p className="text-sm opacity-60 mb-4 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
