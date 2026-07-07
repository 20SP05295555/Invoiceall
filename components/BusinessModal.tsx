
import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Building, Mail, Phone, Globe, MapPin, CreditCard, Upload, Trash2, Package, Plus } from 'lucide-react';
import { CompanyInfo } from '../types.ts';
import { COMPANY_INFO, COUNTRY_CURRENCY_OPTIONS } from '../constants.ts';

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, info: CompanyInfo) => void;
  initialData?: { name: string; info: CompanyInfo };
}

const BusinessModal: React.FC<BusinessModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [info, setInfo] = useState<CompanyInfo>(initialData?.info || { ...COMPANY_INFO });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('each');

  const handleAddDefaultProduct = () => {
    if (!newProdDesc.trim()) return;
    const prod = {
      id: `dp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      description: newProdDesc.trim(),
      price: parseFloat(newProdPrice) || 0,
      unit: newProdUnit.trim() || 'each'
    };
    setInfo(prev => ({
      ...prev,
      defaultProducts: [...(prev.defaultProducts || []), prod]
    }));
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdUnit('each');
  };

  const handleRemoveDefaultProduct = (id: string) => {
    setInfo(prev => ({
      ...prev,
      defaultProducts: (prev.defaultProducts || []).filter(p => p.id !== id)
    }));
  };

  // Sync state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setInfo(initialData?.info || { ...COMPANY_INFO });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name, info);
      // Reset after save to ensure fresh state for next time
      setName('');
      setInfo({ ...COMPANY_INFO });
      onClose();
    }
  };

  const updateField = (field: keyof CompanyInfo, value: any) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddress = [...info.address];
    newAddress[index] = value;
    updateField('address', newAddress);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isIbanShown = info.showIban !== undefined ? info.showIban : (Boolean(info.iban) || !info.routingNo);
  const isRoutingShown = info.showRoutingNo !== undefined ? info.showRoutingNo : (Boolean(info.routingNo) && !info.iban);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{initialData ? 'Edit Business' : 'Add New Business'}</h2>
              <p className="text-xs text-gray-500">Enter your company details below</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Logo Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-500" /> Business Logo
            </h3>
            <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden group"
              >
                {info.logoUrl ? (
                  <img src={info.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-indigo-500">
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] uppercase font-bold">Upload</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3 pt-1">
                <p className="text-xs text-gray-500">This logo will appear on your invoices, receipts and orders. PNG or JPG, max 2MB.</p>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Select Image
                  </button>
                  {info.logoUrl && (
                    <button 
                      type="button" 
                      onClick={() => updateField('logoUrl', '')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            </div>
          </section>

          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-500" /> General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Business Display Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. London Office"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Legal Company Name</label>
                <input 
                  type="text" 
                  value={info.name} 
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="HOB Furniture Ltd"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Registration Number</label>
                <input 
                  type="text" 
                  value={info.regNo} 
                  onChange={(e) => updateField('regNo', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Contact Person</label>
                <input 
                  type="text" 
                  value={info.contact} 
                  onChange={(e) => updateField('contact', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Full Name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Country & Operating Currency</span>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{info.currencyCode || 'GBP'} ({info.currencySymbol || '£'})</span>
                </label>
                <select 
                  value={info.country || 'United Kingdom'} 
                  onChange={(e) => {
                    const selectedCountry = e.target.value;
                    const match = COUNTRY_CURRENCY_OPTIONS.find(c => c.country === selectedCountry);
                    setInfo(prev => ({
                      ...prev,
                      country: selectedCountry,
                      currencyCode: match ? match.currencyCode : 'GBP',
                      currencySymbol: match ? match.currencySymbol : '£'
                    }));
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {COUNTRY_CURRENCY_OPTIONS.map(opt => (
                    <option key={opt.country} value={opt.country}>
                      {opt.country} — {opt.currencyCode} ({opt.currencySymbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" /> Contact & Web
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={info.email} 
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="office@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Website</label>
                <input 
                  type="text" 
                  value={info.website} 
                  onChange={(e) => updateField('website', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="www.company.com"
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" /> Business Address
            </h3>
            <div className="space-y-2">
              {info.address.map((line, i) => (
                <input 
                  key={i}
                  type="text" 
                  value={line} 
                  onChange={(e) => handleAddressChange(i, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={`Address Line ${i + 1}`}
                />
              ))}
            </div>
          </section>

          {/* Bank Info */}
          <section className="space-y-4 pb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" /> Bank Details (for Invoices)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bank Name</label>
                <input 
                  type="text" 
                  value={info.bankName} 
                  onChange={(e) => updateField('bankName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Account Holder Name</label>
                <input 
                  type="text" 
                  value={info.accountHolder} 
                  onChange={(e) => updateField('accountHolder', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. HOB FURNITURE LTD"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Account Number</label>
                <input 
                  type="text" 
                  value={info.accountNo || ''} 
                  onChange={(e) => updateField('accountNo', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Routing Number</label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isRoutingShown} 
                      onChange={() => {
                        if (!isRoutingShown) {
                          setInfo(prev => ({ ...prev, showRoutingNo: true, showIban: false }));
                        } else {
                          setInfo(prev => ({ ...prev, showRoutingNo: false }));
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Show on Document</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={info.routingNo || ''} 
                  onChange={(e) => updateField('routingNo', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 021000021"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sort Code</label>
                <input 
                  type="text" 
                  value={info.sortCode} 
                  onChange={(e) => updateField('sortCode', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">SWIFT / BIC</label>
                <input 
                  type="text" 
                  value={info.swift} 
                  onChange={(e) => updateField('swift', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. SUPAGB21XXX"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">IBAN</label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isIbanShown} 
                      onChange={() => {
                        if (!isIbanShown) {
                          setInfo(prev => ({ ...prev, showIban: true, showRoutingNo: false }));
                        } else {
                          setInfo(prev => ({ ...prev, showIban: false }));
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Show on Document</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={info.iban} 
                  onChange={(e) => updateField('iban', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Default Products / Services Catalog */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" /> Default Products & Price List
            </h3>
            <p className="text-xs text-gray-500">
              Save default products and prices so they can be selected quickly when creating invoices for this company.
            </p>
            <div className="space-y-2">
              {info.defaultProducts && info.defaultProducts.length > 0 ? (
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {info.defaultProducts.map((prod) => (
                    <div key={prod.id} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 transition">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{prod.description}</p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          {info.currencySymbol || '£'}{prod.price.toFixed(2)} / {prod.unit || 'each'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDefaultProduct(prod.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Remove default product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No default products saved yet.</p>
              )}

              {/* Add New Default Product Form */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    placeholder="Product / Service Description"
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Unit (pcs)"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    placeholder="Price"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddDefaultProduct}
                    className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* VAT & Delivery Options */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" /> Tax (VAT) & Delivery Cost Configuration
            </h3>
            <p className="text-xs text-gray-500">
              Configure whether VAT or Delivery costs should be charged when generating documents for this company.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
              {/* VAT Option */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(info.enableVat)}
                    onChange={(e) => updateField('enableVat', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-800">Charge VAT on Documents</span>
                </label>
                {info.enableVat && (
                  <div className="flex items-center gap-2 pl-6">
                    <span className="text-xs text-gray-600">VAT Rate (%):</span>
                    <input
                      type="number"
                      value={info.vatRate !== undefined ? info.vatRate : 20}
                      onChange={(e) => updateField('vatRate', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Option */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(info.enableDelivery)}
                    onChange={(e) => updateField('enableDelivery', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-800">Charge Delivery / Shipping Fee</span>
                </label>
                {info.enableDelivery && (
                  <div className="space-y-2 pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Cost ({info.currencySymbol || '£'}):</span>
                      <input
                        type="number"
                        value={info.deliveryCost !== undefined ? info.deliveryCost : 25}
                        onChange={(e) => updateField('deliveryCost', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Label (e.g. Standard Delivery)"
                        value={info.deliveryLabel || ''}
                        onChange={(e) => updateField('deliveryLabel', e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </form>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            {initialData ? 'Save Changes' : 'Create Business'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessModal;
