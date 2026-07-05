
import React, { useRef, useState } from 'react';
import DocumentLayout from './DocumentLayout.tsx';
import { CheckCircle, Printer, Download, Loader2, Edit2, Save, Image as ImageIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext.tsx';
import { exportDocumentAsOnePagePDF, exportDocumentAsJPEG } from '../utils/exportUtils.ts';

const OrderConfirmation: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingJpeg, setIsDownloadingJpeg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { order, updateOrder, customer, updateCustomer } = useData();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    try {
      await exportDocumentAsOnePagePDF(contentRef.current, `Order_${order.orderNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadJPEG = async () => {
    if (!contentRef.current) return;
    setIsDownloadingJpeg(true);
    try {
      await exportDocumentAsJPEG(contentRef.current, `Order_${order.orderNumber}.jpg`);
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
          <CheckCircle className="w-6 h-6 text-green-600" />
          Order Confirmed
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
      
      <div id="printable-order" ref={contentRef}>
        <DocumentLayout 
            title="Order Confirmation" 
            documentNumber={order.orderNumber}
            onDocumentNumberChange={(v) => updateOrder({...order, orderNumber: v})}
            dateLabel="Order Date"
            dateValue={order.date}
            onDateChange={(v) => updateOrder({...order, date: v})}
            dueDateValue={order.dueDate}
            onDueDateChange={(v) => updateOrder({...order, dueDate: v})}
            customerNoValue={customer.id}
            onCustomerNoChange={(v) => updateCustomer({...customer, id: v})}
            mode="order"
            isEditing={isEditing}
        >
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 text-sm text-blue-800">
            <p className="font-bold">Status Update:</p>
            <p>Your order has been confirmed and is currently in the <strong>Production Queue</strong>. We will notify you when the items are ready for shipment.</p>
            </div>
        </DocumentLayout>
      </div>
    </div>
  );
};

export default OrderConfirmation;