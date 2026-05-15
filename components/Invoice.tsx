
import React, { useRef, useState } from 'react';
import DocumentLayout from './DocumentLayout.tsx';
import { FileText, Printer, Download, Loader2, Edit2, Save, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useData } from '../contexts/DataContext.tsx';

const Invoice: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false);
  const { order, updateOrder, customer, updateCustomer, bulkUpdate } = useData();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!contentRef.current) return;
    setIsDownloading(true);

    const element = contentRef.current;
    const opt = {
      margin: 10,
      filename: `Invoice_${order.orderNumber}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2.5, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsDownloading(false);
      }).catch((err: any) => {
        console.error("PDF generation failed", err);
        setIsDownloading(false);
      });
    } else {
        console.error("html2pdf library not loaded");
        setIsDownloading(false);
    }
  };

  const confirmMarkAsPaid = () => {
    bulkUpdate({
      order: {
        amountPaid: order.total,
        status: 'Delivered'
      }
    });
    setShowMarkAsPaidModal(false);
  };

  const isPaid = order.amountDue <= 0 && order.total > 0;

  const [pageTitle, setPageTitle] = useState('Tax Invoice');
  const [docTitle, setDocTitle] = useState('Invoice');
  const [dateLabel, setDateLabel] = useState('Invoice Date');
  const [dueDateLabel, setDueDateLabel] = useState('Due Date');
  const [customerNoLabel, setCustomerNoLabel] = useState('Customer No.');
  const [billToLabel, setBillToLabel] = useState('Bill to');

  return (
    <div className="space-y-6 relative">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center max-w-4xl mx-auto gap-4 print:hidden">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-gray-900" />
          {isEditing ? (
            <input 
              value={pageTitle} 
              onChange={(e) => setPageTitle(e.target.value)}
              className="bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-500"
            />
          ) : pageTitle}
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
             {isEditing ? (
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            ) : (
              <>
                {!isPaid && (
                  <button 
                    onClick={() => setShowMarkAsPaidModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-all shadow-sm hover:scale-[1.02] active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as Paid
                  </button>
                )}
                {isPaid && (
                  <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-md shadow-inner">
                    <CheckCircle className="w-4 h-4" /> PAID
                  </div>
                )}
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
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
              </>
            )}
        </div>
      </div>

      <div id="printable-invoice" ref={contentRef}>
        <DocumentLayout 
            title={docTitle}
            onTitleChange={setDocTitle}
            documentNumber={`${order.orderNumber}`}
            onDocumentNumberChange={(v) => updateOrder({...order, orderNumber: v})}
            dateLabel={dateLabel}
            onDateLabelChange={setDateLabel}
            dateValue={order.date}
            onDateChange={(v) => updateOrder({...order, date: v})}
            dueDateLabel={dueDateLabel}
            onDueDateLabelChange={setDueDateLabel}
            dueDateValue={order.dueDate}
            onDueDateChange={(v) => updateOrder({...order, dueDate: v})}
            customerNoLabel={customerNoLabel}
            onCustomerNoLabelChange={setCustomerNoLabel}
            customerNoValue={customer.id}
            onCustomerNoChange={(v) => updateCustomer({...customer, id: v})}
            billToLabel={billToLabel}
            onBillToLabelChange={setBillToLabel}
            mode="invoice"
            isEditing={isEditing}
        />
      </div>

      {/* Mark as Paid Confirmation Modal */}
      {showMarkAsPaidModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <button 
                  onClick={() => setShowMarkAsPaidModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mark as Paid</h3>
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to mark this invoice as paid? This will update the total amount paid to <span className="font-bold text-gray-900">£{order.total.toFixed(2)}</span> and set the status to Delivered.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowMarkAsPaidModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                No, cancel
              </button>
              <button 
                onClick={confirmMarkAsPaid}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-100"
              >
                Yes, mark as paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
