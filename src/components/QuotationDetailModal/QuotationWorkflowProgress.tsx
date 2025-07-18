import React from 'react';
import { FileText, CreditCard } from 'lucide-react';
import { Quotation } from '../../types';
import WorkflowStep from './WorkflowStep';

interface QuotationWorkflowProgressProps {
  quotation: Quotation;
  onQuotationUpdate: (updatedQuotation: Quotation) => void;
  onShowPOModal: () => void;
  onShowInvoiceModal: () => void;
  onShowFileDeleteConfirm: (confirm: { type: 'purchaseOrder' | 'invoice'; message: string }) => void;
  uploadingPO: boolean;
  setUploadingPO: (uploading: boolean) => void;
  uploadingInvoice: boolean;
  setUploadingInvoice: (uploading: boolean) => void;
}

export default function QuotationWorkflowProgress({
  quotation,
  onQuotationUpdate,
  onShowPOModal,
  onShowInvoiceModal,
  onShowFileDeleteConfirm,
  uploadingPO,
  setUploadingPO,
  uploadingInvoice,
  setUploadingInvoice
}: QuotationWorkflowProgressProps) {
  const canCreatePurchaseOrder = quotation.status === 'aprobada' && !quotation.purchaseOrderFile;
  const canGenerateInvoice = quotation.status === 'aprobada' && quotation.purchaseOrderFile && !quotation.invoiceFile;
  const canMarkAsPaid = quotation.invoiceFile && !quotation.invoicePaid;

  const confirmFileDelete = (type: 'purchaseOrder' | 'invoice') => {
    if (type === 'purchaseOrder' && quotation.invoiceFile) {
      onShowFileDeleteConfirm({
        type,
        message: '¿Estás seguro de eliminar la Orden de Compra? Esto también eliminará la Factura asociada y restablecerá el estado de pago.'
      });
    } else if (type === 'invoice' && quotation.invoicePaid) {
      onShowFileDeleteConfirm({
        type,
        message: '¿Estás seguro de eliminar la Factura? Esto también restablecerá el estado de pago asociado.'
      });
    } else {
      // Direct delete without confirmation for simple cases
      const updated = {
        ...quotation,
        [type === 'purchaseOrder' ? 'purchaseOrderFile' : 'invoiceFile']: undefined,
        [type === 'purchaseOrder' ? 'purchaseOrderCreated' : 'invoiceGenerated']: false,
        invoicePaid: type === 'purchaseOrder' ? false : 
                    (type === 'invoice' ? false : quotation.invoicePaid),
        ...(type === 'purchaseOrder' && {
          invoiceFile: undefined,
          invoiceGenerated: false,
          invoicePaid: false
        })
      };
      onQuotationUpdate(updated);
    }
  };

  const handleMarkAsPaid = () => {
    const updated = { ...quotation, invoicePaid: true };
    onQuotationUpdate(updated);
  };

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">Progreso del Flujo de Trabajo</h4>
      <div className="space-y-6">
        {/* Purchase Order */}
        <WorkflowStep
          title="Orden de Compra"
          description="Generar orden de compra después de la aprobación"
          icon={FileText}
          file={quotation.purchaseOrderFile}
          status={quotation.purchaseOrderFile ? 'Creada' : quotation.status === 'aprobada' ? 'Pendiente' : 'N/A'}
          canPerformAction={canCreatePurchaseOrder}
          actionLabel="Crear Orden"
          onAction={onShowPOModal}
          onFileDelete={() => confirmFileDelete('purchaseOrder')}
          disabledMessage={quotation.status !== 'aprobada' ? 'La cotización debe estar aprobada para generar una orden de compra' : undefined}
          iconColor="blue"
        />

        {/* Invoice */}
        <WorkflowStep
          title="Factura Final"
          description="Generar factura después de la orden de compra"
          icon={FileText}
          file={quotation.invoiceFile}
          status={quotation.invoiceFile ? 'Generada' : quotation.purchaseOrderFile && quotation.status === 'aprobada' ? 'Pendiente' : 'N/A'}
          canPerformAction={canGenerateInvoice}
          actionLabel="Generar Factura"
          onAction={onShowInvoiceModal}
          onFileDelete={() => confirmFileDelete('invoice')}
          disabledMessage={quotation.status === 'aprobada' && !quotation.purchaseOrderFile ? 'Debes subir una Orden de Compra antes de generar la factura' : undefined}
          iconColor="green"
        />

        {/* Payment */}
        <WorkflowStep
          title="Pago"
          description="Marcar factura como pagada"
          icon={CreditCard}
          file={null}
          status={quotation.invoicePaid ? 'Pagado' : quotation.invoiceFile ? 'Pendiente' : 'N/A'}
          canPerformAction={false}
          actionLabel=""
          onAction={() => {}}
          onFileDelete={() => {}}
          iconColor="emerald"
          canTogglePayment={!!quotation.invoiceFile}
          onTogglePayment={() => {
            const updated = { ...quotation, invoicePaid: !quotation.invoicePaid };
            onQuotationUpdate(updated);
          }}
          isPaid={quotation.invoicePaid}
        />
      </div>
    </div>
  );
}