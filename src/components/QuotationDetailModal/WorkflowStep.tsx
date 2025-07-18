import React from 'react';
import { Download, Trash2, DivideIcon as LucideIcon } from 'lucide-react';
import { QuotationFile } from '../../types';

interface WorkflowStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
  file: QuotationFile | null | undefined;
  status: string;
  canPerformAction: boolean;
  actionLabel: string;
  onAction: () => void;
  onFileDelete: () => void;
  disabledMessage?: string;
  iconColor: 'blue' | 'green' | 'emerald';
  canTogglePayment?: boolean;
  onTogglePayment?: () => void;
  isPaid?: boolean;
}

export default function WorkflowStep({
  title,
  description,
  icon: Icon,
  file,
  status,
  canPerformAction,
  actionLabel,
  onAction,
  onFileDelete,
  disabledMessage,
  iconColor,
  canTogglePayment = false,
  onTogglePayment,
  isPaid = false
}: WorkflowStepProps) {
  const getIconColorClasses = (color: string, hasFile: boolean) => {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center';
    
    if (hasFile) {
      switch (color) {
        case 'blue': return `${baseClasses} bg-blue-100 text-blue-600`;
        case 'green': return `${baseClasses} bg-green-100 text-green-600`;
        case 'emerald': return `${baseClasses} bg-emerald-100 text-emerald-600`;
        default: return `${baseClasses} bg-gray-200 text-gray-400`;
      }
    } else if (canPerformAction) {
      switch (color) {
        case 'blue': return `${baseClasses} bg-amber-100 text-amber-600`;
        case 'green': return `${baseClasses} bg-amber-100 text-amber-600`;
        case 'emerald': return `${baseClasses} bg-amber-100 text-amber-600`;
        default: return `${baseClasses} bg-gray-200 text-gray-400`;
      }
    } else {
      return `${baseClasses} bg-gray-200 text-gray-400`;
    }
  };

  const getStatusClasses = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    
    if (status === 'Creada' || status === 'Generada' || status === 'Pagado') {
      return `${baseClasses} bg-emerald-100 text-emerald-800`;
    } else if (status === 'Pendiente') {
      return `${baseClasses} bg-amber-100 text-amber-800`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-500`;
    }
  };

  const getFileIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'emerald': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  const handleDownload = (file: QuotationFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={getIconColorClasses(iconColor, !!file)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{title}</div>
            <div className="text-sm text-gray-600">{description}</div>
          </div>
        </div>
        <div className={getStatusClasses(status)}>
          {status}
        </div>
      </div>

      <div className="space-y-3">
        {file ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${getFileIconColor(iconColor)}`} />
              <div>
                <div className="font-medium text-gray-900">{file.name}</div>
                <div className="text-sm text-gray-600">
                  Subido el {new Date(file.uploadDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(file)}
                className={`p-2 hover:bg-${iconColor}-50 rounded-lg transition-colors ${getFileIconColor(iconColor)}`}
                title="Descargar"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onFileDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {canPerformAction && (
              <button
                onClick={onAction}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
                  iconColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  iconColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {actionLabel}
              </button>
            )}
            {canTogglePayment && onTogglePayment && (
              <button
                onClick={onTogglePayment}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isPaid 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {isPaid ? 'Marcar como No Pagado' : 'Marcar como Pagado'}
              </button>
            )}
            {disabledMessage && (
              <p className="text-sm text-gray-500">
                {disabledMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}