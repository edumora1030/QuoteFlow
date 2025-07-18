import React, { useState } from 'react';
import { X, Edit3, Save, Trash2 } from 'lucide-react';
import { Quotation, User as UserType } from '../../types';
import QuotationBasicInfo from './QuotationBasicInfo';
import QuotationWorkflowProgress from './QuotationWorkflowProgress';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import FileDeleteConfirmationModal from './FileDeleteConfirmationModal';
import DocumentCreationModal from '../DocumentCreationModal';

interface QuotationDetailModalProps {
  quotation: Quotation;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedQuotation: Quotation) => void;
  onDelete: (quotationId: string) => void;
  currentUser: UserType;
}

export default function QuotationDetailModal({ 
  quotation, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete, 
  currentUser 
}: QuotationDetailModalProps) {
  const [localQuotation, setLocalQuotation] = useState<Quotation>(quotation);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [uploadingPO, setUploadingPO] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [showFileDeleteConfirm, setShowFileDeleteConfirm] = useState<{
    type: 'purchaseOrder' | 'invoice';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof Quotation, value: string | number) => {
    const updated = { ...localQuotation, [field]: value };
    setLocalQuotation(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localQuotation);
    setHasChanges(false);
  };

  const handleDelete = () => {
    onDelete(localQuotation.id);
    onClose();
  };

  const handleCancel = () => {
    setLocalQuotation(quotation);
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleQuotationUpdate = (updatedQuotation: Quotation) => {
    setLocalQuotation(updatedQuotation);
    setHasChanges(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Detalles de Cotización</h2>
            {hasChanges && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                Cambios sin guardar
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </>
            )}
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <QuotationBasicInfo
            quotation={localQuotation}
            isEditing={isEditing}
            currentUser={currentUser}
            onFieldChange={handleFieldChange}
          />

          {/* Workflow Progress */}
          {!isEditing && (
            <QuotationWorkflowProgress
              quotation={localQuotation}
              onQuotationUpdate={handleQuotationUpdate}
              onShowPOModal={() => setShowPOModal(true)}
              onShowInvoiceModal={() => setShowInvoiceModal(true)}
              onShowFileDeleteConfirm={setShowFileDeleteConfirm}
              uploadingPO={uploadingPO}
              setUploadingPO={setUploadingPO}
              uploadingInvoice={uploadingInvoice}
              setUploadingInvoice={setUploadingInvoice}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* File Delete Confirmation Modal */}
      <FileDeleteConfirmationModal
        showFileDeleteConfirm={showFileDeleteConfirm}
        onClose={() => setShowFileDeleteConfirm(null)}
        onConfirm={(type) => {
          const updated = {
            ...localQuotation,
            [type === 'purchaseOrder' ? 'purchaseOrderFile' : 'invoiceFile']: undefined,
            [type === 'purchaseOrder' ? 'purchaseOrderCreated' : 'invoiceGenerated']: false,
            invoicePaid: type === 'purchaseOrder' ? false : 
                        (type === 'invoice' ? false : localQuotation.invoicePaid),
            ...(type === 'purchaseOrder' && {
              invoiceFile: undefined,
              invoiceGenerated: false,
              invoicePaid: false
            })
          };
          setLocalQuotation(updated);
          setHasChanges(true);
          setShowFileDeleteConfirm(null);
        }}
      />

      {/* Document Creation Modals */}
      <DocumentCreationModal
        isOpen={showPOModal}
        onClose={() => setShowPOModal(false)}
        onSubmit={async (title: string, file: File) => {
          setUploadingPO(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newFile = {
              id: Date.now().toString(),
              name: title,
              url: URL.createObjectURL(file),
              uploadDate: new Date().toISOString()
            };
            const updated = {
              ...localQuotation,
              purchaseOrderFile: newFile,
              purchaseOrderCreated: true
            };
            setLocalQuotation(updated);
            setHasChanges(true);
            setShowPOModal(false);
          } catch (error) {
            console.error('Error uploading purchase order:', error);
          } finally {
            setUploadingPO(false);
          }
        }}
        type="purchaseOrder"
        isUploading={uploadingPO}
      />

      <DocumentCreationModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onSubmit={async (title: string, file: File) => {
          setUploadingInvoice(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newFile = {
              id: Date.now().toString(),
              name: title,
              url: URL.createObjectURL(file),
              uploadDate: new Date().toISOString()
            };
            const updated = {
              ...localQuotation,
              invoiceFile: newFile,
              invoiceGenerated: true
            };
            setLocalQuotation(updated);
            setHasChanges(true);
            setShowInvoiceModal(false);
          } catch (error) {
            console.error('Error uploading invoice:', error);
          } finally {
            setUploadingInvoice(false);
          }
        }}
        type="invoice"
        isUploading={uploadingInvoice}
      />
    </div>
  );
}