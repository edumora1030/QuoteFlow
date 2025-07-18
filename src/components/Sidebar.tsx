import React from 'react';
import { FileText, User, LogOut, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  user: UserType;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, isOpen, toggleSidebar, user }: SidebarProps) {
  const menuItems = [
    { id: 'quotations', label: 'Cotizaciones', icon: FileText },
    { id: 'account', label: 'Cuenta', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Ancho reducido a 64 (w-64) */}
      <div className={`
        fixed lg:relative left-0 top-0 bottom-0 h-full w-64 bg-white z-50 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:z-auto
        shadow-xl border-r border-gray-100
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl">QuoteFlow</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="p-6 flex-shrink-0 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 text-left group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-red-600 group-hover:text-red-700" />
            <span className="font-medium text-red-600 group-hover:text-red-700">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-white rounded-lg shadow-md border border-gray-100"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
    </>
  );
}