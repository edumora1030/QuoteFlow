import React from 'react';
import { Calendar, DollarSign, User, CheckCircle, XCircle, Clock, FileText, CreditCard, ChevronDown } from 'lucide-react';
import { Quotation, User as UserType } from '../types';

interface QuotationCardProps {
  quotation: Quotation;
  onClick: () => void;
  currentUser: UserType;
  onStatusChange?: (quotationId: string, newStatus: 'pendiente' | 'aprobada' | 'rechazada') => void;
}

export default function QuotationCard({ quotation, onClick, currentUser, onStatusChange }: QuotationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobada': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobada': return <CheckCircle className="w-4 h-4" />;
      case 'rechazada': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aprobada': return 'Aprobada';
      case 'rechazada': return 'Rechazada';
      case 'pendiente': return 'Pendiente';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as 'pendiente' | 'aprobada' | 'rechazada';
    if (onStatusChange) {
      onStatusChange(quotation.id, newStatus);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on the status dropdown
    if ((e.target as HTMLElement).tagName === 'SELECT') {
      return;
    }
    onClick();
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{quotation.title}</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span className="text-sm">{quotation.client}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' ? (
            <div className="relative">
              <select
                value={quotation.status}
                onChange={handleStatusChange}
                onClick={(e) => e.stopPropagation()}
                className={`appearance-none px-3 py-1 pr-8 rounded-full border text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(quotation.status)}`}
              >
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(quotation.status)}`}>
              {getStatusIcon(quotation.status)}
              <span className="text-sm font-medium">{getStatusLabel(quotation.status)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-2">{quotation.description}</p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-lg font-bold text-gray-900">{formatCurrency(quotation.amount)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{new Date(quotation.date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="space-y-3">
        {/* Purchase Order */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Orden de Compra</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            quotation.status === 'aprobada' && quotation.purchaseOrderFile
              ? 'bg-emerald-100 text-emerald-800'
              : quotation.status === 'aprobada'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {quotation.status === 'aprobada' && quotation.purchaseOrderFile
              ? 'Creada'
              : quotation.status === 'aprobada'
              ? 'Pendiente'
              : 'N/A'
            }
          </div>
        </div>

        {/* Invoice */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Factura Final</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            quotation.invoiceFile
              ? 'bg-emerald-100 text-emerald-800'
              : quotation.status === 'aprobada' && quotation.purchaseOrderFile
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {quotation.invoiceFile
              ? 'Generada'
              : quotation.status === 'aprobada' && quotation.purchaseOrderFile
              ? 'Pendiente'
              : 'N/A'
            }
          </div>
        </div>

        {/* Payment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Pago</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            quotation.invoicePaid
              ? 'bg-emerald-100 text-emerald-800'
              : quotation.invoiceFile
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {quotation.invoicePaid
              ? 'Pagado'
              : quotation.invoiceFile
              ? 'Pendiente'
              : 'N/A'
            }
          </div>
        </div>
      </div>
    </div>
  );
}