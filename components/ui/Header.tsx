import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, actions, breadcrumbs }) => {
  return (
    <div className="mb-6 sm:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-xs sm:text-sm mb-3 sm:mb-4 overflow-x-auto pb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="material-symbols-outlined text-xs opacity-30 flex-shrink-0">chevron_right</span>
              )}
              <span className={`whitespace-nowrap ${index === breadcrumbs.length - 1 ? 'font-bold text-primary' : 'opacity-50 hover:opacity-70 transition-opacity'}`}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

