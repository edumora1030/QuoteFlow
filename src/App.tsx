import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import QuotationsList from './components/QuotationsList';
import Account from './components/Account';
import { AuthState, User, Quotation } from './types';
import { authService } from './services/authService';
import { quotationService } from './services/quotationService';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [activeTab, setActiveTab] = useState('quotations');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (user: User) => {
    setIsLoading(true);
    setAuthState({
      isAuthenticated: true,
      user
    });
    
    // Load quotations after login
    const quotationsData = await quotationService.getQuotations();
    setQuotations(quotationsData);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    setQuotations([]);
    setActiveTab('quotations');
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleUpdateQuotation = async (updatedQuotation: Quotation) => {
    const result = await quotationService.updateQuotation(updatedQuotation);
    if (result) {
      setQuotations(prev =>
        prev.map(q => q.id === updatedQuotation.id ? result : q)
      );
    }
  };

  const handleAddQuotation = async (newQuotationData: Omit<Quotation, 'id'>) => {
    if (!authState.user) return;
    
    const result = await quotationService.createQuotation(newQuotationData, authState.user.id);
    if (result) {
      setQuotations(prev => [result, ...prev]);
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    const success = await quotationService.deleteQuotation(quotationId);
    if (success) {
      setQuotations(prev => prev.filter(q => q.id !== quotationId));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'quotations':
        return (
          <QuotationsList
            quotations={quotations}
            onUpdateQuotation={handleUpdateQuotation}
            onAddQuotation={handleAddQuotation}
            onDeleteQuotation={handleDeleteQuotation}
            currentUser={authState.user!}
          />
        );
      case 'account':
        return (
          <Account 
            user={authState.user!} 
            onUserUpdate={(updatedUser) => {
              setAuthState(prev => ({ ...prev, user: updatedUser }));
            }} 
          />
        );
      default:
        return (
          <QuotationsList
            quotations={quotations}
            onUpdateQuotation={handleUpdateQuotation}
            onAddQuotation={handleAddQuotation}
            onDeleteQuotation={handleDeleteQuotation}
            currentUser={authState.user!}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!authState.isAuthenticated ? (
        <LoginScreen key="login" onLogin={handleLogin} />
      ) : (
        <MainApp
          key="main"
          authState={authState}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
          renderContent={renderContent}
          isLoading={isLoading}
        />
      )}
    </AnimatePresence>
  );
}

interface MainAppProps {
  authState: AuthState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
  renderContent: () => React.ReactNode;
  isLoading: boolean;
}

function MainApp({
  authState,
  activeTab,
  setActiveTab,
  sidebarOpen,
  toggleSidebar,
  handleLogout,
  renderContent,
  isLoading
}: MainAppProps) {
  return (
    <motion.div
      key="main-app"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex h-full bg-gray-50"
    >
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        user={authState.user!}
      />
  
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </motion.div>
  );
}

export default App;