import React from 'react';
import { Calendar, DollarSign, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Quotation, User as UserType } from '../../types';

interface QuotationBasicInfoProps {
  quotation: Quotation;
  isEditing: boolean;
  currentUser: UserType;
  onFieldChange: (field: keyof Quotation, value: string | number) => void;
}

export default function QuotationBasicInfo({
  quotation,
  isEditing,
  currentUser,
  onFieldChange
}: QuotationBasicInfoProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobada': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobada': return <CheckCircle className="w-5 h-5" />;
      case 'rechazada': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={quotation.title}
                  onChange={(e) => onFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <input
                  type="text"
                  value={quotation.client}
                  onChange={(e) => onFieldChange('client', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monto ($)</label>
                <input
                  type="number"
                  value={quotation.amount}
                  onChange={(e) => onFieldChange('amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {currentUser.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={quotation.status}
                    onChange={(e) => onFieldChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{quotation.title}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Cliente: {quotation.client}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Monto: {formatCurrency(quotation.amount)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Fecha: {new Date(quotation.date).toLocaleDateString()}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
          {isEditing ? (
            <textarea
              value={quotation.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-600 leading-relaxed">{quotation.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Status */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Estado Actual</h4>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${getStatusColor(quotation.status)}`}>
            {getStatusIcon(quotation.status)}
            <span className="font-medium">{getStatusLabel(quotation.status)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}