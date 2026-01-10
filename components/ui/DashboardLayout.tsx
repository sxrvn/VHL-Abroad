import React, { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  brandText?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, sidebar, brandText = 'VHL' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-[#0a0f1e] dark:via-[#0f1420] dark:to-[#0a0f1e] overflow-x-hidden">
      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 dark:bg-[#0a0f1e]/90 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 z-30 backdrop-blur-md shadow-sm">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="size-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-primary text-xl">
            {isMobileOpen ? 'close' : 'menu'}
          </span>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="text-primary size-7 flex-shrink-0">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-base font-black tracking-tight text-gray-900 dark:text-white">
            {brandText} <span className="text-primary">LEARN</span>
          </h1>
        </div>
        
        <div className="w-10 flex-shrink-0" />
      </div>

      {/* Layout Container */}
      <div className="flex min-h-screen">
        {/* Sidebar - Pass mobile state and desktop collapse state */}
        {React.cloneElement(sidebar as React.ReactElement, { 
          isMobileOpen, 
          setIsMobileOpen,
          isDesktopCollapsed,
          setIsDesktopCollapsed
        })}

        {/* Main Content Area - Dynamic margin based on sidebar state */}
        <main className={`flex-1 w-full pt-14 lg:pt-0 overflow-x-hidden transition-all duration-300 ${
          isDesktopCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          <div className="min-h-screen w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
