
import React, { useRef, useState } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { OrderItem } from '../types.ts';
import { extractDocReference, cleanPaymentInstructions } from '../constants.ts';
import { Image, Upload, Trash2, Plus, Cloud, Check, Camera, Loader2, Sparkles, FolderPlus, Package, Tag, Save } from 'lucide-react';

type DocumentMode = 'order' | 'invoice' | 'receipt';

interface DocumentLayoutProps {
  title: string;
  onTitleChange?: (val: string) => void;
  documentNumber: string;
  onDocumentNumberChange?: (val: string) => void;
  dateLabel: string;
  onDateLabelChange?: (val: string) => void;
  dateValue: string;
  onDateChange?: (val: string) => void;
  dueDateLabel?: string;
  onDueDateLabelChange?: (val: string) => void;
  dueDateValue: string;
  onDueDateChange?: (val: string) => void;
  customerNoLabel?: string;
  onCustomerNoLabelChange?: (val: string) => void;
  customerNoValue: string;
  onCustomerNoChange?: (val: string) => void;
  billToLabel?: string;
  onBillToLabelChange?: (val: string) => void;
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
  onTitleChange,
  documentNumber, 
  onDocumentNumberChange,
  dateLabel, 
  onDateLabelChange,
  dateValue,
  onDateChange,
  dueDateLabel = "Due Date",
  onDueDateLabelChange,
  dueDateValue,
  onDueDateChange,
  customerNoLabel = "Customer No.",
  onCustomerNoLabelChange,
  customerNoValue,
  onCustomerNoChange,
  billToLabel = "Bill to",
  onBillToLabelChange,
  children,
  mode,
  isEditing = false
}) => {
  const { 
    companyInfo, updateCompanyInfo, 
    customer, updateCustomer, 
    order, updateOrder, updateOrderItem,
    addOrderItem, removeOrderItem, updateAmountPaid,
    addGalleryItem, addSavedDocument,
    isAutoSaving, currencySymbol, currencyCode
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isArchivedNotification, setIsArchivedNotification] = useState(false);

  const [customDesc, setCustomDesc] = useState('');
  const [customUnit, setCustomUnit] = useState('each');
  const [customPrice, setCustomPrice] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [selectedDefaultId, setSelectedDefaultId] = useState('');

  const handleAddCustomItem = () => {
    if (!customDesc.trim()) return;
    const priceNum = parseFloat(customPrice) || 0;
    addOrderItem(customDesc.trim(), priceNum, customUnit.trim() || 'each');
    
    if (saveAsDefault) {
      const newDefault = {
        id: `dp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        description: customDesc.trim(),
        price: priceNum,
        unit: customUnit.trim() || 'each'
      };
      updateCompanyInfo({
        ...companyInfo,
        defaultProducts: [...(companyInfo.defaultProducts || []), newDefault]
      });
    }
    setCustomDesc('');
    setCustomPrice('');
    setCustomUnit('each');
    setSaveAsDefault(false);
  };

  const handleSelectDefaultProduct = (prodId: string) => {
    setSelectedDefaultId(prodId);
    if (!prodId) return;
    const found = companyInfo.defaultProducts?.find(p => p.id === prodId);
    if (found) {
      addOrderItem(found.description, found.price, found.unit || 'each', found.details);
      setSelectedDefaultId('');
    }
  };

  const handleArchiveDoc = () => {
    addSavedDocument({
      documentNumber: documentNumber || order.orderNumber || 'DOC-001',
      title: `${title} #${documentNumber || order.orderNumber}`,
      type: (mode as any) || 'confirmation',
      amount: order.total || 0,
      customerName: customer.name || 'Customer',
      itemsCount: order.items.length || 1,
      tags: [mode || 'document', 'active-snapshot'],
      notes: `Saved snapshot of ${title} #${documentNumber} to Document Vault.`,
      snapshotData: {
        order: { ...order },
        customer: { ...customer },
        companyInfo: { ...companyInfo }
      }
    });
    setIsArchivedNotification(true);
    setTimeout(() => setIsArchivedNotification(false), 3000);
  };

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

  const isIbanShown = companyInfo.showIban !== undefined ? companyInfo.showIban : (Boolean(companyInfo.iban) || !companyInfo.routingNo);
  const isRoutingShown = companyInfo.showRoutingNo !== undefined ? companyInfo.showRoutingNo : (Boolean(companyInfo.routingNo) && !companyInfo.iban);

  const autoDocRef = extractDocReference(documentNumber || order.orderNumber);
  const effectivePaymentRef = order.paymentReference !== undefined && order.paymentReference !== ''
    ? order.paymentReference
    : autoDocRef;

  return (
    <div className="relative">
      {/* Floating Buttons */}
      {!isEditing && (
        <div className="absolute -right-4 top-0 transform translate-x-full flex flex-col gap-3 z-20 print:hidden">
          <button 
            onClick={handleCapture}
            disabled={isCapturing}
            className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all text-indigo-600 dark:text-indigo-400 group relative"
            title="Snap to Gallery"
          >
            {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Snap to Gallery</span>
          </button>

          <button 
            onClick={handleArchiveDoc}
            className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all text-blue-600 dark:text-blue-400 group relative"
            title="Save to Document Vault"
          >
            <FolderPlus className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Archive Document</span>
          </button>
        </div>
      )}

      {isArchivedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce print:hidden">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Document saved to {companyInfo.name}'s Vault for life!</span>
        </div>
      )}

      {/* Prominent Lifetime Save & Vault Action Bar */}
      <div className="max-w-4xl mx-auto mb-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              Lifetime Document Vault ({companyInfo.name})
            </h4>
            <p className="text-[11px] text-indigo-200">
              Save this document permanently to {companyInfo.name}'s vault. Saved for life & deletable anytime.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleArchiveDoc}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save to Vault
          </button>
          {!isEditing && (
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
              title="Snap to Gallery"
            >
              {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              <span>Snap</span>
            </button>
          )}
        </div>
      </div>

      <div ref={docRef} className="w-full max-w-4xl mx-auto p-4 sm:p-8 md:p-12 shadow-lg min-h-0 sm:min-h-[800px] text-gray-800 font-sans relative print:shadow-none print:max-w-none print:mx-0 print:min-h-0 print:p-8 group" style={{ backgroundColor: companyInfo.documentBgColor || '#ffffff' }}>
        {companyInfo.templateDesign === 'modern' && (
          <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6 rounded-full"></div>
        )}
        {companyInfo.templateDesign === 'usa' && (
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-800 bg-indigo-50 border-b border-indigo-200 px-3 py-1 mb-4 inline-block rounded">
            USA Commercial Invoice Standard • Terms: Net 30
          </div>
        )}
        {companyInfo.templateDesign === 'uk' && (
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 border-b border-emerald-200 px-3 py-1 mb-4 inline-block rounded">
            UK HMRC VAT Compliant Document
          </div>
        )}
        {companyInfo.templateDesign === 'canada' && (
          <div className="text-[10px] font-black uppercase tracking-widest text-red-800 bg-red-50 border-b border-red-200 px-3 py-1 mb-4 inline-block rounded">
            Canada GST/HST Commercial Invoice / Facture
          </div>
        )}
        
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
                <div className="space-y-1">
                  {companyInfo.address.map((line, i) => (
                    <div key={`company-addr-edit-${i}`} className="flex gap-2 items-center group/addr">
                      <EditableInput value={line} onChange={(v: string) => handleAddressChange(i, v, true)} className="text-sm text-gray-500" placeholder="Address Line" />
                      <button onClick={() => {
                        const newAddr = companyInfo.address.filter((_, idx) => idx !== i);
                        updateCompanyInfo({ ...companyInfo, address: newAddr });
                      }} className="text-red-200 hover:text-red-500 opacity-0 group-hover/addr:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => updateCompanyInfo({ ...companyInfo, address: [...companyInfo.address, ""] })} className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"><Plus className="w-3 h-3" /> Add Address Line</button>
                </div>
                <EditableInput value={companyInfo.name} onChange={(v: string) => updateCompanyInfo({...companyInfo, name: v})} className="text-2xl font-bold uppercase text-black mt-2" placeholder="Company Name" />
              </div>
            ) : (
              <>
                <h2 className="text-sm font-medium text-gray-500 mb-1">{companyInfo.contact}</h2>
                <p className="text-sm text-gray-500 mb-4">{companyInfo.address.join(' - ')}</p>
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
                      <span>VAT No.:</span>
                      <EditableInput value={companyInfo.vatNo || ''} onChange={(v: string) => updateCompanyInfo({...companyInfo, vatNo: v})} className="w-full max-w-[140px]" align="right" placeholder="VAT No." />
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
                {companyInfo.vatNo ? <p>VAT No.: {companyInfo.vatNo}</p> : null}
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
                      <EditableInput 
                        value={billToLabel} 
                        onChange={onBillToLabelChange} 
                        className="font-bold text-gray-900 block mb-1" 
                        placeholder="Label (e.g. Bill to)" 
                      />
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
              <span className="font-bold text-gray-900 shrink-0">
                {isEditing && onTitleChange ? <EditableInput value={title} onChange={onTitleChange} className="w-24" /> : <>{title}:</>}
              </span>
              {isEditing && onDocumentNumberChange ? (
                <EditableInput 
                  value={documentNumber} 
                  onChange={(v: string) => {
                    onDocumentNumberChange(v);
                    updateOrder({ ...order, orderNumber: v, paymentReference: extractDocReference(v) });
                  }} 
                  className="w-full sm:w-32" 
                  align="right" 
                />
              ) : (
                <span className="text-gray-700">{documentNumber}</span>
              )}
            </div>
            <div className="mb-2 flex justify-start sm:justify-end items-center gap-2">
              <span className="font-bold text-gray-900 shrink-0">
                {isEditing && onDateLabelChange ? <EditableInput value={dateLabel} onChange={onDateLabelChange} className="w-32 text-right" /> : <>{dateLabel}:</>}
              </span>
              {isEditing && onDateChange ? <EditableInput value={dateValue} onChange={onDateChange} className="w-full sm:w-32" align="right" /> : <span className="text-gray-700">{dateValue}</span>}
            </div>
            <div className="mb-2 flex justify-start sm:justify-end items-center gap-2">
              <span className="font-bold text-gray-900 shrink-0">
                {isEditing && onDueDateLabelChange ? <EditableInput value={dueDateLabel} onChange={onDueDateLabelChange} className="w-32 text-right" /> : <>{dueDateLabel}:</>}
              </span>
              {isEditing && onDueDateChange ? <EditableInput value={dueDateValue} onChange={onDueDateChange} className="w-full sm:w-32" align="right" /> : <span className="text-gray-700">{dueDateValue}</span>}
            </div>
            <div className="flex justify-start sm:justify-end items-center gap-2">
              <span className="font-bold text-gray-900 shrink-0">
                {isEditing && onCustomerNoLabelChange ? <EditableInput value={customerNoLabel} onChange={onCustomerNoLabelChange} className="w-32 text-right" /> : <>{customerNoLabel}:</>}
              </span>
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
            <div className="mt-6 bg-gray-50/90 dark:bg-slate-800/80 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-700 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-slate-700 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Add Products to Document ({companyInfo.name})
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select from {companyInfo.name}'s default products or add a custom item
                  </p>
                </div>
              </div>

              {/* Default Saved Products Selector */}
              {companyInfo.defaultProducts && companyInfo.defaultProducts.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" /> Select Default Product
                    </label>
                    <select
                      value={selectedDefaultId}
                      onChange={(e) => handleSelectDefaultProduct(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">-- Choose saved product to add --</option>
                      {companyInfo.defaultProducts.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.description} — {currencySymbol}{prod.price.toFixed(2)} ({prod.unit || 'each'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {companyInfo.defaultProducts.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => addOrderItem(prod.description, prod.price, prod.unit || 'each', prod.details)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-xs font-medium border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-xs group"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                        <span>{prod.description}</span>
                        <span className="font-mono bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-[11px] font-bold">
                          {currencySymbol}{prod.price.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                  No default products configured for {companyInfo.name}. You can save custom products below or manage default products in Account Settings / Business Profile.
                </div>
              )}

              {/* Custom Product Selection Option */}
              <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
                  Custom Product Selection / Add New Item
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Custom product or service description..."
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Unit (e.g. pcs)"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">{currencySymbol}</span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-6 pr-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Product
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveAsDefaultProduct"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="saveAsDefaultProduct" className="text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                    Save this custom product as a default item in <span className="font-bold">{companyInfo.name}</span>'s catalog
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-12">
          {/* Editing Toggles for VAT & Delivery */}
          <div className="w-full sm:w-1/2">
            {isEditing && (
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Document Tax & Delivery Options</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={Boolean(companyInfo.enableVat)}
                      onChange={(e) => updateCompanyInfo({ ...companyInfo, enableVat: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span>Charge VAT ({companyInfo.vatRate ?? 20}%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={Boolean(companyInfo.enableDelivery)}
                      onChange={(e) => updateCompanyInfo({ ...companyInfo, enableDelivery: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span>Charge Delivery ({currencySymbol}{companyInfo.deliveryCost ?? 25})</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="w-full sm:w-1/2 max-w-xs ml-auto">
            <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-600 text-[11px] sm:text-sm">Subtotal without VAT</span><span className="font-mono text-gray-900 text-[11px] sm:text-sm">{currencySymbol}{order.subtotal.toFixed(2)}</span></div>
            
            {(companyInfo.enableVat || order.tax > 0) && (
              <div className="flex justify-between py-2 border-b border-gray-200 text-indigo-900 bg-indigo-50/50 -mx-2 px-2 rounded">
                <span className="text-[11px] sm:text-sm font-medium">VAT ({companyInfo.vatRate ?? 20}%)</span>
                <span className="font-mono font-bold text-[11px] sm:text-sm">{currencySymbol}{order.tax.toFixed(2)}</span>
              </div>
            )}

            {(companyInfo.enableDelivery || (order.shipping && order.shipping > 0)) && (
              <div className="flex justify-between py-2 border-b border-gray-200 text-emerald-900 bg-emerald-50/50 -mx-2 px-2 rounded">
                <span className="text-[11px] sm:text-sm font-medium">{companyInfo.deliveryLabel || 'Delivery Fee'}</span>
                <span className="font-mono font-bold text-[11px] sm:text-sm">{currencySymbol}{(order.shipping ?? companyInfo.deliveryCost ?? 0).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b border-gray-200"><span className="font-bold text-gray-900 text-[11px] sm:text-sm">Total {currencyCode}</span><span className="font-bold font-mono text-gray-900 text-[11px] sm:text-sm">{currencySymbol}{order.total.toFixed(2)}</span></div>
            <div className={`flex justify-between py-2 text-[11px] sm:text-sm ${isEditing ? 'bg-yellow-50/50 -mx-2 px-2 rounded' : ''}`}><span className="text-gray-600">Amount Paid</span><span className="font-mono text-gray-900">{isEditing ? <EditableInput type="number" value={order.amountPaid} onChange={(v: string) => updateAmountPaid(parseFloat(v) || 0)} className="w-24 font-bold" align="right" /> : (mode === 'order' && order.amountPaid === 0 ? `${currencySymbol}0.00` : `-${currencySymbol}${order.amountPaid.toFixed(2)}`)}</span></div>
            <div className="flex justify-between py-2 border-t border-black mt-2"><span className="font-bold text-gray-900 text-[11px] sm:text-sm">Amount Due ({currencyCode})</span><span className="font-bold font-mono text-gray-900 text-[11px] sm:text-sm">{currencySymbol}{order.amountDue.toFixed(2)}</span></div>
          </div>
        </div>

        {children}
        
        <div className="mt-auto pt-8 border-t border-gray-100">
          <h4 className="font-bold text-sm text-gray-900 mb-2">Terms & Conditions</h4>
          {isEditing ? <EditableTextArea value={companyInfo.terms} onChange={(v: string) => updateCompanyInfo({...companyInfo, terms: v})} className="text-sm text-gray-600 mb-4" /> : <p className="text-sm text-gray-600 mb-4">{companyInfo.terms}</p>}
          <h4 className="font-bold text-sm text-gray-900 mb-2">Payment Instructions</h4>
          {isEditing ? (
            <div className="space-y-4">
                <EditableTextArea value={cleanPaymentInstructions(companyInfo.paymentInstructions)} onChange={(v: string) => updateCompanyInfo({...companyInfo, paymentInstructions: v})} className="text-sm text-gray-600" />
                
                <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-indigo-950 uppercase tracking-tight flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" /> Payment Reference No. (Auto-Synced with Document No.)
                    </label>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded border border-indigo-200">Editable</span>
                  </div>
                  <EditableInput 
                    value={effectivePaymentRef} 
                    onChange={(v: string) => updateOrder({ ...order, paymentReference: v })} 
                    className="font-mono font-bold text-indigo-950 bg-white px-2.5 py-1.5 border border-indigo-300 rounded text-sm shadow-sm" 
                    placeholder="e.g. 2026- 547"
                  />
                  <p className="text-[11px] text-indigo-700/80">
                    Automatically extracts number from document ({documentNumber || order.orderNumber}) when changed. You can also edit it manually here.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {['bankName', 'accountHolder', 'accountNo', 'sortCode', 'swift'].map(f => (
                    <div key={f}>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">{f.replace(/([A-Z])/g, ' $1')}</label>
                      <EditableInput value={(companyInfo as any)[f]} onChange={(v: string) => updateCompanyInfo({...companyInfo, [f]: v})} />
                    </div>
                  ))}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-tighter">Routing No</label>
                      <label className="flex items-center gap-1 text-[11px] font-bold text-blue-600 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isRoutingShown} 
                          onChange={() => {
                            if (!isRoutingShown) {
                              updateCompanyInfo({ ...companyInfo, showRoutingNo: true, showIban: false });
                            } else {
                              updateCompanyInfo({ ...companyInfo, showRoutingNo: false });
                            }
                          }}
                          className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 cursor-pointer"
                        />
                        <span>Show</span>
                      </label>
                    </div>
                    <EditableInput value={companyInfo.routingNo || ''} onChange={(v: string) => updateCompanyInfo({...companyInfo, routingNo: v})} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-tighter">IBAN</label>
                      <label className="flex items-center gap-1 text-[11px] font-bold text-blue-600 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isIbanShown} 
                          onChange={() => {
                            if (!isIbanShown) {
                              updateCompanyInfo({ ...companyInfo, showIban: true, showRoutingNo: false });
                            } else {
                              updateCompanyInfo({ ...companyInfo, showIban: false });
                            }
                          }}
                          className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 cursor-pointer"
                        />
                        <span>Show</span>
                      </label>
                    </div>
                    <EditableInput value={companyInfo.iban || ''} onChange={(v: string) => updateCompanyInfo({...companyInfo, iban: v})} />
                  </div>
                </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {companyInfo.paymentInstructions && <p className="mb-3">{cleanPaymentInstructions(companyInfo.paymentInstructions)}</p>}
              
              <div className="mb-3 p-2.5 bg-indigo-50/60 dark:bg-slate-800/60 rounded-lg border border-indigo-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-gray-900 dark:text-gray-200 text-xs sm:text-sm flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Payment Reference No.:
                </span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-sm sm:text-base bg-white dark:bg-slate-900 px-3 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 shadow-sm tracking-wide">
                  {effectivePaymentRef}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap gap-x-4">
                  {companyInfo.bankName && <span><span className="font-bold text-gray-900">Bank:</span> {companyInfo.bankName}</span>}
                  {companyInfo.accountHolder && <span><span className="font-bold text-gray-900">Account Holder:</span> {companyInfo.accountHolder}</span>}
                  {companyInfo.accountNo && <span><span className="font-bold text-gray-900">Account No.:</span> {companyInfo.accountNo}</span>}
                </div>
                <div className="flex flex-wrap gap-x-4">
                  {companyInfo.routingNo && isRoutingShown && <span><span className="font-bold text-gray-900">Routing No.:</span> {companyInfo.routingNo}</span>}
                  {companyInfo.sortCode && <span><span className="font-bold text-gray-900">Sort Code:</span> {companyInfo.sortCode}</span>}
                  {companyInfo.swift && <span><span className="font-bold text-gray-900">SWIFT:</span> {companyInfo.swift}</span>}
                </div>
                {companyInfo.iban && isIbanShown && <div><span className="font-bold text-gray-900">IBAN:</span> {companyInfo.iban}</div>}
              </div>
            </div>
          )}
        </div>

        {companyInfo.enableSignature && (
          <div className="flex flex-col sm:flex-row justify-between items-end mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex-1"></div>
            <div className="text-center sm:text-right min-w-[220px]">
              <div className="font-signature text-3xl sm:text-4xl text-indigo-950 dark:text-indigo-900 font-bold transform -rotate-3 mb-1 select-none">
                {companyInfo.signatureText || companyInfo.contact || companyInfo.name}
              </div>
              <div className="border-t-2 border-gray-400 pt-1.5 inline-block min-w-[190px]">
                <p className="text-xs font-bold text-gray-800">
                  {companyInfo.signatureText || companyInfo.contact || companyInfo.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  {companyInfo.signatureTitle || 'Authorized Signatory'}
                </p>
              </div>
            </div>
          </div>
        )}

        {(mode === 'invoice' || mode === 'receipt') && <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-[6px] ${statusColor} px-8 py-2 text-5xl font-black opacity-10 rotate-[-15deg] uppercase tracking-widest pointer-events-none whitespace-nowrap z-0`}>{statusText}</div>}
      </div>
    </div>
  );
};

export default DocumentLayout;
