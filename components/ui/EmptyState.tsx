import React from 'react';

interface ActionButton {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode | ActionButton;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  const renderAction = () => {
    if (!action) return null;
    
    if (typeof action === 'object' && 'label' in action && 'onClick' in action) {
      return (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          {action.label}
        </button>
      );
    }
    
    return action;
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center size-20 rounded-full bg-gray-100 dark:bg-white/5 mb-4">
        <span className="material-symbols-outlined text-4xl opacity-40">{icon}</span>
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {description && <p className="text-sm opacity-60 mb-4 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{renderAction()}</div>}
    </div>
  );
};

export default EmptyState;
