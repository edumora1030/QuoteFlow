import React, { useState } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Quotation } from '../types';

interface NewQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quotation: Omit<Quotation, 'id'>) => void;
}

interface ExtractedData {
  title: string;
  client: string;
  amount: number;
  description: string;
}

export default function NewQuotationModal({ isOpen, onClose, onSubmit }: NewQuotationModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Por favor selecciona un archivo PDF');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    processPDF(selectedFile);
  };

  const processPDF = async (pdfFile: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate PDF processing with mock data extraction
      // In a real implementation, you would use a PDF parsing library or API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock extracted data based on filename or random generation
      const mockData: ExtractedData = {
        title: `Cotización de Proyecto - ${pdfFile.name.replace('.pdf', '')}`,
        client: 'Nombre del Cliente Extraído',
        amount: Math.floor(Math.random() * 50000) + 5000,
        description: 'Descripción del proyecto extraída automáticamente del documento PDF. Esto incluye el alcance del trabajo, entregables e información de cronograma.'
      };

      setExtractedData(mockData);
    } catch (err) {
      setError('Error al procesar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!extractedData) return;

    const newQuotation: Omit<Quotation, 'id'> = {
      ...extractedData,
      date: new Date().toISOString().split('T')[0],
      status: 'pendiente',
      purchaseOrderCreated: false,
      invoiceGenerated: false,
      invoicePaid: false
    };

    onSubmit(newQuotation);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setExtractedData(null);
    setError(null);
    setIsProcessing(false);
    setDragActive(false);
    onClose();
  };

  const handleInputChange = (field: keyof ExtractedData, value: string | number) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      [field]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Cotización</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload */}
          {!extractedData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir PDF de Cotización</h3>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isProcessing}
                />
                
                <div className="space-y-4">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Procesando PDF...</p>
                        <p className="text-gray-600">Extrayendo datos de la cotización</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {file ? file.name : 'Arrastra tu PDF aquí o haz clic para navegar'}
                        </p>
                        <p className="text-gray-600">Solo archivos PDF, máximo 10MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Extracted Data Review */}
          {extractedData && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Revisar Datos Extraídos</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Cotización
                  </label>
                  <input
                    type="text"
                    value={extractedData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={extractedData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto ($)
                  </label>
                  <input
                    type="number"
                    value={extractedData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={extractedData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Crear Cotización
                </button>
                <button
                  onClick={() => setExtractedData(null)}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Re-subir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}