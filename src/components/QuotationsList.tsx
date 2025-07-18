import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Quotation, FilterType, User } from '../types';
import QuotationCard from './QuotationCard';
import QuotationDetailModal from './QuotationDetailModal';
import NewQuotationModal from './NewQuotationModal';

interface QuotationsListProps {
  quotations: Quotation[];
  onUpdateQuotation: (updatedQuotation: Quotation) => void;
  onAddQuotation: (newQuotation: Omit<Quotation, 'id'>) => void;
  onDeleteQuotation: (quotationId: string) => void;
  currentUser: User;
}

export default function QuotationsList({ 
  quotations, 
  onUpdateQuotation, 
  onAddQuotation, 
  onDeleteQuotation,
  currentUser
}: QuotationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewQuotationModal, setShowNewQuotationModal] = useState(false);

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || quotation.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusCount = (status: string) => {
    return quotations.filter(q => q.status === status).length;
  };

  const handleQuotationClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedQuotation(null);
  };

  const handleUpdateQuotation = (updatedQuotation: Quotation) => {
    onUpdateQuotation(updatedQuotation);
    setSelectedQuotation(updatedQuotation);
  };

  const handleDeleteQuotation = (quotationId: string) => {
    onDeleteQuotation(quotationId);
    setShowDetailModal(false);
    setSelectedQuotation(null);
  };

  const handleNewQuotation = () => {
    setShowNewQuotationModal(true);
  };

  const handleCloseNewQuotationModal = () => {
    setShowNewQuotationModal(false);
  };

  const handleAddQuotation = (newQuotation: Omit<Quotation, 'id'>) => {
    onAddQuotation(newQuotation);
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleStatusChange = (quotationId: string, newStatus: 'pendiente' | 'aprobada' | 'rechazada') => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (quotation) {
      const updatedQuotation = { ...quotation, status: newStatus };
      onUpdateQuotation(updatedQuotation);
    }
  };

  const getFilterButtonStyle = (filter: FilterType) => {
    const isActive = activeFilter === filter;
    const baseStyle = "p-6 bg-white border-2 rounded-2xl hover:shadow-lg transition-all duration-200 text-left cursor-pointer transform hover:-translate-y-1";
    
    if (isActive) {
      return `${baseStyle} border-blue-500 bg-blue-50 shadow-lg`;
    }
    return `${baseStyle} border-gray-200 hover:border-gray-300`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu flujo de trabajo de cotizaciones
            {currentUser.role === 'admin' && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                Administrador
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={handleNewQuotation}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </button>
      </div>

      {/* Clickable Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => handleFilterClick('all')}
          className={getFilterButtonStyle('all')}
        >
          <div className="text-2xl font-bold text-gray-900">{quotations.length}</div>
          <div className="text-sm text-gray-600">Total Cotizaciones</div>
        </div>
        <div 
          onClick={() => handleFilterClick('aprobada')}
          className={getFilterButtonStyle('aprobada')}
        >
          <div className="text-2xl font-bold text-emerald-600">{getStatusCount('aprobada')}</div>
          <div className="text-sm text-gray-600">Aprobadas</div>
        </div>
        <div 
          onClick={() => handleFilterClick('pendiente')}
          className={getFilterButtonStyle('pendiente')}
        >
          <div className="text-2xl font-bold text-amber-600">{getStatusCount('pendiente')}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div 
          onClick={() => handleFilterClick('rechazada')}
          className={getFilterButtonStyle('rechazada')}
        >
          <div className="text-2xl font-bold text-red-600">{getStatusCount('rechazada')}</div>
          <div className="text-sm text-gray-600">Rechazadas</div>
        </div>
      </div>

      {/* Search Only */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cotizaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quotations Grid */}
      {filteredQuotations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuotations.map((quotation) => (
            <QuotationCard 
              key={quotation.id} 
              quotation={quotation} 
              onClick={() => handleQuotationClick(quotation)}
              currentUser={currentUser}
              onStatusChange={currentUser.role === 'admin' ? handleStatusChange : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron cotizaciones</h3>
          <p className="text-gray-600">Intenta ajustar tus criterios de búsqueda o filtro</p>
        </div>
      )}

      {/* Modals */}
      {selectedQuotation && (
        <QuotationDetailModal
          quotation={selectedQuotation}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          onUpdate={handleUpdateQuotation}
          onDelete={handleDeleteQuotation}
          currentUser={currentUser}
        />
      )}

      <NewQuotationModal
        isOpen={showNewQuotationModal}
        onClose={handleCloseNewQuotationModal}
        onSubmit={handleAddQuotation}
      />
    </div>
  );
}