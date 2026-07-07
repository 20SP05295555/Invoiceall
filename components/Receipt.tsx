
import React, { useRef, useState } from 'react';
import DocumentLayout, { EditableInput } from './DocumentLayout.tsx';
import { Printer, Download, CreditCard, Loader2, Edit2, Save, Image as ImageIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext.tsx';
import { exportDocumentAsOnePagePDF, exportDocumentAsJPEG, checkNeedsTwoPages } from '../utils/exportUtils.ts';
import { extractDocReference } from '../constants.ts';
import { ExportPageFitModal } from './ExportPageFitModal.tsx';

const Receipt: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingJpeg, setIsDownloadingJpeg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFitModal, setShowFitModal] = useState(false);
  const { order, updateOrder, customer, updateCustomer } = useData();

  const handlePrint = () => {
    window.print();
  };

  const getTargetFilename = () => `${customer.name || 'Customer'} Receipt ${order.orderNumber}`;

  const handleDownload = async () => {
    if (!contentRef.current) return;
    const needs2 = await checkNeedsTwoPages(contentRef.current);
    if (needs2 || order.items.length > 3) {
      setShowFitModal(true);
      return;
    }
    setIsDownloading(true);
    try {
      await exportDocumentAsOnePagePDF(contentRef.current, `${getTargetFilename()}.pdf`, 1);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleConfirmExport = async (pages: number) => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    try {
      await exportDocumentAsOnePagePDF(contentRef.current, `${getTargetFilename()}.pdf`, pages);
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadJPEG = async () => {
    if (!contentRef.current) return;
    setIsDownloadingJpeg(true);
    try {
      await exportDocumentAsJPEG(contentRef.current, `${getTargetFilename()}.jpg`);
    } catch (err) {
      console.error("JPEG generation failed", err);
    } finally {
      setIsDownloadingJpeg(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center max-w-4xl mx-auto print:hidden">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          Official Receipt
        </h2>
        <div className="flex gap-3">
             {isEditing ? (
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            ) : (
              <>
                 <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Printer className="w-4 h-4" /> Print
                </button>
                <button 
                    onClick={handleDownload}
                    disabled={isDownloading || isDownloadingJpeg}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isDownloading ? 'Generating...' : 'Download PDF (1 Page)'}
                </button>
                <button 
                    onClick={handleDownloadJPEG}
                    disabled={isDownloading || isDownloadingJpeg}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloadingJpeg ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {isDownloadingJpeg ? 'Generating...' : 'JPEG Download'}
                </button>
              </>
            )}
        </div>
      </div>

      <div id="printable-receipt" ref={contentRef}>
        <DocumentLayout 
            title="Receipt" 
            documentNumber={order.orderNumber}
            onDocumentNumberChange={(v) => updateOrder({...order, orderNumber: v, paymentReference: extractDocReference(v)})}
            dateLabel="Payment Date"
            dateValue={order.paymentDate || order.date}
            onDateChange={(v) => updateOrder({...order, paymentDate: v})}
            dueDateValue={order.dueDate}
            onDueDateChange={(v) => updateOrder({...order, dueDate: v})}
            customerNoValue={customer.id}
            onCustomerNoChange={(v) => updateCustomer({...customer, id: v})}
            mode="receipt"
            isEditing={isEditing}
        >
            <div className={`border rounded-md p-4 mb-8 transition-colors ${isEditing ? 'border-blue-300 bg-blue-50/20' : 'border-gray-200 bg-gray-50'}`}>
            <h4 className="font-bold text-sm text-gray-900 mb-2">Payment Details</h4>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-500">Method:</span>
                    {isEditing ? (
                        <EditableInput 
                            value={order.paymentMethod || ''} 
                            onChange={(v: string) => updateOrder({...order, paymentMethod: v})} 
                            className="w-32" 
                        />
                    ) : (
                        <span>{order.paymentMethod}</span>
                    )}
                </div>
                
                <span className="h-4 w-px bg-gray-300 hidden sm:block"></span>
                
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-500">Ref:</span>
                    {isEditing ? (
                        <EditableInput 
                            value={order.paymentReference || ''} 
                            onChange={(v: string) => updateOrder({...order, paymentReference: v})} 
                            className="w-32" 
                        />
                    ) : (
                        <span>{order.paymentReference}</span>
                    )}
                </div>
                
                <span className="h-4 w-px bg-gray-300 hidden sm:block"></span>
                
                <div className="flex items-center gap-2">
                     <span className="text-green-600 font-medium">Verified</span>
                </div>
            </div>
            </div>
        </DocumentLayout>
      </div>
      <ExportPageFitModal
        isOpen={showFitModal}
        onClose={() => setShowFitModal(false)}
        onConfirmExport={handleConfirmExport}
        documentTitle={getTargetFilename()}
      />
    </div>
  );
};

export default Receipt;
