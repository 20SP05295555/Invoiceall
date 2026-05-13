
import React, { useRef, useState } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { OrderItem } from '../types.ts';
import { Image, Upload, Trash2, Plus, Cloud, Check, Camera, Loader2, Sparkles } from 'lucide-react';

type DocumentMode = 'order' | 'invoice' | 'receipt';

interface DocumentLayoutProps {
  title: string;
  documentNumber: string;
  onDocumentNumberChange?: (val: string) => void;
  dateLabel: string;
  dateValue: string;
  onDateChange?: (val: string) => void;
  dueDateValue: string;
  onDueDateChange?: (val: string) => void;
  customerNoValue: string;
  onCustomerNoChange?: (val: string) => void;
  children?: React.ReactNode;
  mode: DocumentMode;
  isEditing?: boolean;
}

export const EditableInput = ({ value, onChange, className = "", type = "text", placeholder = "", align = "left" }: any) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`
      transition-all duration-200
      bg-transparent border-b border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50
      focus:outline-none focus:border-blue-500 focus:ring-0 focus:bg-white focus:shadow-sm
      px-1 py-0.5 w-full rounded-sm
      ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}
      ${className}
    `}
  />
);

export const EditableTextArea = ({ value, onChange, className = "" }: any) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={2}
    className={`
      transition-all duration-200
      bg-transparent border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50
      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white
      rounded px-2 py-1 w-full resize-none
      ${className}
    `}
  />
);

const DocumentLayout: React.FC<DocumentLayoutProps> = ({ 
  title, 
  documentNumber, 
  onDocumentNumberChange,
  dateLabel, 
  dateValue,
  onDateChange,
  dueDateValue,
  onDueDateChange,
  customerNoValue,
  onCustomerNoChange,
  children,
  mode,
  isEditing = false
}) => {
  const { 
    companyInfo, updateCompanyInfo, 
    customer, updateCustomer, 
    order, updateOrderItem,
    addOrderItem, removeOrderItem, updateAmountPaid,
    addGalleryItem,
    isAutoSaving
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCompanyInfo({ ...companyInfo, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (index: number, value: string, isCompany: boolean) => {
    if (isCompany) {
      const newAddr = [...companyInfo.address];
      newAddr[index] = value;
      updateCompanyInfo({ ...companyInfo, address: newAddr });
    } else {
      const newAddr = [...customer.address];
      newAddr[index] = value;
      updateCustomer({ ...customer, address: newAddr });
    }
  };

  const handleCapture = async () => {
      if (!docRef.current) return;
      
      // Safety check for script readiness
      if (!(window as any).html2canvas) {
          alert("Capture utility is still loading. Please try again in a moment.");
          return;
      }

      setIsCapturing(true);
      try {
          // @ts-ignore
          const canvas = await window.html2canvas(docRef.current, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          addGalleryItem({
              url: imgData,
              caption: `Screenshot of ${title} #${documentNumber}`,
              date: new Date().toLocaleDateString('en-GB'),
              type: 'capture'
          });
          // Non-blocking success notification
          console.log("Snapshot saved to gallery");
      } catch (err) {
          console.error("Capture failed", err);
          alert("Failed to capture screenshot. Please try again.");
      } finally {
          setIsCapturing(false);
      }
  };

  let statusText = "UNPAID";
  let statusColor = "text-red-600 border-red-600";
  if (order.amountDue <= 0 && order.total > 0) {
      statusText = "PAID";
      statusColor = "text-green-600 border-green-600";
  } else if (order.amountPaid > 0) {
      statusText = "PARTIAL";
      statusColor = "text-orange-500 border-orange-500";
  }
  if (mode === 'receipt') {
      statusText = "PAID IN FULL";
      statusColor = "text-green-600 border-green-600";
  }

  return (
    <div className="relative">
      {/* Floating Capture Button */}
      {!isEditing && (
          <button 
            onClick={handleCapture}
            disabled={isCapturing}
            className="absolute -right-4 top-0 transform translate-x-full bg-white p-3 rounded-full shadow-lg border border-gray-100 hover:scale-110 active:scale-95 transition-all text-indigo-600 z-20 group print:hidden"
            title="Snap to Gallery"
          >
            {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Snap to Gallery</span>
          </button>
      )}

      <div ref={docRef} className="bg-white w-full max-w-4xl mx-auto p-4 sm:p-8 md:p-12 shadow-lg min-h-0 sm:min-h-[800px] text-gray-800 font-sans relative print:shadow-none print:max-w-none print:mx-0 print:min-h-0 print:p-8 group">
        
        {isEditing && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-medium text-gray-400 print:hidden">
            {isAutoSaving ? (
              <><Cloud className="w-3 h-3 animate-pulse" /> Saving...</>
            ) : (
              <><Check className="w-3 h-3 text-green-500" /> Saved</>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 sm:mb-12 gap-6 sm:gap-0">
          <div className="w-full sm:w-2/3 pr-0 sm:pr-4">
            <div className="mb-6">
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row items-start gap-4 mb-4 p-4 border border-dashed border-blue-300 bg-blue-50/30 rounded transition-all hover:bg-blue-50">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-16 bg-white border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden relative rounded-sm cursor-pointer hover:border-blue-400 transition-colors group/logo"
                      >
                          {companyInfo.logoUrl ? (
                            <img src={companyInfo.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                                <Upload className="w-5 h-5 opacity-40 group-hover/logo:text-blue-500 transition-colors" />
                                <span className="text-[8px] font-bold uppercase opacity-40">Upload Logo</span>
                            </div>
                          )}
                      </div>
                      <div className="flex-1">
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Company Logo</label>
                          <div className="flex gap-2 items-center">
                              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                  <Upload className="w-3 h-3" /> Upload
                              </button>
                              {companyInfo.logoUrl && (
                                  <button onClick={() => updateCompanyInfo({...companyInfo, logoUrl: ''})} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Remove Logo">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2">Recommended: PNG or JPG, max 2MB</p>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </div>
                  </div>
                ) : (
                  companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="Company Logo" className="h-16 object-contain mb-4" />
                )}
            </div>

            {isEditing ? (
              <div className="space-y-2 mb-6 p-2 -ml-2 rounded hover:bg-gray-50 transition-colors">
                <EditableInput value={companyInfo.contact} onChange={(v: string) => updateCompanyInfo({...companyInfo, contact: v})} className="font-medium text-sm text-gray-500" placeholder="Contact Person" />
                {companyInfo.address.map((line, i) => (
                  <div key={`company-addr-edit-${i}`}>
                    <EditableInput value={line} onChange={(v: string) => handleAddressChange(i, v, true)} className="text-sm text-gray-500" placeholder="Address Line" />
                  </div>
                ))}
                <EditableInput value={companyInfo.name} onChange={(v: string) => updateCompanyInfo({...companyInfo, name: v})} className="text-2xl font-bold uppercase text-black mt-2" placeholder="Company Name" />
              </div>
            ) : (
              <>
                <h2 className="text-sm font-medium text-gray-500 mb-1">{companyInfo.contact}</h2>
                <p className="text-sm text-gray-500 mb-6">{companyInfo.address.join(' - ')}</p>
                <h1 className="text-2xl font-bold tracking-wide uppercase text-black">{companyInfo.name}</h1>
              </>
            )}
          </div>
          <div className="w-full sm:w-1/3 text-left sm:text-right text-sm text-gray-500 pt-2">
            {isEditing ? (
              <div className="space-y-1 flex flex-col items-start sm:items-end p-2 -mr-2 rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 w-full justify-start sm:justify-end">
                      <span>Co. Reg.:</span>
                      <EditableInput value={companyInfo.regNo} onChange={(v: string) => updateCompanyInfo({...companyInfo, regNo: v})} className="w-full max-w-[140px]" align="right" />
                  </div>
                  <div className="flex items-center gap-2 w-full justify-start sm:justify-end">
                      <span>Email:</span>
                      <EditableInput value={companyInfo.email} onChange={(v: string) => updateCompanyInfo({...companyInfo, email: v})} className="w-full max-w-[180px]" align="right" />
                  </div>
                  <div className="flex items-center gap-2 w-full justify-start sm:justify-end">
                      <span>Web:</span>
                      <EditableInput value={companyInfo.website} onChange={(v: string) => updateCompanyInfo({...companyInfo, website: v})} className="w-full max-w-[180px]" align="right" />
                  </div>
              </div>
            ) : (
              <>
                <p>Co. Reg. No.: {companyInfo.regNo}</p>
                <p>Email: {companyInfo.email}</p>
                <p>Website: {companyInfo.website}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-8 sm:gap-0">
          <div className="w-full sm:w-1/2 pr-0 sm:pr-4">
              {isEditing ? (
                  <div className="space-y-1 p-2 -ml-2 rounded hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-900 block mb-1">Bill to:</span>
                      <EditableInput value={customer.name} onChange={(v: string) => updateCustomer({...customer, name: v})} className="font-bold mb-2" placeholder="Customer Name" />
                      {customer.address.map((line, i) => (
                          <div key={`customer-addr-edit-${i}`}>
                            <EditableInput value={line} onChange={(v: string) => handleAddressChange(i, v, false)} className="text-sm text-gray-600" placeholder="Address Line" />
                          </div>
                      ))}
                      <EditableInput value={customer.email} onChange={(v: string) => updateCustomer({...customer, email: v})} className="text-sm text-gray-500 mt-2" placeholder="Customer Email" />
                      <EditableInput value={customer.phone} onChange={(v: string) => updateCustomer({...customer, phone: v})} className="text-sm text-gray-500" placeholder="Customer Phone" />
                  </div>
              ) : (
                  <>
                    <h3 className="font-bold text-gray-900 mb-2">Bill to: {customer.name}</h3>
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {customer.address.map((line, i) => <div key={`customer-addr-view-${i}`}>{line}</div>)}
                      <div className="mt-2 text-gray-500">{customer.email}</div>
                      <div className="text-gray-500">{customer.phone}</div>
                    </div>
                  </>
              )}
          </div>
          <div className="text-left sm:text-right w-full sm:w-1/2 pl-0 sm:pl-4">
            <div className="mb-2 flex justify-start sm:justify-end items-center gap-2">
              <span className="font-bold text-gray-900 shrink-0">{title}:</span>
              {isEditing && onDocumentNumberChange ? <EditableInput value={documentNumber} onChange={onDocumentNumberChange} className="w-full sm:w-32" align="right" /> : <span className="text-gray-700">{documentNumber}</span>}
            </div>
            <div className="mb-2 flex justify-start sm:justify-end items-center gap-2">
              <span className="font-bold text-gray-900 shrink-0">{dateLabel}:</span>
              {isEditing && onDateChange ? <EditableInput value={dateValue} onChange={onDateChange} className="w-full sm:w-32" align="right" /> : <span className="text-gray-700">{dateValue}</span>}
            </div>
            <div className="mb-2 flex justify-start sm:justify-end items-center gap-2">
              <span className="font-bold text-gray-900 shrink-0">Due Date:</span>
              {isEditing && onDueDateChange ? <EditableInput value={dueDateValue} onChange={onDueDateChange} className="w-full sm:w-32" align="right" /> : <span className="text-gray-700">{dueDateValue}</span>}
            </div>
            <div className="flex justify-start sm:justify-end items-center gap-2">
              <span className="font-bold text-gray-900 shrink-0">Customer No.:</span>
              {isEditing && onCustomerNoChange ? <EditableInput value={customerNoValue} onChange={onCustomerNoChange} className="w-full sm:w-32" align="right" /> : <span className="text-gray-700">{customerNoValue}</span>}
            </div>
          </div>
        </div>

        <div className="w-full bg-[#4B5563] text-white font-bold text-[10px] sm:text-sm py-3 px-2 sm:px-4 flex items-center rounded-t-sm">
          <div className="w-4/12 sm:w-5/12">Description</div>
          <div className="w-2/12 text-center">Qty</div>
          <div className="w-2/12 text-center">Unit</div>
          <div className="w-2/12 text-right">Price</div>
          <div className="w-2/12 text-right">Amount</div>
        </div>

        <div className="border-b border-gray-200 pb-8 mb-8">
          {order.items.map((item, index) => (
            <div key={item.id} className="flex items-start text-[11px] sm:text-sm py-4 px-2 sm:px-4 text-gray-800 border-b border-gray-50 last:border-0 relative group/row hover:bg-gray-50/50 transition-colors">
              {isEditing && <button onClick={() => removeOrderItem(index)} className="absolute -left-4 sm:-left-8 top-4 text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>}
              <div className="w-4/12 sm:w-5/12 pr-2 sm:pr-4">
                {isEditing ? (
                    <div className="space-y-1">
                        <EditableInput value={item.description} onChange={(v: string) => updateOrderItem(index, 'description', v)} className="font-medium" placeholder="Item Name" />
                        {item.details.map((detail, dIdx) => (
                          <div key={`${item.id}-detail-edit-${dIdx}`} className="flex gap-1 sm:gap-2 items-center">
                              <EditableInput value={detail} onChange={(v: string) => { const newDetails = [...item.details]; newDetails[dIdx] = v; updateOrderItem(index, 'details', newDetails); }} className="text-gray-600 text-[10px]" placeholder="Detail" />
                              <button onClick={() => { const newDetails = item.details.filter((_, i) => i !== dIdx); updateOrderItem(index, 'details', newDetails); }} className="text-red-200 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                        <button onClick={() => updateOrderItem(index, 'details', [...item.details, ""])} className="text-[9px] text-blue-400 hover:text-blue-600 flex items-center gap-1 mt-1 opacity-50 hover:opacity-100 transition-opacity"><Plus className="w-3 h-3" /> Add Detail</button>
                    </div>
                ) : (
                  <>
                    <p className="font-medium mb-1">{item.description}</p>
                    {item.details.map((detail, idx) => <p key={`${item.id}-detail-view-${idx}`} className="text-gray-600 text-[10px] sm:text-xs">{detail}</p>)}
                  </>
                )}
              </div>
              <div className="w-2/12 text-center pt-1">{isEditing ? <EditableInput type="number" value={item.quantity} onChange={(v: string) => updateOrderItem(index, 'quantity', parseFloat(v) || 0)} align="center" /> : item.quantity.toFixed(2)}</div>
              <div className="w-2/12 text-center pt-1">{isEditing ? <EditableInput value={item.unit} onChange={(v: string) => updateOrderItem(index, 'unit', v)} align="center" /> : item.unit}</div>
              <div className="w-2/12 text-right pt-1">{isEditing ? <EditableInput type="number" value={item.price} onChange={(v: string) => updateOrderItem(index, 'price', parseFloat(v) || 0)} align="right" /> : item.price.toFixed(2)}</div>
              <div className="w-2/12 text-right pt-1 font-medium">{item.total.toFixed(2)}</div>
            </div>
          ))}
          {isEditing && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => addOrderItem()} className="flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200 border-dashed">
                <Plus className="w-4 h-4" /> Add New Item
              </button>
              <button 
                onClick={() => addOrderItem("Package Removal Service", 29)} 
                className="flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-200 border-dashed"
              >
                <Sparkles className="w-4 h-4" /> Package Removal Service (£29)
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end mb-12">
          <div className="w-full sm:w-1/2 max-w-xs">
            <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-600 text-[11px] sm:text-sm">Subtotal without VAT</span><span className="font-mono text-gray-900 text-[11px] sm:text-sm">{order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-200"><span className="font-bold text-gray-900 text-[11px] sm:text-sm">Total GBP</span><span className="font-bold font-mono text-gray-900 text-[11px] sm:text-sm">{order.total.toFixed(2)}</span></div>
            <div className={`flex justify-between py-2 text-[11px] sm:text-sm ${isEditing ? 'bg-yellow-50/50 -mx-2 px-2 rounded' : ''}`}><span className="text-gray-600">Amount Paid</span><span className="font-mono text-gray-900">{isEditing ? <EditableInput type="number" value={order.amountPaid} onChange={(v: string) => updateAmountPaid(parseFloat(v) || 0)} className="w-24 font-bold" align="right" /> : (mode === 'order' && order.amountPaid === 0 ? '0.00' : `-${order.amountPaid.toFixed(2)}`)}</span></div>
            <div className="flex justify-between py-2 border-t border-black mt-2"><span className="font-bold text-gray-900 text-[11px] sm:text-sm">Amount Due (GBP)</span><span className="font-bold font-mono text-gray-900 text-[11px] sm:text-sm">{order.amountDue.toFixed(2)}</span></div>
          </div>
        </div>

        {children}
        
        <div className="mt-auto pt-8 border-t border-gray-100">
          <h4 className="font-bold text-sm text-gray-900 mb-2">Terms & Conditions</h4>
          {isEditing ? <EditableInput value={companyInfo.terms} onChange={(v: string) => updateCompanyInfo({...companyInfo, terms: v})} className="text-sm text-gray-600 mb-4" /> : <p className="text-sm text-gray-600 mb-4">{companyInfo.terms}</p>}
          <h4 className="font-bold text-sm text-gray-900 mb-2">Payment Instructions</h4>
          {isEditing ? (
            <div className="space-y-4">
                <EditableTextArea value={companyInfo.paymentInstructions} onChange={(v: string) => updateCompanyInfo({...companyInfo, paymentInstructions: v})} className="text-sm text-gray-600" />
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {['bankName', 'sortCode', 'accountNo', 'accountHolder', 'swift', 'iban'].map(f => <div key={f}><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">{f.replace(/([A-Z])/g, ' $1')}</label><EditableInput value={(companyInfo as any)[f]} onChange={(v: string) => updateCompanyInfo({...companyInfo, [f]: v})} /></div>)}
                </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600"><p className="mb-4">{companyInfo.paymentInstructions}</p><div className="space-y-1"><div className="flex flex-wrap gap-x-4"><span><span className="font-bold text-gray-900">Bank:</span> {companyInfo.bankName}</span><span><span className="font-bold text-gray-900">Sort Code:</span> {companyInfo.sortCode}</span><span><span className="font-bold text-gray-900">Account No.:</span> {companyInfo.accountNo}</span></div><div className="flex flex-wrap gap-x-4"><span><span className="font-bold text-gray-900">Account Holder:</span> {companyInfo.accountHolder}</span><span><span className="font-bold text-gray-900">SWIFT:</span> {companyInfo.swift}</span></div><div><span className="font-bold text-gray-900">IBAN:</span> {companyInfo.iban}</div></div></div>
          )}
        </div>

        {(mode === 'invoice' || mode === 'receipt') && <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-[6px] ${statusColor} px-8 py-2 text-5xl font-black opacity-10 rotate-[-15deg] uppercase tracking-widest pointer-events-none whitespace-nowrap z-0`}>{statusText}</div>}
      </div>
    </div>
  );
};

export default DocumentLayout;
