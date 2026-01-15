import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  onClick?: () => void;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  userInfo?: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
  brandText?: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDesktopCollapsed?: boolean;
  setIsDesktopCollapsed?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  items, 
  userInfo, 
  onLogout, 
  brandText = 'VHL', 
  isMobileOpen, 
  setIsMobileOpen,
  isDesktopCollapsed = false,
  setIsDesktopCollapsed
}) => {
  const location = useLocation();

  const isActive = (item: SidebarItem) => {
    if (item.path) {
      return location.pathname === item.path || location.search.includes(item.id);
    }
    return false;
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-2 size-11 flex-shrink-0 shadow-lg shadow-primary/10">
            <img src="/assets/red-logo.png" alt="VHL Logo" className="w-full h-full object-contain" width="150" height="50" />
          </div>
          {!isDesktopCollapsed && (
            <h1 className="text-lg font-black tracking-tight whitespace-nowrap text-white">
              {brandText} <span className="text-primary">LEARN</span>
            </h1>
          )}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((item) => {
          const active = isActive(item);
          
          const sharedClassName = `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left relative overflow-hidden ${
            active
              ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/10'
              : 'text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-md hover:scale-[1.02]'
          }`;

          return item.path ? (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={sharedClassName}
            >
              <span className={`material-symbols-outlined text-xl flex-shrink-0 transition-transform ${active ? '' : 'group-hover:scale-110'}`}>{item.icon}</span>
              {!isDesktopCollapsed && (
                <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>
              )}
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              {active && !isDesktopCollapsed && !item.badge && (
                <div className="absolute right-2 size-2 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          ) : (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              type="button"
              className={sharedClassName}
            >
              <span className={`material-symbols-outlined text-xl flex-shrink-0 transition-transform ${active ? '' : 'group-hover:scale-110'}`}>{item.icon}</span>
              {!isDesktopCollapsed && (
                <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>
              )}
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              {active && !isDesktopCollapsed && !item.badge && (
                <div className="absolute right-2 size-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout at bottom */}
      <div className="border-t border-white/10">
        {/* User Profile */}
        {userInfo && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="size-11 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-primary/10">
                <span className="material-symbols-outlined text-xl">person</span>
              </div>
              {!isDesktopCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{userInfo.name}</p>
                  <p className="text-xs text-gray-400 truncate">{userInfo.role}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Logout Button */}
        {onLogout && (
          <div className="p-4">
            <button
              onClick={() => {
                onLogout();
                setIsMobileOpen(false);
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full text-left border border-red-500/20 hover:border-red-500/40"
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0 group-hover:scale-110 transition-transform">logout</span>
              {!isDesktopCollapsed && <span className="font-semibold text-sm">Sign Out</span>}
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-gradient-to-b from-[#0a0f1e] via-[#1a1f35] to-[#0a0f1e] border-r border-white/10 transition-all duration-300 z-40 shadow-2xl ${
          isDesktopCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsDesktopCollapsed?.(!isDesktopCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 size-8 bg-[#1a1f35] border-2 border-[#2a3f5f] rounded-full flex items-center justify-center transition-all shadow-lg text-white hover:bg-[#2a3f5f]"
          aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-base font-bold">
            {isDesktopCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside 
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#0a0f1e] via-[#1a1f35] to-[#0a0f1e] border-r border-white/10 z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
